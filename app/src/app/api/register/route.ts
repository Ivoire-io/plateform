import { createNotification } from "@/lib/notifications";
import { derivePhonePassword } from "@/lib/phone-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidSlug, RESERVED_SUBDOMAINS, TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";
import { Resend } from "resend";

type RegistrationType = "developer" | "startup" | "enterprise" | "other";

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateTempSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `user-${code}`;
}

async function validateSlug(
  slug: string
): Promise<{ valid: boolean; error?: string }> {
  if (!isValidSlug(slug)) {
    return {
      valid: false,
      error: "Sous-domaine invalide (3-30 caracteres, lettres, chiffres, tirets).",
    };
  }

  if (RESERVED_SUBDOMAINS.has(slug)) {
    return { valid: false, error: "Ce sous-domaine est reserve." };
  }

  // Check uniqueness in waitlist
  const { data: existingWaitlist } = await supabaseAdmin
    .from(TABLES.waitlist)
    .select("id")
    .eq("desired_slug", slug)
    .maybeSingle();

  if (existingWaitlist) {
    return { valid: false, error: "Ce sous-domaine est deja reserve." };
  }

  // Check uniqueness in profiles
  const { data: existingProfile } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingProfile) {
    return { valid: false, error: "Ce sous-domaine est deja pris." };
  }

  return { valid: true };
}

function sanitizeString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function sanitizeStringArray(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems)
    .map((item) => item.slice(0, maxLength));
}

