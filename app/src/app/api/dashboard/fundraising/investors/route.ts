import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// POST /api/dashboard/fundraising/investors — ajouter un investisseur
export async function POST(request: Request) {
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

  // Trouver le fundraising de la startup
  const { data: fundraising } = await supabase
    .from(TABLES.fundraising)
    .select("id")
    .eq("startup_id", startup.id)
    .maybeSingle();

  if (!fundraising) {
    return NextResponse.json({ success: false, error: "Aucune levée de fonds configurée." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps invalide." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  const amount = typeof body.amount === "number" ? body.amount : null;

  if (!name || amount === null) {
    return NextResponse.json({ success: false, error: "Le nom et le montant sont requis." }, { status: 400 });
  }

  const insert = {
    fundraising_id: fundraising.id,
    name,
    amount,
    status: typeof body.status === "string" ? body.status.trim().slice(0, 50) || "confirmed" : "confirmed",
  };

  const { data, error } = await supabase
    .from(TABLES.investors)
    .insert(insert)
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la création." }, { status: 500 });

  return NextResponse.json({ success: true, data }, { status: 201 });
}
