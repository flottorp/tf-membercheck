import type { VercelRequest, VercelResponse } from '@vercel/node';

// 🚀 CACHE: Lagre resultater i minnet
interface CacheEntry {
  data: OrderData[];
  timestamp: number;
}

let ordersCache: CacheEntry | null = null;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutter

/**
 * Normaliserer telefonnummer til et konsistent format for matching
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Fjern alle mellomrom, bindestreker og parenteser
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  
  // Fjern ledende pluss
  normalized = normalized.replace(/^\+/, '');
  
  // Håndter norske nummer som starter med 0047
  if (normalized.startsWith('0047')) {
    normalized = '47' + normalized.substring(4);
  }
  
  // Hvis nummer starter med 0 (ofte norsk format), fjern 0 og legg til 47
  if (normalized.startsWith('0') && normalized.length === 9) {
    normalized = '47' + normalized.substring(1);
  }
  
  // Hvis nummer er 8 siffer og ser ut som norsk, legg til 47
  if (normalized.length === 8 && /^[4-9]/.test(normalized)) {
    normalized = '47' + normalized;
  }
  
  return normalized;
}

interface OrderData {
  billing: {
    phone: string;
    first_name: string;
    last_name: string;
  };
  date_paid: string;
  line_items: Array<{
    name: string;
  }>;
}

interface MembershipRecord {
  firstName: string;
  lastName: string;
  productName: string;
  datePaid: string;
  isValid: boolean;
}

interface MemberDict {
  [phone: string]: MembershipRecord[];
}

async function getOrders(productId: number = 4223, useCache: boolean = true): Promise<OrderData[]> {
  const startTime = Date.now();
  
  // 🚀 Sjekk cache først
  if (useCache && ordersCache) {
    const age = Date.now() - ordersCache.timestamp;
    if (age < CACHE_DURATION_MS) {
      const cacheAge = (age / 1000).toFixed(1);
      console.log(`✅ Bruker cached data (${cacheAge}s gammel, ${ordersCache.data.length} ordre)`);
      return ordersCache.data;
    } else {
      console.log(`⏰ Cache utløpt (${(age / 60000).toFixed(1)} min gammel)`);
    }
  }
  
  const consumerKey = process.env.consumer_key;
  const consumerSecret = process.env.consumer_secret;
  
  if (!consumerKey || !consumerSecret) {
    throw new Error('API credentials not configured');
  }
  
  const baseUrl = 'https://ntnui.no/toppturogfrikjoring/wp-json/wc/v3/orders';
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  
  try {
    let allOrders: OrderData[] = [];
    let page = 1;
    let hasMore = true;
    const perPage = 100; // Max allowed by WooCommerce
    
    console.log(`🔄 Henter fresh data fra WooCommerce...`);
    
    while (hasMore) {
      const response = await fetch(`${baseUrl}?product=${productId}&per_page=${perPage}&page=${page}`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`WooCommerce API returned status ${response.status}`);
      }
      
      const orders = await response.json() as OrderData[];
      allOrders = allOrders.concat(orders);
      
      console.log(`  📄 Side ${page}: ${orders.length} ordre (totalt: ${allOrders.length})`);
      
      // If we got fewer orders than perPage, we've reached the end
      if (orders.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    }
    
    // 🚀 Lagre i cache
    ordersCache = {
      data: allOrders,
      timestamp: Date.now()
    };
    
    const duration = Date.now() - startTime;
    console.log(`✅ getOrders() ferdig: ${allOrders.length} ordre på ${duration}ms (${(duration/1000).toFixed(2)}s)`);
    console.log(`   💾 Data cachet for ${CACHE_DURATION_MS / 60000} minutter`);
    
    return allOrders;
  } catch (error) {
    console.error('Feil ved API-kall:', error);
    return [];
  }
}

function createMemberDict(ordersList: OrderData[]): MemberDict {
  const startTime = Date.now();
  const memberDict: MemberDict = {};
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  for (const order of ordersList) {
    const phone = order.billing?.phone || '';
    const firstName = order.billing?.first_name || '';
    const lastName = order.billing?.last_name || '';
    const datePaid = order.date_paid || '';
    
    const lineItems = order.line_items || [];
    const productName = lineItems.length > 0 ? lineItems[0].name : '';
    
    if (phone && datePaid) {
      // Normaliser telefonnummer for konsistent matching
      const normalizedPhone = normalizePhoneNumber(phone);
      
      // Sjekk om medlemskapet er gyldig (innen siste 365 dager)
      const paidDate = new Date(datePaid);
      const isValid = paidDate >= oneYearAgo;
      
      const membership: MembershipRecord = {
        firstName,
        lastName,
        productName,
        datePaid,
        isValid,
      };
      
      // Legg til medlemskap i array (støtter flere medlemskap per person)
      if (!memberDict[normalizedPhone]) {
        memberDict[normalizedPhone] = [];
      }
      memberDict[normalizedPhone].push(membership);
    }
  }
  
  // Sorter medlemskap per person med nyeste først
  for (const phone in memberDict) {
    memberDict[phone].sort((a, b) => 
      new Date(b.datePaid).getTime() - new Date(a.datePaid).getTime()
    );
  }
  
  const uniquePhones = Object.keys(memberDict).length;
  const validMembers = Object.values(memberDict).filter(memberships => 
    memberships.some(m => m.isValid)
  ).length;
  
  const duration = Date.now() - startTime;
  console.log(`✅ createMemberDict() ferdig: ${uniquePhones} unike telefonnummer på ${duration}ms`);
  console.log(`   └─ ${validMembers} gyldige medlemskap`);
  
  return memberDict;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const requestStartTime = Date.now();
  
  // Tillat kun POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }
  
  try {
    const { phones } = req.body;
    
    if (!phones || !Array.isArray(phones)) {
      return res.status(400).json({
        success: false,
        error: 'Ingen telefonnumre oppgitt'
      });
    }
    
    console.log(`🔍 Sjekker ${phones.length} telefonnumre...`);
    
    // Hent alle ordre én gang
    const ordersList = await getOrders();
    const memberDict = createMemberDict(ordersList);
    
    // 🚀 OPTIMALISERING: O(n) lookup istedenfor O(n×m)
    const lookupStartTime = Date.now();
    const results: Record<string, any> = {};
    
    for (const phone of phones) {
      const normalizedInput = normalizePhoneNumber(phone);
      
      // Direkte O(1) dictionary lookup!
      const memberships = memberDict[normalizedInput];
      
      if (memberships) {
        const currentMembership = memberships[0]; // Nyeste medlemskap
        const hasValidMembership = memberships.some(m => m.isValid);
        const validMembership = memberships.find(m => m.isValid) || currentMembership;
        
        results[phone] = {
          success: hasValidMembership,
          data: {
            phone: normalizedInput,
            name: `${validMembership.firstName} ${validMembership.lastName}`,
            first_name: validMembership.firstName,
            last_name: validMembership.lastName,
            product: validMembership.productName,
            date_paid: validMembership.datePaid,
            is_valid: validMembership.isValid,
            membership_status: validMembership.isValid ? 'active' : 'expired',
            total_memberships: memberships.length,
            all_memberships: memberships.map(m => ({
              date_paid: m.datePaid,
              product: m.productName,
              is_valid: m.isValid
            }))
          },
          ...(hasValidMembership ? {} : { error: 'Medlemskap utgått' })
        };
      } else {
        results[phone] = {
          success: false,
          error: 'Ikke medlem'
        };
      }
    }
    
    const lookupDuration = Date.now() - lookupStartTime;
    const totalDuration = Date.now() - requestStartTime;
    const wasFromCache = ordersCache && (Date.now() - ordersCache.timestamp < CACHE_DURATION_MS);
    
    console.log(`✅ Lookup ferdig: ${phones.length} telefonnumre på ${lookupDuration}ms`);
    console.log(`⏱️  Total request tid: ${totalDuration}ms (${(totalDuration/1000).toFixed(2)}s)`);
    console.log(`   ├─ Data source: ${wasFromCache ? '💾 Cache' : '🔄 Fresh API call'}`);
    console.log(`   └─ Lookup: ${lookupDuration}ms (${(lookupDuration/phones.length).toFixed(2)}ms per nummer)`);
    
    return res.status(200).json(results);
    
  } catch (error) {
    console.error('Error in batch-check-membership:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
