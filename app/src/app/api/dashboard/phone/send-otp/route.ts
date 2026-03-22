import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { checkWhatsAppNumber, generateOTP, sendOTP } from "@/lib/wasender";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Non authentifie." },
      { status: 401 }
    );
  }

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

  // Check if this phone is already verified by another user
  const { data: existingOwner } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("id")
    .eq("verified_phone", phoneNumber)
    .neq("id", user.id)
    .maybeSingle();

  if (existingOwner) {
    return NextResponse.json(
      {
        success: false,
        error: "Ce numero est deja verifie par un autre utilisateur.",
      },
      { status: 409 }
    );
  }

  // Rate limit: max 3 OTP requests per hour for this profile
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabaseAdmin
    .from(TABLES.phone_verifications)
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .gte("created_at", oneHourAgo);

  if ((recentCount ?? 0) >= 3) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Trop de tentatives. Reessayez dans une heure.",
      },
      { status: 429 }
    );
  }

  // Verify the number is on WhatsApp
  const isOnWhatsApp = await checkWhatsAppNumber(phoneNumber);
  // null = cannot determine (API key missing / API error) → proceed anyway
  if (isOnWhatsApp === false) {
    return NextResponse.json(
      {
        success: false,
        error: "Ce numero n'est pas enregistre sur WhatsApp.",
      },
      { status: 400 }
    );
  }
  if (isOnWhatsApp === null) {
    console.warn(`[dashboard/phone/send-otp] checkWhatsApp returned null pour ${phoneNumber} — verification ignoree.`);
  }

  // Generate OTP and store in DB
  const otpCode = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: insertError } = await supabaseAdmin
    .from(TABLES.phone_verifications)
    .insert({
      profile_id: user.id,
      phone_number: phoneNumber,
      otp_code: otpCode,
      status: "pending",
      attempts: 0,
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
    message: "Code envoye par WhatsApp.",
    expires_in: 600,
  });
}
