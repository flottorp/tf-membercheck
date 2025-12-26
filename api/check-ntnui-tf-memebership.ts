import type { VercelRequest, VercelResponse } from '@vercel/node';

const FASTAPI_BASE_URL = 'https://topptur-og-frikjoring-fastapi.onrender.com';

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

interface CheckResult {
  success: boolean;
  data?: {
    phone: string;
    name: string;
    email: string;
    tf_valid: boolean;
    ntnui_valid: boolean;
    tf_valid_until: string;
    ntnui_valid_until: string;
    last_synced: string;
  };
  error?: string;
}

/**
 * Normaliserer telefonnummer til format med +47
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Fjern alle mellomrom, bindestreker og parenteser
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  
  // Hvis nummeret allerede har +, behold det
  if (normalized.startsWith('+')) {
    return normalized;
  }
  
  // Fjern ledende 00 (internasjonalt format)
  if (normalized.startsWith('00')) {
    normalized = normalized.substring(2);
  }
  
  // Håndter norske nummer som starter med 0047
  if (normalized.startsWith('0047')) {
    normalized = '47' + normalized.substring(4);
  }
  
  // Hvis nummer starter med 0 (ofte norsk format), fjern 0 og legg til 47
  if (normalized.startsWith('0') && normalized.length === 9) {
    normalized = '47' + normalized.substring(1);
  }
  
  // Hvis nummer er 8 siffer og ser ut som norsk, legg til 47
  if (normalized.length === 8 && /^[4-9]/.test(normalized)) {
    normalized = '47' + normalized;
  }
  
  // Legg til + foran
  return '+' + normalized;
}

/**
 * Sjekker medlemskap for ett telefonnummer via FastAPI
 */
async function checkSingleMembership(phone: string, apiKey: string): Promise<CheckResult> {
  const normalizedPhone = normalizePhoneNumber(phone);
  
  // Ikke bruk encodeURIComponent - API forventer literal + i URL
  const url = `${FASTAPI_BASE_URL}/api/members/${normalizedPhone}`;
  console.log(`📞 Sjekker: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    
    if (response.status === 404) {
      console.log(`❌ 404 - Ikke funnet: ${normalizedPhone}`);
      return {
        success: false,
        error: 'Ikke funnet i systemet',
      };
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ API feil ${response.status}: ${errorText}`);
      return {
        success: false,
        error: `API feil: ${response.status} - ${errorText}`,
      };
    }
    
    const data: MemberResponse = await response.json() as MemberResponse;
    console.log(`📋 API response for ${normalizedPhone}:`, JSON.stringify(data));
    
    // Sjekk om medlemskapet er gyldig (både TF og NTNUI må være betalt)
    const isValid = data.tf_valid && data.ntnui_valid;
    console.log(`   tf_valid: ${data.tf_valid}, ntnui_valid: ${data.ntnui_valid}, isValid: ${isValid}`);
    
    return {
      success: isValid,
      data: {
        phone: data.telephone_number,
        name: data.name,
        email: data.email,
        tf_valid: data.tf_valid,
        ntnui_valid: data.ntnui_valid,
        tf_valid_until: data.tf_valid_until,
        ntnui_valid_until: data.ntnui_valid_until,
        last_synced: data.last_synced,
      },
      ...(isValid ? {} : { error: data.tf_valid ? 'NTNUI ikke betalt' : 'TF ikke betalt' }),
    };
  } catch (error) {
    console.error(`Feil ved sjekk av ${phone}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ukjent feil',
    };
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const requestStartTime = Date.now();
  
  // Tillat kun POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST with { phones: string[] }',
    });
  }
  
  const apiKey = process.env.fast_api_key_user;
  
  if (!apiKey) {
    console.error('FASTAPI_API_KEY_USER not configured');
    return res.status(500).json({
      success: false,
      error: 'API not configured',
    });
  }
  
  try {
    const { phones } = req.body;
    
    if (!phones || !Array.isArray(phones)) {
      return res.status(400).json({
        success: false,
        error: 'Ingen telefonnumre oppgitt. Send { phones: ["12345678", ...] }',
      });
    }
    
    console.log(`🔍 Sjekker ${phones.length} telefonnumre via FastAPI...`);
    
    // Sjekk alle telefonnumre parallelt (med rate limiting)
    const BATCH_SIZE = 10; // Maks antall samtidige requests
    const results: Record<string, CheckResult> = {};
    
    for (let i = 0; i < phones.length; i += BATCH_SIZE) {
      const batch = phones.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(phone => checkSingleMembership(phone, apiKey))
      );
      
      batch.forEach((phone, index) => {
        results[phone] = batchResults[index];
      });
      
      console.log(`  📄 Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} sjekket`);
    }
    
    const totalDuration = Date.now() - requestStartTime;
    const successCount = Object.values(results).filter(r => r.success).length;
    
    console.log(`✅ Ferdig: ${successCount}/${phones.length} gyldige medlemskap`);
    console.log(`⏱️  Total tid: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
    
    return res.status(200).json(results);
    
  } catch (error) {
    console.error('Error in check-ntnui-tf-membership:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}