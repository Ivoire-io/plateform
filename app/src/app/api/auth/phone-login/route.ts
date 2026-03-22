import { derivePhonePassword } from "@/lib/phone-auth";
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
  const sessionToken =
    typeof body.session_token === "string" ? body.session_token.trim() : "";

  if (!phoneNumber || !sessionToken) {
    return NextResponse.json(
      { success: false, error: "Numero et session_token requis." },
      { status: 400 }
    );
  }

  // Verify that session_token has a verified record
  const { data: verification } = await supabaseAdmin
    .from(TABLES.phone_verifications)
    .select("*")
    .eq("session_token", sessionToken)
    .eq("phone_number", phoneNumber)
    .eq("status", "verified")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!verification) {
    return NextResponse.json(
      {
        success: false,
        error: "Verification non trouvee ou non valide.",
      },
      { status: 403 }
    );
  }

  // Check if verification was recent (within 15 minutes)
  const verifiedAt = verification.verified_at
    ? new Date(verification.verified_at)
    : new Date(verification.created_at);
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  if (verifiedAt < fifteenMinutesAgo) {
    return NextResponse.json(
      {
        success: false,
        error: "Session expiree. Veuillez recommencer la verification.",
      },
      { status: 410 }
    );
  }

  // Look for an existing profile with this phone number
  const { data: existingProfile } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("id, email, is_suspended")
    .eq("verified_phone", phoneNumber)
    .maybeSingle();

  if (existingProfile) {
    // Existing user — log them in via password-based session
    if (existingProfile.is_suspended) {
      return NextResponse.json(
        {
          success: false,
          error: "Votre compte a ete suspendu.",
        },
        { status: 403 }
      );
    }

    // Derive password from phone and sign in
    const password = derivePhonePassword(phoneNumber);

    // First, ensure the user has the derived password set
    // (handles migration from old magic-link-only accounts)
    const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = userData?.users?.find(
      (u) => u.email === existingProfile.email
    );

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Compte introuvable." },
        { status: 404 }
      );
    }

    // Update the password to the derived one (idempotent)
    await supabaseAdmin.auth.admin.updateUserById(authUser.id, { password });

    // Sign in with the derived password to get tokens
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: "Configuration serveur manquante." },
        { status: 500 }
      );
    }

    const signInRes = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({
          email: existingProfile.email,
          password,
        }),
      }
    );

    const signInData = await signInRes.json();

    if (!signInRes.ok || !signInData.access_token) {
      return NextResponse.json(
        { success: false, error: "Erreur lors de la connexion." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action: "login",
      access_token: signInData.access_token,
      refresh_token: signInData.refresh_token,
    });
  }

  // No profile found — user needs to register
  return NextResponse.json({
    success: true,
    action: "register",
    phone_verified: true,
    session_token: sessionToken,
    phone_number: phoneNumber,
  });
}
