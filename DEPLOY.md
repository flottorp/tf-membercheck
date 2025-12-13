# Slik deployer du til Vercel 🚀

## 1. Først gang - Installer Vercel CLI (valgfritt)

```bash
npm install -g vercel
```

## 2. Deploy fra GitHub (ANBEFALT - enklest!)

### Metode A: Via Vercel Dashboard (ingen CLI nødvendig)

1. Gå til [vercel.com](https://vercel.com)
2. Logg inn med GitHub
3. Klikk "Add New Project"
4. Velg dette GitHub repository
5. Legg til miljøvariabler (Environment Variables):
   - `consumer_key` = din WooCommerce consumer key  
   - `consumer_secret` = din WooCommerce consumer secret
6. Klikk "Deploy"

**Ferdig!** Hver gang du pusher til GitHub, deployer Vercel automatisk! ✨

### Metode B: Via Vercel CLI

```bash
# 1. Logg inn
vercel login

# 2. Deploy
vercel

# 3. Legg til miljøvariabler i Vercel Dashboard
# Gå til Settings → Environment Variables

# 4. Deploy til produksjon
vercel --prod
```

## 3. Miljøvariabler (VIKTIG!)

I Vercel Dashboard, legg til disse miljøvariablene:

| Navn | Verdi | Miljø |
|------|-------|-------|
| `consumer_key` | Din WooCommerce key | Production, Preview, Development |
| `consumer_secret` | Din WooCommerce secret | Production, Preview, Development |

**Pass på:** Velg alle tre miljøer (Production, Preview, Development)

**Merk:** API-nøklene lagres trygt i Vercel og brukes automatisk av serverless functions. Brukere trenger IKKE å skrive inn passord på nettsiden - alt håndteres sikkert på serveren! 🔒

## 4. Test lokalt med Vercel Dev

```bash
# Start Vercel development server
vercel dev
```

Dette starter både frontend og API lokalt, og bruker `.env` filen.

## 5. Sjekk at det fungerer

Når deploymentet er ferdig:

1. Åpne din Vercel URL (f.eks. `https://din-app.vercel.app`)
2. Last opp test-members.csv
3. Sjekk medlemskap

## 6. Automatiske deployments

**Production (main branch):**
- Push til `main` branch → Automatic deploy til production

**Preview (andre branches):**
- Push til andre branches → Automatic preview deployment

## Feilsøking

### Problem: API returnerer 500 error
**Løsning:** Sjekk at miljøvariablene er lagt til i Vercel Dashboard

### Problem: Cannot find module '@vercel/node'
**Løsning:** Kjør `npm install` og push igjen

### Problem: CORS errors
**Løsning:** Bruker du relative URLs (`/api/check-membership`)? Ikke `http://localhost:5000`

## Hva skjer bak kulissene?

```
1. Du pusher kode til GitHub
   ↓
2. Vercel oppdager endringen
   ↓
3. Vercel bygger prosjektet
   ↓
4. Frontend deployes som static files
   ↓
5. API-filene i api/ blir serverless functions
   ↓
6. Din app er live! 🎉
```

## Vercel URL struktur

- **Frontend:** `https://din-app.vercel.app`
- **API:** `https://din-app.vercel.app/api/check-membership`
- **Batch API:** `https://din-app.vercel.app/api/batch-check-membership`

## Kostnader

✅ **Helt gratis** for hobby-prosjekter
- 100 GB bandwidth/måned
- 100,000 serverless function executions/måned
- Unlimited deployments

Dette er mer enn nok for ditt use case! 🎯