function getRegistrationMetadata(
  type: RegistrationType,
  extra: unknown
): Record<string, unknown> {
  const payload = extra && typeof extra === "object" ? extra : {};

  if (type === "developer") {
    const developerPayload = payload as Record<string, unknown>;
    const metadata = {
      skills: sanitizeStringArray(developerPayload.skills, 25, 40),
      title: sanitizeString(developerPayload.title, 80),
      city: sanitizeString(developerPayload.city, 80),
      github_url: sanitizeString(developerPayload.github_url, 255),
    };

    return Object.fromEntries(
      Object.entries(metadata).filter(([, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== undefined;
      })
    );
  }

  if (type === "startup") {
    const startupPayload = payload as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries({
        startup_name: sanitizeString(startupPayload.startup_name, 120),
        tagline: sanitizeString(startupPayload.tagline, 120),
        sector: sanitizeString(startupPayload.sector, 60),
        stage: sanitizeString(startupPayload.stage, 40),
        problem_statement: sanitizeString(startupPayload.problem_statement, 300),
      }).filter(([, value]) => value !== undefined)
    );
  }

  if (type === "enterprise") {
    const enterprisePayload = payload as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries({
        company_name: sanitizeString(enterprisePayload.company_name, 120),
        sector: sanitizeString(enterprisePayload.sector, 60),
        company_size: sanitizeString(enterprisePayload.company_size, 40),
        hiring_needs: sanitizeString(enterprisePayload.hiring_needs, 300),
      }).filter(([, value]) => value !== undefined)
    );
  }

  return {};
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Corps de requete invalide." },
        { status: 400 }
      );
    }

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const fullName =
      typeof body.full_name === "string" && body.full_name.trim().length >= 2
        ? body.full_name.trim()
        : "Utilisateur";
    let desiredSlug =
      typeof body.desired_slug === "string"
        ? body.desired_slug.toLowerCase().replace(/[^a-z0-9-]/g, "")
        : "";
    const whatsapp =
      typeof body.whatsapp === "string" ? body.whatsapp.trim() : "";
    const type =
      typeof body.type === "string" &&
        ["developer", "startup", "enterprise", "other"].includes(body.type)
        ? (body.type as RegistrationType)
        : "developer";
    const referralCode =
      typeof body.referral_code === "string"
        ? body.referral_code.trim()
        : null;
    const sessionToken =
      typeof body.session_token === "string"
        ? body.session_token.trim()
        : null;
    const registrationMetadata = getRegistrationMetadata(type, body.extra);

    // If session_token is provided, verify OTP and extract phone
    let verifiedPhone: string | null = null;
    let effectiveEmail = email;
    if (sessionToken) {
      const { data: verification } = await supabaseAdmin
        .from(TABLES.phone_verifications)
        .select("phone_number, status")
        .eq("session_token", sessionToken)
        .eq("status", "verified")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!verification) {
        return NextResponse.json(
          { success: false, error: "Verification WhatsApp invalide ou expiree." },
          { status: 403 }
        );
      }

      verifiedPhone = verification.phone_number;

      // Generate synthetic email if none provided
      if (!effectiveEmail) {
        const phoneDigits = verifiedPhone!.replace(/\+/g, "");
        effectiveEmail = `phone_${phoneDigits}@phone.ivoire.io`;
      }
    }

    // Generate temporary slug if not provided
    if (!desiredSlug || desiredSlug.length < 3) {
      desiredSlug = generateTempSlug();
    }

    // For non-phone-verified, email is still required
    if (!verifiedPhone && !effectiveEmail) {
      return NextResponse.json(
        { success: false, error: "Email requis." },
        { status: 400 }
      );
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(effectiveEmail)) {
      return NextResponse.json(
        { success: false, error: "Adresse email invalide." },
        { status: 400 }
      );
    }

    // Validate slug
    const slugValidation = await validateSlug(desiredSlug);
    if (!slugValidation.valid) {
      return NextResponse.json(
        { success: false, error: slugValidation.error },
        { status: 409 }
      );
    }

    // Read registration mode from platform config
    const { data: configRow } = await supabaseAdmin
      .from(TABLES.platform_config)
      .select("value")
      .eq("key", "registration_mode")
      .maybeSingle();

    const registrationMode =
      configRow?.value === "open" ? "open" : "waitlist";

    // Phone-verified users always get an instant account regardless of registration mode
    const createInstantly = registrationMode === "open" || !!verifiedPhone;

    // ─── INSTANT ACCOUNT (open mode OR phone-verified) ───
    if (createInstantly) {
      // Check if email already exists via profiles table
      const { data: existingEmail } = await supabaseAdmin
        .from(TABLES.profiles)
        .select("id")
        .eq("email", effectiveEmail)
        .maybeSingle();

      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: "Un compte existe deja avec cet email." },
          { status: 409 }
        );
      }

      // If phone-verified, also check if phone is already taken
      if (verifiedPhone) {
        const { data: existingPhone } = await supabaseAdmin
          .from(TABLES.profiles)
          .select("id")
          .eq("verified_phone", verifiedPhone)
          .maybeSingle();

        if (existingPhone) {
          return NextResponse.json(
            { success: false, error: "Ce numero est deja associe a un compte." },
            { status: 409 }
          );
        }
      }

      // Create auth user with email confirmed (+ derived password if phone-verified)
      const createUserPayload: { email: string; email_confirm: boolean; password?: string } = {
        email: effectiveEmail,
        email_confirm: true,
      };
      if (verifiedPhone) {
        createUserPayload.password = derivePhonePassword(verifiedPhone);
      }
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser(createUserPayload);

      if (authError || !authData?.user) {
        if (authError?.message?.includes("already been registered")) {
          return NextResponse.json(
            { success: false, error: "Un compte existe deja avec cet email." },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { success: false, error: authError?.message || "Erreur lors de la creation du compte." },
          { status: 500 }
        );
      }

      const userId = authData.user.id;
      const newReferralCode = generateReferralCode();

      // Insert profile
      const { error: profileError } = await supabaseAdmin
        .from(TABLES.profiles)
        .insert({
          id: userId,
          slug: desiredSlug,
          email: effectiveEmail,
          full_name: fullName,
          type,
          title:
            type === "developer" && typeof registrationMetadata.title === "string"
              ? registrationMetadata.title
              : null,
          city:
            type === "developer" && typeof registrationMetadata.city === "string"
              ? registrationMetadata.city
              : null,
          skills:
            type === "developer" && Array.isArray(registrationMetadata.skills)
              ? registrationMetadata.skills
              : [],
          github_url:
            type === "developer" && typeof registrationMetadata.github_url === "string"
              ? registrationMetadata.github_url
              : null,
          referral_code: newReferralCode,
          verified_phone: verifiedPhone || whatsapp || null,
          phone_verified: !!verifiedPhone,
          onboarding_completed: false,
          is_suspended: false,
          registration_extra: Object.keys(registrationMetadata).length > 0 ? registrationMetadata : null,
        });

      if (profileError) {
        // Cleanup: delete the auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return NextResponse.json(
          { success: false, error: "Erreur lors de la creation du profil." },
          { status: 500 }
        );
      }

      // Generate magic link for login
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ivoire.io";
      const redirectTo = `${siteUrl.replace(/\/+$/, "")}/auth/callback`;

      // Link phone_verification record to the new profile
      if (sessionToken && verifiedPhone) {
        await supabaseAdmin
          .from(TABLES.phone_verifications)
          .update({ profile_id: userId })
          .eq("session_token", sessionToken)
          .eq("phone_number", verifiedPhone);
      }

      // For phone-verified users: sign in with derived password to get tokens
      let accessToken: string | undefined;
      let refreshToken: string | undefined;
      if (verifiedPhone) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseAnonKey) {
          try {
            const signInRes = await fetch(
              `${supabaseUrl}/auth/v1/token?grant_type=password`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  apikey: supabaseAnonKey,
                },
                body: JSON.stringify({
                  email: effectiveEmail,
                  password: derivePhonePassword(verifiedPhone),
                }),
              }
            );
            const signInData = await signInRes.json();
            if (signInRes.ok && signInData.access_token) {
              accessToken = signInData.access_token;
              refreshToken = signInData.refresh_token;
            }
          } catch {
            // Fall back to magic link if sign-in fails
          }
        }
      }

      let actionLink: string | undefined;
      if (!accessToken) {
        const { data: linkData, error: linkError } =
          await supabaseAdmin.auth.admin.generateLink({
            type: "magiclink",
            email: effectiveEmail,
            options: { redirectTo },
          });

        if (!linkError && linkData) {
          actionLink = (
            linkData as unknown as { properties?: { action_link?: string } }
          )?.properties?.action_link;
        }
      }

      // Send welcome email with magic link via Resend (skip for synthetic emails)
      let emailSent = false;
      const isSyntheticEmail = effectiveEmail.endsWith("@phone.ivoire.io");
      if (
        !isSyntheticEmail &&
        actionLink &&
        process.env.RESEND_API_KEY &&
        process.env.RESEND_API_KEY !== "re_xxxxxxxxxxxxxxxxxxxxxxxx"
      ) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: "ivoire.io <noreply@ivoire.io>",
            to: effectiveEmail,
            subject: "Bienvenue sur ivoire.io - Connectez-vous",
            html: `
              <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #fff; padding: 40px; border-radius: 12px;">
                <h1 style="color: #FF6B00; margin-bottom: 8px;">Bienvenue sur ivoire.io</h1>
                <p style="color: #A0A0A0; margin-bottom: 18px;">
                  Votre compte a ete cree avec succes. Votre portfolio est accessible sur :
                  <strong style="color:#fff;">${desiredSlug}.ivoire.io</strong>
                </p>

                <a href="${actionLink}" style="display:inline-block;background:#FF6B00;color:#0A0A0A;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600;">
                  Se connecter et completer mon profil
                </a>

                <p style="color:#A0A0A0;margin-top:18px;font-size:12px;">
                  Si le bouton ne marche pas, copiez-collez ce lien dans votre navigateur :<br/>
                  <span style="word-break:break-all;color:#fff;">${actionLink}</span>
                </p>

                <p style="color: #A0A0A0; font-size: 12px; margin-top: 24px; border-top: 1px solid #1A1A2E; padding-top: 16px;">
                  ivoire.io -- Le hub de la tech ivoirienne
                </p>
              </div>
            `,
          });
          emailSent = true;
        } catch {
          // Silently fail if Resend is not configured
        }
      }

      // Also insert into waitlist for tracking (non-blocking)
      try {
        await supabaseAdmin
          .from(TABLES.waitlist)
          .insert({
            email: effectiveEmail,
            full_name: fullName,
            desired_slug: desiredSlug,
            whatsapp: verifiedPhone || whatsapp || null,
            type,
            invited: true,
            invited_at: new Date().toISOString(),
            converted_profile_id: userId,
            converted_at: new Date().toISOString(),
            referral_code: referralCode,
            registration_metadata: registrationMetadata,
          });
      } catch {
        // Non-blocking: waitlist insert may fail on duplicate
      }

      // Handle referral if provided
      if (referralCode) {
        // Find the referrer by their referral_code
        const { data: referrer } = await supabaseAdmin
          .from(TABLES.profiles)
          .select("id")
          .eq("referral_code", referralCode)
          .maybeSingle();

        if (referrer) {
          try {
            await supabaseAdmin
              .from(TABLES.referrals)
              .insert({
                referrer_id: referrer.id,
                referred_id: userId,
                referral_code: referralCode,
                status: "pending",
              });
          } catch {
            // Non-blocking
          }
        }
      }

      // Send welcome notification (non-blocking)
      createNotification({
        profile_id: userId,
        type: "welcome",
        title: "Bienvenue sur ivoire.io !",
        body: `Ton portfolio ${desiredSlug}.ivoire.io est pret. Complete ton profil pour etre visible dans l'annuaire.`,
        link: "/dashboard",
        channels: ["inapp", "whatsapp"],
      }).catch(() => { });

      return NextResponse.json({
        success: true,
        mode: "open",
        message: verifiedPhone
          ? "Compte cree avec succes."
          : "Un lien de connexion a ete envoye a votre adresse email.",
        email_sent: emailSent,
        action_link: !accessToken ? actionLink : undefined,
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }

    // ─── WAITLIST MODE ───
    // Check if email already in waitlist
    const { data: existingWaitlistEmail } = await supabaseAdmin
      .from(TABLES.waitlist)
      .select("id")
      .eq("email", effectiveEmail)
      .maybeSingle();

    if (existingWaitlistEmail) {
      return NextResponse.json(
        { success: false, error: "Cet email est deja inscrit." },
        { status: 409 }
      );
    }

    const { error: insertError } = await supabaseAdmin
      .from(TABLES.waitlist)
      .insert({
        email: effectiveEmail,
        full_name: fullName,
        desired_slug: desiredSlug,
        whatsapp: verifiedPhone || whatsapp || null,
        type,
        referral_code: referralCode,
        registration_metadata: registrationMetadata,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { success: false, error: "Cet email ou ce domaine est deja enregistre." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Erreur lors de l'inscription." },
        { status: 500 }
      );
    }

    // Send waitlist confirmation email via Resend (skip for synthetic emails)
    if (
      !effectiveEmail.endsWith("@phone.ivoire.io") &&
      process.env.RESEND_API_KEY &&
      process.env.RESEND_API_KEY !== "re_xxxxxxxxxxxxxxxxxxxxxxxx"
    ) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { count } = await supabaseAdmin
          .from(TABLES.waitlist)
          .select("*", { count: "exact", head: true });

        await resend.emails.send({
          from: "ivoire.io <noreply@ivoire.io>",
          to: effectiveEmail,
          subject: `Bienvenue sur ivoire.io ! Tu es le ${count}eme`,
          html: `
            <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #fff; padding: 40px; border-radius: 12px;">
              <h1 style="color: #FF6B00; margin-bottom: 8px;">Bienvenue sur ivoire.io !</h1>
              <p style="color: #A0A0A0; margin-bottom: 24px;">Tu es le <strong style="color: #fff;">${count}eme</strong> a rejoindre la communaute.</p>

              <div style="background: #0D1117; border: 1px solid #1A1A2E; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p>Ton sous-domaine reserve :</p>
                <p style="font-family: monospace; font-size: 20px; color: #FF6B00; margin: 8px 0;">
                  ${desiredSlug}.ivoire.io
                </p>
              </div>

              <p style="color: #A0A0A0;">
                On te previent des que la plateforme est prete.<br>
                En attendant, suis-nous sur les reseaux sociaux pour ne rien rater.
              </p>

              <p style="color: #A0A0A0; font-size: 12px; margin-top: 24px; border-top: 1px solid #1A1A2E; padding-top: 16px;">
                ivoire.io -- Le hub de la tech ivoirienne
              </p>
            </div>
          `,
        });
      } catch {
        // Silently fail
      }
    }

    return NextResponse.json({
      success: true,
      mode: "waitlist",
      message: "Vous etes sur la liste d'attente. On vous previent bientot !",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
