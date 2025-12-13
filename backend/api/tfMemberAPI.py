import os
import requests
from dotenv import load_dotenv
from pathlib import Path
from flask import Flask, jsonify, request
from flask_cors import CORS

# Last inn environment variabler fra rotmappen
root_dir = Path(__file__).parent.parent.parent
env_path = root_dir / '.env'
load_dotenv(dotenv_path=env_path)

# Hent API-nøkler fra .env fil
consumer_key = os.getenv('consumer_key')
consumer_secret = os.getenv('consumer_secret')

# API URL
base_url = 'https://ntnui.no/toppturogfrikjoring/wp-json/wc/v3/orders'

# Opprett Flask app
app = Flask(__name__)
CORS(app)  # Tillat CORS for frontend

def get_orders(product_id=4223):
    """
    Henter ordre fra WooCommerce API og returnerer som liste
    
    Args:
        product_id: Produkt-ID for å filtrere ordre (standard: 4223)
    
    Returns:
        Liste med ordre-data
    """
    try:
        # API-kall med autentisering
        response = requests.get(
            base_url,
            auth=(consumer_key, consumer_secret),
            params={'product': product_id}
        )
        
        # Sjekk om forespørselen var vellykket
        response.raise_for_status()
        
        # Returner data som liste
        orders = response.json()
        print(f"Hentet {len(orders)} ordre")
        return orders
        
    except requests.exceptions.RequestException as e:
        print(f"Feil ved API-kall: {e}")
        return []

def create_member_dict(orders_list):
    """
    Lager et dictionary med telefonnummer som nøkkel og medlemsinfo som verdi
    
    Args:
        orders_list: Liste med ordre-data fra API
    
    Returns:
        Dictionary med telefonnummer som nøkkel og liste med medlemskap-records
    """
    from datetime import datetime, timedelta
    
    member_dict = {}
    one_year_ago = datetime.now() - timedelta(days=365)
    
    for order in orders_list:
        # Hent telefonnummer fra billing
        phone = order.get('billing', {}).get('phone', '')
        
        # Hent andre verdier
        first_name = order.get('billing', {}).get('first_name', '')
        last_name = order.get('billing', {}).get('last_name', '')
        date_paid = order.get('date_paid', '')
        
        # Hent produktnavn fra line_items (første item)
        line_items = order.get('line_items', [])
        product_name = line_items[0].get('name', '') if line_items else ''
        
        if phone and date_paid:
            # Sjekk om medlemskapet er gyldig (innen siste 365 dager)
            try:
                paid_date = datetime.fromisoformat(date_paid.replace('Z', '+00:00'))
                is_valid = paid_date >= one_year_ago
            except:
                is_valid = False
            
            membership = {
                'first_name': first_name,
                'last_name': last_name,
                'product_name': product_name,
                'date_paid': date_paid,
                'is_valid': is_valid
            }
            
            # Legg til medlemskap i liste (støtter flere medlemskap per person)
            if phone not in member_dict:
                member_dict[phone] = []
            member_dict[phone].append(membership)
    
    # Sorter medlemskap per person med nyeste først
    for phone in member_dict:
        member_dict[phone].sort(
            key=lambda x: x['date_paid'],
            reverse=True
        )
    
    return member_dict

@app.route('/api/check-membership', methods=['POST'])
def check_membership_endpoint():
    """
    API endpoint for å sjekke medlemskap basert på telefonnummer
    Forventer JSON: {"phone": "+4712345678"}
    """
    try:
        data = request.get_json()
        phone = data.get('phone', '')
        
        if not phone:
            return jsonify({
                'success': False,
                'error': 'Telefonnummer mangler'
            }), 400
        
        # Hent alle ordre
        orders_list = get_orders()
        
        # Lag medlems-dictionary
        member_dict = create_member_dict(orders_list)
        
        # Sjekk om telefonnummer finnes
        if phone in member_dict:
            memberships = member_dict[phone]
            current_membership = memberships[0]  # Nyeste medlemskap
            has_valid_membership = any(m['is_valid'] for m in memberships)
            valid_membership = next((m for m in memberships if m['is_valid']), current_membership)
            
            response_data = {
                'success': has_valid_membership,
                'data': {
                    'phone': phone,
                    'name': f"{valid_membership['first_name']} {valid_membership['last_name']}",
                    'first_name': valid_membership['first_name'],
                    'last_name': valid_membership['last_name'],
                    'product': valid_membership['product_name'],
                    'date_paid': valid_membership['date_paid'],
                    'is_valid': valid_membership['is_valid'],
                    'membership_status': 'active' if valid_membership['is_valid'] else 'expired',
                    'total_memberships': len(memberships),
                    'all_memberships': [
                        {
                            'date_paid': m['date_paid'],
                            'product': m['product_name'],
                            'is_valid': m['is_valid']
                        } for m in memberships
                    ]
                }
            }
            
            if not has_valid_membership:
                response_data['error'] = 'Medlemskap utgått'
            
            return jsonify(response_data), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Ikke medlem - telefonnummer ikke funnet'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/batch-check-membership', methods=['POST'])
def batch_check_membership_endpoint():
    """
    API endpoint for å sjekke flere medlemskap på en gang
    Forventer JSON: {"phones": ["+4712345678", "+4787654321"]}
    """
    try:
        data = request.get_json()
        phones = data.get('phones', [])
        
        if not phones:
            return jsonify({
                'success': False,
                'error': 'Ingen telefonnumre oppgitt'
            }), 400
        
        # Hent alle ordre én gang
        orders_list = get_orders()
        member_dict = create_member_dict(orders_list)
        
        # Sjekk alle telefonnumre
        results = {}
        for phone in phones:
            if phone in member_dict:
                memberships = member_dict[phone]
                current_membership = memberships[0]  # Nyeste medlemskap
                has_valid_membership = any(m['is_valid'] for m in memberships)
                valid_membership = next((m for m in memberships if m['is_valid']), current_membership)
                
                phone_result = {
                    'success': has_valid_membership,
                    'data': {
                        'phone': phone,
                        'name': f"{valid_membership['first_name']} {valid_membership['last_name']}",
                        'first_name': valid_membership['first_name'],
                        'last_name': valid_membership['last_name'],
                        'product': valid_membership['product_name'],
                        'date_paid': valid_membership['date_paid'],
                        'is_valid': valid_membership['is_valid'],
                        'membership_status': 'active' if valid_membership['is_valid'] else 'expired',
                        'total_memberships': len(memberships),
                        'all_memberships': [
                            {
                                'date_paid': m['date_paid'],
                                'product': m['product_name'],
                                'is_valid': m['is_valid']
                            } for m in memberships
                        ]
                    }
                }
                
                if not has_valid_membership:
                    phone_result['error'] = 'Medlemskap utgått'
                
                results[phone] = phone_result
            else:
                results[phone] = {
                    'success': False,
                    'error': 'Ikke medlem'
                }
        
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == "__main__":
    # Kjør Flask server
    print("Starting TF Member API server...")
    print(f"Consumer key lastet: {'Ja' if consumer_key else 'Nei'}")
    print(f"Consumer secret lastet: {'Ja' if consumer_secret else 'Nei'}")
    app.run(debug=True, port=5000)
