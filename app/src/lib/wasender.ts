// ─── WasenderAPI Client ───
// WhatsApp messaging via wasenderapi.com

const WASENDER_BASE_URL = "https://app.wasenderapi.com/api";

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
 * Check if a phone number is registered on WhatsApp
 */
export async function checkWhatsAppNumber(phone: string): Promise<boolean> {
  try {
    const res = await fetch(`${WASENDER_BASE_URL}/on-whatsapp/${encodeURIComponent(phone)}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.exists === true || data?.onWhatsApp === true;
  } catch {
    return false;
  }
}

/**
 * Send a text message via WhatsApp
 */
export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  try {
    const res = await fetch(`${WASENDER_BASE_URL}/send-message`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        to: phone,
        text: message,
      }),
    });
    return res.ok;
  } catch {
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
