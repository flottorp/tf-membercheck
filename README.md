# NTNUI topptur og Frikjoring Member Check

A web application for checking NTNUI membership status.

## Setup

Requirements: Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

```sh
# Install dependencies
npm i

# Start development server
npm run dev
```

## Testing with Vercel Dev

This project uses Vercel serverless functions for the backend API. To test locally:

```sh
vercel dev
```

**Environment variables:** Create a `.env` file in the root directory:
```
consumer_key=your_woocommerce_key
consumer_secret=your_woocommerce_secret
VITE_APP_PASSWORD=your_vite_app_password
```

## Technologies

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Vercel Serverless Functions
