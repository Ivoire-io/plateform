import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidSlug, RESERVED_SUBDOMAINS, TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, full_name, desired_slug, type } = body;

    // Validation
    if (!email || !full_name || !desired_slug) {
      return NextResponse.json(
        { success: false, error: "Champs requis manquants." },
        { status: 400 }
      );
    }

    const cleanSlug = desired_slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

    if (!isValidSlug(cleanSlug)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Sous-domaine invalide (3-30 caractères, lettres, chiffres, tirets).",
        },
        { status: 400 }
      );
    }

    if (RESERVED_SUBDOMAINS.has(cleanSlug)) {
      return NextResponse.json(
        { success: false, error: "Ce sous-domaine est réservé." },
        { status: 400 }
      );
    }

    // Vérifier si slug déjà pris dans waitlist ou profiles
    const { data: existingWaitlist } = await supabaseAdmin
      .from(TABLES.waitlist)
      .select("id")
      .eq("desired_slug", cleanSlug)
      .maybeSingle();

    if (existingWaitlist) {
      return NextResponse.json(
        { success: false, error: "Ce sous-domaine est déjà réservé !" },
        { status: 409 }
      );
    }

    const { data: existingProfile } = await supabaseAdmin
      .from(TABLES.profiles)
      .select("id")
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: "Ce sous-domaine est déjà pris !" },
        { status: 409 }
      );
    }

    // Insérer dans la waitlist
    const { error } = await supabaseAdmin.from(TABLES.waitlist).insert({
      email,
      full_name,
      desired_slug: cleanSlug,
      type: type || "developer",
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { success: false, error: "Cet email est déjà inscrit !" },
          { status: 409 }
        );
      }
      throw error;
    }

    // Compter le nombre total d'inscrits
    const { count } = await supabaseAdmin
      .from(TABLES.waitlist)
      .select("*", { count: "exact", head: true });

    // Email de bienvenue (non-bloquant)
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_xxxxxxxxxxxxxxxxxxxxxxxx") {
      await resend.emails.send({
        from: "ivoire.io <noreply@ivoire.io>",
        to: email,
        subject: `Bienvenue sur ivoire.io ! Tu es le ${count}ème 🎉`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #fff; padding: 40px; border-radius: 12px;">
            <h1 style="color: #FF6B00; margin-bottom: 8px;">Bienvenue sur ivoire.io ! 🇨🇮</h1>
            <p style="color: #A0A0A0; margin-bottom: 24px;">Tu es le <strong style="color: #fff;">${count}ème</strong> à rejoindre la communauté.</p>
            
            <div style="background: #0D1117; border: 1px solid #1A1A2E; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <p>Ton sous-domaine réservé :</p>
              <p style="font-family: monospace; font-size: 20px; color: #FF6B00; margin: 8px 0;">
                ${cleanSlug}.ivoire.io
              </p>
            </div>
            
            <p style="color: #A0A0A0;">
              On te prévient dès que la plateforme est prête.<br>
              En attendant, suis-nous sur les réseaux sociaux pour ne rien rater.
            </p>
            
            <p style="color: #A0A0A0; font-size: 12px; margin-top: 24px; border-top: 1px solid #1A1A2E; padding-top: 16px;">
              ivoire.io — Le hub de la tech ivoirienne
            </p>
          </div>
        `,
      }).catch(() => { /* Silencieux si Resend non configuré */ });
    }

    return NextResponse.json({
      success: true,
      data: { position: count || 0 },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { count } = await supabaseAdmin
      .from(TABLES.waitlist)
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      data: { count: count || 0 },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
