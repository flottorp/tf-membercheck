# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/88074e9c-7ac1-441e-b0a8-a6abbbe978e0

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/88074e9c-7ac1-441e-b0a8-a6abbbe978e0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Testing med lokalt API Bruk Vercel Dev (samme miljø som produksjon)
Dette prosjektet bruker Vercel serverless functions for backend API. For å teste lokalt:

```sh
# Start både frontend og API sammen
vercel dev0
```

Følg Vercel CLI instruksjonene for første gang setup. Vercel Dev starter både frontend og API functions lokalt.

**Viktig:** Sørg for at `.env` filen i rotmappen inneholder:
```
consumer_key=din_woocommerce_key
consumer_secret=din_woocommerce_secret
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/88074e9c-7ac1-441e-b0a8-a6abbbe978e0) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
