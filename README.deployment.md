# Deployment med Vercel Edge Middleware

## Oppsett av passord-beskyttelse

Dette prosjektet bruker Vercel Edge Middleware for å beskytte hele siden med Basic Authentication.

### Steg 1: Sett opp miljøvariabler i Vercel

1. Gå til ditt Vercel-prosjekt dashboard
2. Naviger til **Settings** → **Environment Variables**
3. Legg til en ny environment variable:
   - **Name**: `SITE_PASSWORD`
   - **Value**: Ditt valgte passord (f.eks. `TFhemmelig2025`)
   - **Environment**: Velg alle (Production, Preview, Development)
4. Klikk **Save**

### Steg 2: Deploy prosjektet

```bash
# Push til GitHub (hvis koblet til Vercel)
git add .
git commit -m "Add Vercel Edge Middleware for password protection"
git push

# Eller deploy direkte med Vercel CLI
npm i -g vercel
vercel --prod
```

### Steg 3: Test passordbeskyttelsen

1. Besøk din Vercel URL (f.eks. `https://ditt-prosjekt.vercel.app`)
2. Du vil bli møtt med en login-dialog
3. Brukernavn: (kan være hva som helst)
4. Passord: Det du satte som `SITE_PASSWORD`

### Lokal utvikling

For å teste middleware lokalt:

1. Opprett `.env.local` fil:
   ```bash
   SITE_PASSWORD=dittTestPassord
   ```

2. Kjør utviklingsserver:
   ```bash
   bun run dev
   ```

**Merk**: Edge Middleware fungerer kun på Vercel. Lokalt vil ikke passord-beskyttelsen være aktiv med mindre du bruker Vercel CLI.

### Sikkerhetsnotater

- ✅ Passord er lagret som environment variable
- ✅ Aldri commit passord til git
- ✅ Basic Auth beskytter hele siden
- ℹ️ For ekstra sikkerhet, bruk komplekse passord
- ℹ️ Vurder å endre passord regelmessig

### Feilsøking

**Problem**: Middleware fungerer ikke lokalt
- **Løsning**: Dette er forventet. Edge Middleware kjører kun på Vercel. Test på preview/production deployment.

**Problem**: Får ikke lov til å logge inn
- **Løsning**: Dobbeltsjekk at `SITE_PASSWORD` er riktig satt i Vercel dashboard og redeploy.

**Problem**: Statiske ressurser (bilder/CSS) lastes ikke
- **Løsning**: Sjekk at matcher-patternene i `middleware.ts` unngår statiske filer.
