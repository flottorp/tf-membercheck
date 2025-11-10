# 🔐 Vercel Edge Middleware - Passord-beskyttelse

Alt er nå satt opp for å beskytte nettsiden din med Vercel Edge Middleware!

## 📋 Hva er gjort:

✅ `middleware.ts` - Vercel Edge Middleware for Basic Authentication  
✅ `vercel.json` - Vercel-konfigurasjon  
✅ `.env.example` - Template for miljøvariabler  
✅ `.gitignore` - Oppdatert for å unngå å commite hemmeligheter  
✅ `tsconfig.node.json` - TypeScript-konfigurasjon  
✅ `@types/node` - Installert

---

## 🚀 Slik deployer du:

### Steg 1: Sett opp miljøvariabler i Vercel

1. Gå til [Vercel Dashboard](https://vercel.com/dashboard)
2. Velg ditt prosjekt (eller importer det fra GitHub)
3. Naviger til **Settings** → **Environment Variables**
4. Legg til en ny variabel:
   
   ```
   Name:  SITE_PASSWORD
   Value: DittHemmeliGePassord123
   ```
   
5. Velg **alle environments** (Production, Preview, Development)
6. Klikk **Save**

### Steg 2: Push til GitHub (hvis koblet til Vercel)

```bash
git add .
git commit -m "Add Vercel Edge Middleware password protection"
git push origin dev  # eller main
```

Vercel vil automatisk deploye når du pusher!

### Steg 3: Test nettsiden

1. Besøk din Vercel URL (f.eks. `https://ditt-prosjekt.vercel.app`)
2. Du vil se en login-dialog fra nettleseren
3. **Brukernavn**: Hvilket som helst (f.eks. "medlem")
4. **Passord**: Det du satte som `SITE_PASSWORD`

---

## 🛠️ Alternativt: Deploy direkte med Vercel CLI

```bash
# Installer Vercel CLI (hvis ikke installert)
npm install -g vercel

# Deploy til production
vercel --prod

# Følg instruksjonene i terminalen
```

---

## 💻 Lokal utvikling

**OBS:** Edge Middleware fungerer kun på Vercel, ikke lokalt.

For lokal testing uten passord:
```bash
npm run dev
```

For å teste med Vercel lokalt:
```bash
# Opprett .env.local først
echo SITE_PASSWORD=testpassord > .env.local

# Kjør med Vercel CLI
vercel dev
```

---

## 🔒 Sikkerhet

- ✅ Passord lagres som environment variable (aldri i kode)
- ✅ Basic Auth beskytter hele siden før den lastes
- ✅ Fungerer på alle sider og undersider
- ✅ `.env` og `.env.local` er ekskludert fra git

### Tips:
- Bruk et sterkt passord (minst 12 tegn, blanding av store/små bokstaver, tall, symboler)
- Del passordet sikkert med teamet (f.eks. via 1Password, Bitwarden)
- Endre passord regelmessig

---

## 🐛 Feilsøking

### Problem: "Cannot find module 'next/server'"
**Løsning**: Dette er normalt! Filen kjører kun på Vercel Edge, ikke lokalt.

### Problem: Får ikke lov til å logge inn
**Løsning**: 
1. Sjekk at `SITE_PASSWORD` er riktig satt i Vercel
2. Redeploy prosjektet
3. Tøm nettleser-cache og prøv igjen

### Problem: Statiske filer lastes ikke
**Løsning**: `matcher` i middleware.ts er konfigurert til å unngå statiske filer. Hvis problemer, sjekk at filendelsene er med i regex-patternen.

---

## 📝 Neste steg

1. ✅ Sett `SITE_PASSWORD` i Vercel Dashboard
2. ✅ Push koden til GitHub
3. ✅ Test login på deployed site
4. 🎉 Ferdig!

---

**Spørsmål?** Sjekk [Vercel Edge Middleware Docs](https://vercel.com/docs/functions/edge-middleware)
