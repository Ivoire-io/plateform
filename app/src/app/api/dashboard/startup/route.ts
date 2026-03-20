import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/startup — Récupérer la startup du user connecté
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from(TABLES.startups)
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

// POST /api/dashboard/startup — Créer une startup
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, slug, tagline, description, website_url, sector, stage, city, team_size, founded_year, tech_stack } = body;

    if (!name || !slug || !tagline) {
      return NextResponse.json({ error: "Nom, slug et tagline sont requis." }, { status: 400 });
    }

    // Vérifier slug unique
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
    const { data: existing } = await supabase
      .from(TABLES.startups)
      .select("id")
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Ce slug est déjà pris." }, { status: 409 });
    }

    const { data, error } = await supabase
      .from(TABLES.startups)
      .insert({
        profile_id: user.id,
        name,
        slug: cleanSlug,
        tagline,
        description: description || null,
        website_url: website_url || null,
        sector: sector || "tech",
        stage: stage || "idea",
        city: city || "Abidjan",
        team_size: team_size || 1,
        founded_year: founded_year || null,
        tech_stack: tech_stack || [],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// PATCH /api/dashboard/startup — Modifier sa startup
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { name, tagline, description, website_url, sector, stage, city, team_size, founded_year, tech_stack, is_hiring } = body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (tagline !== undefined) updates.tagline = tagline;
    if (description !== undefined) updates.description = description;
    if (website_url !== undefined) updates.website_url = website_url;
    if (sector !== undefined) updates.sector = sector;
    if (stage !== undefined) updates.stage = stage;
    if (city !== undefined) updates.city = city;
    if (team_size !== undefined) updates.team_size = team_size;
    if (founded_year !== undefined) updates.founded_year = founded_year;
    if (tech_stack !== undefined) updates.tech_stack = tech_stack;
    if (is_hiring !== undefined) updates.is_hiring = is_hiring;

    const { data, error } = await supabase
      .from(TABLES.startups)
      .update(updates)
      .eq("profile_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// DELETE /api/dashboard/startup — Supprimer sa startup
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from(TABLES.startups)
    .delete()
    .eq("profile_id", user.id);

  if (error) return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });

  return NextResponse.json({ success: true });
}
