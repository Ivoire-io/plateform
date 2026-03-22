import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { checkWhatsAppNumber, generateOTP, sendOTP } from "@/lib/wasender";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Corps de requete invalide." },
      { status: 400 }
    );
  }

  const phoneNumber =
    typeof body.phone_number === "string" ? body.phone_number.trim() : "";
  const purpose =
    typeof body.purpose === "string" &&
      ["registration", "login"].includes(body.purpose)
      ? body.purpose
      : "login";

  // Validate format: +225XXXXXXXXXX (10 digits after country code)
  if (!/^\+225\d{10}$/.test(phoneNumber)) {
    return NextResponse.json(
      {
        success: false,
        error: "Format invalide. Utilisez +225 suivi de 10 chiffres.",
      },
      { status: 400 }
    );
  }

  // Rate limit: max 3 OTP requests per hour for this phone
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabaseAdmin
    .from(TABLES.phone_verifications)
    .select("id", { count: "exact", head: true })
    .eq("phone_number", phoneNumber)
    .gte("created_at", oneHourAgo);

  if ((recentCount ?? 0) >= 3) {
    return NextResponse.json(
      {
        success: false,
        error: "Trop de tentatives. Reessayez dans une heure.",
      },
      { status: 429 }
    );
  }

  // Verify the number is on WhatsApp
  const isOnWhatsApp = await checkWhatsAppNumber(phoneNumber);
  if (!isOnWhatsApp) {
    return NextResponse.json(
      {
        success: false,
        error: "Ce numero n'est pas enregistre sur WhatsApp.",
      },
      { status: 400 }
    );
  }

  // Generate OTP and session token
  const otpCode = generateOTP();
  const sessionToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: insertError } = await supabaseAdmin
    .from(TABLES.phone_verifications)
    .insert({
      profile_id: null,
      phone_number: phoneNumber,
      otp_code: otpCode,
      status: "pending",
      attempts: 0,
      session_token: sessionToken,
      purpose,
      expires_at: expiresAt,
    });

  if (insertError) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la creation de la verification." },
      { status: 500 }
    );
  }

  // Send OTP via WhatsApp
  const sent = await sendOTP(phoneNumber, otpCode);

  // Log in whatsapp_logs
  await supabaseAdmin.from(TABLES.whatsapp_logs).insert({
    phone: phoneNumber,
    message_type: "otp",
    content: `OTP envoye (${purpose})`,
    status: sent ? "sent" : "failed",
  });

  if (!sent) {
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'envoi du code. Reessayez.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    session_token: sessionToken,
    expires_in: 600,
    message: "Code envoye par WhatsApp.",
  });
}
