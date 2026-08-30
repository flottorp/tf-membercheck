import type { VercelRequest, VercelResponse } from '@vercel/node';

const FASTAPI_BASE_URL = 'https://topptur-og-frikjoring-fastapi.onrender.com';

const TIMEOUT_MS = 25_000;
const DEFAULT_LIMIT = 20;

interface MemberResponse {
  email: string;
  name: string;
  tf_valid: boolean;
  ntnui_valid: boolean;
  last_synced: string;
  telephone_number: string;
  tf_valid_until: string;
  ntnui_valid_until: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed. Use GET with ?q=',
    });
  }

  const apiKey = process.env.fast_api_key_user;

  if (!apiKey) {
    console.error('fast_api_key_user not configured');
    return res.status(500).json({ error: 'API not configured' });
  }

  const rawQuery = req.query.q;
  const q = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery ?? '').trim();

  if (q.length < 2) {
    return res.status(200).json({ results: [], count: 0 });
  }

  const rawLimit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
  const parsedLimit = Number.parseInt(rawLimit ?? '', 10);
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : DEFAULT_LIMIT;

  const url = `${FASTAPI_BASE_URL}/api/members/search?q=${encodeURIComponent(q)}&limit=${limit}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    console.log(`🔍 Søker: ${q}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-API-Key': apiKey,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Søk feilet ${response.status}: ${errorText}`);
      // 5xx betyr som regel at Render fortsatt sover
      const status = response.status >= 500 ? 503 : response.status;
      return res.status(status).json({
        error:
          status === 503
            ? 'API-et svarer ikke akkurat nå. Prøv igjen om litt.'
            : `API feil: ${response.status}`,
      });
    }

    const data = (await response.json()) as { members?: MemberResponse[]; count?: number };
    const members = data.members ?? [];

    const results = members.map(member => ({
      phone: member.telephone_number,
      name: member.name,
      email: member.email,
      tf_valid: member.tf_valid,
      ntnui_valid: member.ntnui_valid,
      tf_valid_until: member.tf_valid_until,
      ntnui_valid_until: member.ntnui_valid_until,
      last_synced: member.last_synced,
    }));

    console.log(`✅ ${results.length} treff for "${q}"`);

    return res.status(200).json({ results, count: results.length });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.error('Error in search-members:', error);
    return res.status(503).json({
      error: isTimeout
        ? 'API-et svarte ikke innen tidsfristen. Prøv igjen om litt.'
        : error instanceof Error
        ? error.message
        : 'Ukjent feil',
    });
  } finally {
    clearTimeout(timeout);
  }
}
