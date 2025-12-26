# NTNUI Topptur og Frikjøring Member Check

A web application for checking NTNUI Topptur og Frikjøring membership status.

## Features

- Upload CSV files with phone numbers to check membership status
- Batch processing with progress tracking
- Password-protected access
- Real-time membership validation via FastAPI backend
- Displays member status (valid/missing TF/NTNUI)
- Export non-member email lists

## Setup

**Requirements:** Node.js 20.x & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

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
VITE_APP_PASSWORD=your_app_password
```

- `fast_api_key_user`: API key for TF FastAPI backend
- `VITE_APP_PASSWORD`: Password to access the application

## Deployment

The application is deployed on Vercel. Make sure to set the required environment variables in your Vercel project settings.

## API

The application uses the TF FastAPI backend to check membership:

- **Endpoint:** `POST /api/check-ntnui-tf-memebership`
- **Request body:** `{ phones: ["12345678", ...] }`
- **Response:** Membership status for each phone number including `tf_valid` and `ntnui_valid` flags

The API processes requests in batches of 10 concurrent checks and validates that both TF and NTNUI memberships are active.

## CSV Format

Upload a CSV file with a column containing phone numbers. The parser recognizes columns named:
- `phone`, `telefon`, `mobil`, `mobilnummer`, `tlf`, `telephone`, `mobile`

## Technologies

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Vercel Serverless Functions
