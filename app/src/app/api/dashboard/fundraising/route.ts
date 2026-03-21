import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/fundraising — récupérer les données de levée de fonds
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const { data: startup } = await supabase
    .from(TABLES.startups)
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!startup) {
    return NextResponse.json({ success: false, error: "Startup introuvable." }, { status: 404 });
  }

  // Récupérer les données de fundraising
  const { data: fundraising, error: frError } = await supabase
    .from(TABLES.fundraising)
    .select("*")
    .eq("startup_id", startup.id)
    .maybeSingle();

  if (frError) return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });

  // Récupérer les investisseurs si un fundraising existe
  let investors: unknown[] = [];
  let documents: unknown[] = [];

  if (fundraising) {
    const { data: investorsData } = await supabase
      .from(TABLES.investors)
      .select("*")
      .eq("fundraising_id", fundraising.id)
      .order("created_at", { ascending: false });

    if (investorsData) investors = investorsData;

    const { data: docsData } = await supabase
      .from(TABLES.fundraising_documents)
      .select("*")
      .eq("fundraising_id", fundraising.id)
      .order("created_at", { ascending: false });

    if (docsData) documents = docsData;
  }

  return NextResponse.json({
    success: true,
    data: {
      fundraising: fundraising || null,
      investors,
      documents,
    },
  });
}

// PUT /api/dashboard/fundraising — upsert les paramètres de levée de fonds
export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const { data: startup } = await supabase
    .from(TABLES.startups)
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!startup) {
    return NextResponse.json({ success: false, error: "Startup introuvable." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps invalide." }, { status: 400 });
  }

  const upsertData = {
    startup_id: startup.id,
    is_raising: typeof body.is_raising === "boolean" ? body.is_raising : false,
    raise_type: typeof body.raise_type === "string" ? body.raise_type.trim().slice(0, 50) || null : null,
    target_amount: typeof body.target_amount === "number" ? body.target_amount : null,
    raised_amount: typeof body.raised_amount === "number" ? body.raised_amount : null,
    show_progress_on_profile: typeof body.show_progress_on_profile === "boolean" ? body.show_progress_on_profile : false,
  };

  const { data, error } = await supabase
    .from(TABLES.fundraising)
    .upsert(upsertData, { onConflict: "startup_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour." }, { status: 500 });

  return NextResponse.json({ success: true, data });
}
