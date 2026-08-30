import type { VercelRequest, VercelResponse } from '@vercel/node';

const FASTAPI_BASE_URL = 'https://topptur-og-frikjoring-fastapi.onrender.com';

// Render free tier spinner ned ved inaktivitet. Ett forsøk per kall -
// klienten styrer retry-løkka, slik at vi ikke sprenger funksjonens kjøretid.
const TIMEOUT_MS = 25_000;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed. Use GET',
    });
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/health`, {
      method: 'GET',
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });

    const elapsedMs = Date.now() - startTime;

    if (!response.ok) {
      console.log(`💤 Health check ga status ${response.status} etter ${elapsedMs}ms`);
      return res.status(503).json({
        ok: false,
        error: `API svarte med status ${response.status}`,
        elapsedMs,
      });
    }

    console.log(`✅ API vekket etter ${elapsedMs}ms`);
    return res.status(200).json({ ok: true, elapsedMs });
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    const message = isTimeout
      ? 'API-et svarte ikke innen tidsfristen'
      : error instanceof Error
      ? error.message
      : 'Ukjent feil';

    console.log(`💤 Health check feilet etter ${elapsedMs}ms: ${message}`);
    return res.status(503).json({ ok: false, error: message, elapsedMs });
  } finally {
    clearTimeout(timeout);
  }
}
