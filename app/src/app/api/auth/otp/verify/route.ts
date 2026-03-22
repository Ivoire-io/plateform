import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
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
  const otpCode =
    typeof body.otp_code === "string" ? body.otp_code.trim() : "";
  const sessionToken =
    typeof body.session_token === "string" ? body.session_token.trim() : "";

  if (!phoneNumber || !otpCode || !sessionToken) {
    return NextResponse.json(
      { success: false, error: "Numero, code et session_token requis." },
      { status: 400 }
    );
  }

  if (!/^\d{6}$/.test(otpCode)) {
    return NextResponse.json(
      { success: false, error: "Le code doit contenir 6 chiffres." },
      { status: 400 }
    );
  }

  // Find the pending verification by session_token and phone
  const { data: verification, error: fetchError } = await supabaseAdmin
    .from(TABLES.phone_verifications)
    .select("*")
    .eq("session_token", sessionToken)
    .eq("phone_number", phoneNumber)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError || !verification) {
    return NextResponse.json(
      {
        success: false,
        error: "Aucune verification en cours pour ce numero.",
      },
      { status: 404 }
    );
  }

  // Check if expired
  if (new Date(verification.expires_at) < new Date()) {
    await supabaseAdmin
      .from(TABLES.phone_verifications)
      .update({ status: "expired" })
      .eq("id", verification.id);

    return NextResponse.json(
      { success: false, error: "Le code a expire. Demandez un nouveau code." },
      { status: 410 }
    );
  }

  // Check max attempts (5)
  if (verification.attempts >= 5) {
    await supabaseAdmin
      .from(TABLES.phone_verifications)
      .update({ status: "failed" })
      .eq("id", verification.id);

    return NextResponse.json(
      {
        success: false,
        error: "Trop de tentatives. Demandez un nouveau code.",
      },
      { status: 429 }
    );
  }

  // Verify OTP
  if (verification.otp_code !== otpCode) {
    const newAttempts = verification.attempts + 1;
    const updateData: Record<string, unknown> = { attempts: newAttempts };

    if (newAttempts >= 5) {
      updateData.status = "failed";
    }

    await supabaseAdmin
      .from(TABLES.phone_verifications)
      .update(updateData)
      .eq("id", verification.id);

    const remaining = 5 - newAttempts;
    return NextResponse.json(
      {
        success: false,
        error:
          remaining > 0
            ? `Code incorrect. ${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}.`
            : "Trop de tentatives. Demandez un nouveau code.",
        remaining_attempts: remaining,
      },
      { status: 400 }
    );
  }

  // OTP matches — mark as verified
  await supabaseAdmin
    .from(TABLES.phone_verifications)
    .update({
      status: "verified",
      verified_at: new Date().toISOString(),
      attempts: verification.attempts + 1,
    })
    .eq("id", verification.id);

  return NextResponse.json({
    success: true,
    verified: true,
    session_token: sessionToken,
    message: "Numero verifie avec succes.",
  });
}
