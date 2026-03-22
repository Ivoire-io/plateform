// ─── WasenderAPI Client ───
// WhatsApp messaging via wasenderapi.com

const WASENDER_BASE_URL = "https://app.wasenderapi.com/api";

function getApiKey(): string | null {
  const key = process.env.WASENDER_API_KEY;
  if (!key) {
    console.warn("[WaSender] WASENDER_API_KEY non configure.");
    return null;
  }
  return key;
}

function getHeaders(): HeadersInit {
  const apiKey = process.env.WASENDER_API_KEY;
  if (!apiKey) throw new Error("WASENDER_API_KEY is not configured");
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/**
 * Check if a phone number is registered on WhatsApp.
 * Returns true  → confirmed on WhatsApp
 * Returns false → confirmed NOT on WhatsApp
 * Returns null  → cannot determine (API key missing or API error)
 */
export async function checkWhatsAppNumber(phone: string): Promise<boolean | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn(`[WaSender] checkWhatsAppNumber(${phone}) — cle manquante, verification ignoree.`);
    return null; // cannot determine
  }

  try {
    const url = `${WASENDER_BASE_URL}/on-whatsapp/${encodeURIComponent(phone)}`;
    console.log(`[WaSender] checkWhatsAppNumber → GET ${url}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const raw = await res.text();
    console.log(`[WaSender] checkWhatsAppNumber(${phone}) → status=${res.status} body=${raw}`);

    if (!res.ok) {
      console.error(`[WaSender] checkWhatsAppNumber HTTP error ${res.status}: ${raw}`);
      return null; // API error → cannot determine
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(raw);
    } catch {
      console.error(`[WaSender] checkWhatsAppNumber JSON parse error: ${raw}`);
      return null;
    }

    const inner = (data?.data ?? data) as Record<string, unknown>;
    const result = inner?.exists === true || inner?.onWhatsApp === true;
    console.log(`[WaSender] checkWhatsAppNumber(${phone}) → result=${result} (exists=${inner?.exists}, onWhatsApp=${inner?.onWhatsApp})`);
    return result;
  } catch (err) {
    console.error(`[WaSender] checkWhatsAppNumber(${phone}) exception:`, err);
    return null; // network error → cannot determine
  }
}

/**
 * Send a text message via WhatsApp
 */
export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn(`[WaSender] sendWhatsAppMessage(${phone}) — cle manquante, envoi ignore.`);
    return false;
  }

  try {
    console.log(`[WaSender] sendWhatsAppMessage → POST to=${phone}`);
    const res = await fetch(`${WASENDER_BASE_URL}/send-message`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ to: phone, text: message }),
    });

    const raw = await res.text();
    console.log(`[WaSender] sendWhatsAppMessage(${phone}) → status=${res.status} body=${raw}`);

    if (!res.ok) {
      console.error(`[WaSender] sendWhatsAppMessage HTTP error ${res.status}: ${raw}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[WaSender] sendWhatsAppMessage(${phone}) exception:`, err);
    return false;
  }
}

/**
 * Send OTP code via WhatsApp
 */
export async function sendOTP(phone: string, code: string): Promise<boolean> {
  const message = `🔐 ivoire.io — Votre code de verification : ${code}\n\nCe code expire dans 10 minutes. Ne le partagez avec personne.`;
  return sendWhatsAppMessage(phone, message);
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
