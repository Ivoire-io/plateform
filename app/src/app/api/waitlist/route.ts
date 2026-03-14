import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidSlug, RESERVED_SUBDOMAINS, TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

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
