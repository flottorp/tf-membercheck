# NTNUI Topptur og Frikjøring Member Check

A web application for checking NTNUI Topptur og Frikjøring membership status.

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
fast_api_key_user=your_fastapi_key
VITE_APP_PASSWORD=your_vite_app_password
```

## API

The application uses the TF FastAPI backend to check membership:

- **Endpoint:** `POST /api/check-ntnui-tf-memebership`
- **Request body:** `{ phones: ["12345678", ...] }`
- **Response:** Membership status for each phone number including `tf_valid` and `ntnui_valid` flags

## Technologies

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Vercel Serverless Functions
