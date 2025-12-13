# Deployment til Vercel - Serverless Functions

Dette prosjektet bruker Vercel Serverless Functions for backend API-et.

## Struktur

```
api/
├── check-membership.ts        → /api/check-membership
└── batch-check-membership.ts  → /api/batch-check-membership
```

## Setup på Vercel

### 1. Deploy prosjektet

```bash
# Installer Vercel CLI (om du ikke har det)
npm i -g vercel

# Deploy
vercel
```

### 2. Legg til miljøvariabler

Gå til Vercel Dashboard → ditt prosjekt → Settings → Environment Variables

Legg til:
- `consumer_key` = din WooCommerce consumer key
- `consumer_secret` = din WooCommerce consumer secret

**Viktig:** Velg alle miljøer (Production, Preview, Development)

### 3. Redeploy

Etter du har lagt til miljøvariablene, redeploy:

```bash
vercel --prod
```

## Hvordan det fungerer

1. **Frontend** kaller `/api/check-membership` eller `/api/batch-check-membership`
2. **Vercel** ruter requesten til riktig TypeScript-fil i `api/` mappen
3. **Serverless function** starter opp, kjører koden, og returnerer resultat
4. **Funksjonen stenger ned** etter request er ferdig

## Testing lokalt

```bash
# Installer Vercel CLI
npm i -g vercel

# Kjør dev-server (dette starter både frontend og API)
vercel dev
```

## Fordeler

✅ Helt gratis på Vercel's gratis plan
✅ Automatisk skalering
✅ Ingen server å vedlikeholde
✅ Samme domene for frontend og backend (ingen CORS)
✅ Sikker lagring av API-nøkler

## API Endpoints

### POST /api/check-membership
Sjekker medlemskap for ett telefonnummer. Ingen autentisering nødvendig fra frontend - API-nøkler ligger trygt på serveren.

```json
Request: {"phone": "+4712345678"}
Response: {
  "success": true,
  "data": {
    "phone": "+4712345678",
    "name": "Fornavn Etternavn",
    "product": "Medlemskap...",
    "date_paid": "2025-11-03T17:36:00"
  }
}
```

### POST /api/batch-check-membership
Sjekker flere telefonnumre samtidig. Ingen autentisering nødvendig fra frontend.

```json
Request: {"phones": ["+4712345678", "+4787654321"]}
Response: {
  "+4712345678": {"success": true, "data": {...}},
  "+4787654321": {"success": false, "error": "Ikke medlem"}
}
```
