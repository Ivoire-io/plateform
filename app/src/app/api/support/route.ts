import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const supportRateLimit = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function checkSupportRateLimit(clientKey: string) {
  const now = Date.now();
  const maxRequests = 3;
  const windowMs = 60 * 60 * 1000;
  const current = supportRateLimit.get(clientKey);

  if (!current || now > current.resetAt) {
    supportRateLimit.set(clientKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }

  current.count += 1;
  return { allowed: true };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      subject,
      message,
      website,
      startedAt,
    } = body ?? {};

    if (website) {
      return NextResponse.json({ success: true });
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Tous les champs sont requis." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Adresse email invalide." },
        { status: 400 }
      );
    }

    if (String(name).trim().length < 2 || String(subject).trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Merci de préciser ton nom et le sujet." },
        { status: 400 }
      );
    }

    if (String(message).trim().length < 20 || String(message).trim().length > 4000) {
      return NextResponse.json(
        { success: false, error: "Le message doit contenir entre 20 et 4000 caractères." },
        { status: 400 }
      );
    }

    if (!startedAt || Date.now() - Number(startedAt) < 3000) {
      return NextResponse.json(
        { success: false, error: "Envoi trop rapide. Merci de réessayer." },
        { status: 400 }
      );
    }

    const clientKey = `${getClientIp(request)}:${String(email).toLowerCase()}`;
    const rateLimit = checkSupportRateLimit(clientKey);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Trop de messages envoyés. Réessaie un peu plus tard." },
        {
          status: 429,
          headers: rateLimit.retryAfter
            ? { "Retry-After": String(rateLimit.retryAfter) }
            : undefined,
        }
      );
    }

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_xxxxxxxxxxxxxxxxxxxxxxxx") {
      return NextResponse.json(
        { success: false, error: "Le support email n'est pas encore configuré côté serveur." },
        { status: 503 }
      );
    }

    const safeName = escapeHtml(String(name).trim());
    const safeEmail = escapeHtml(String(email).trim().toLowerCase());
    const safeSubject = escapeHtml(String(subject).trim());
    const safeMessage = escapeHtml(String(message).trim()).replace(/\n/g, "<br>");

    await resend.emails.send({
      from: "ivoire.io <noreply@ivoire.io>",
      to: "hello@ivoire.io",
      replyTo: safeEmail,
      subject: `[Support] ${String(subject).trim()}`,
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #0b0b12; color: #ffffff; padding: 32px; border-radius: 18px; border: 1px solid #1e1e28;">
          <div style="margin-bottom: 24px;">
            <div style="display: inline-block; padding: 6px 10px; border-radius: 999px; background: rgba(255,107,0,0.12); color: #ff6b00; font-size: 12px; font-weight: 600; letter-spacing: 0.04em;">
              Nouveau message support
            </div>
            <h1 style="margin: 16px 0 8px; font-size: 24px; line-height: 1.2;">${safeSubject}</h1>
            <p style="margin: 0; color: #a1a1aa; font-size: 14px;">Demande reçue depuis le formulaire support du site.</p>
          </div>

          <div style="display: grid; gap: 12px; margin-bottom: 24px; padding: 18px; background: #11111a; border: 1px solid #232334; border-radius: 14px;">
            <div><strong>Nom :</strong> ${safeName}</div>
            <div><strong>Email :</strong> ${safeEmail}</div>
          </div>

          <div style="padding: 22px; background: #11111a; border: 1px solid #232334; border-radius: 14px; line-height: 1.7; color: #e4e4e7;">
            ${safeMessage}
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur. Merci de réessayer plus tard." },
      { status: 500 }
    );
  }
}