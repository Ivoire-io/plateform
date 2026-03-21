import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/dashboard/fundraising/investors/[id] — modifier un investisseur
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  // Vérifier la chaîne de propriété : investisseur → fundraising → startup → profile
  const { data: investor } = await supabase
    .from(TABLES.investors)
    .select("id, fundraising_id")
    .eq("id", id)
    .single();

  if (!investor) {
    return NextResponse.json({ success: false, error: "Investisseur introuvable." }, { status: 404 });
  }

  const { data: fundraising } = await supabase
    .from(TABLES.fundraising)
    .select("id, startup_id")
    .eq("id", investor.fundraising_id)
    .single();

  if (!fundraising) {
    return NextResponse.json({ success: false, error: "Investisseur introuvable." }, { status: 404 });
  }

  const { data: startup } = await supabase
    .from(TABLES.startups)
    .select("id")
    .eq("id", fundraising.startup_id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!startup) {
    return NextResponse.json({ success: false, error: "Investisseur introuvable." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps invalide." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
    if (!name) return NextResponse.json({ success: false, error: "Le nom est requis." }, { status: 400 });
    updates.name = name;
  }
  if (body.amount !== undefined) {
    if (typeof body.amount !== "number") return NextResponse.json({ success: false, error: "Le montant doit être un nombre." }, { status: 400 });
    updates.amount = body.amount;
  }
  if (body.status !== undefined) updates.status = typeof body.status === "string" ? body.status.trim().slice(0, 50) || "confirmed" : "confirmed";

  const { data, error } = await supabase
    .from(TABLES.investors)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour." }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

// DELETE /api/dashboard/fundraising/investors/[id] — supprimer un investisseur
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  // Vérifier la chaîne de propriété
  const { data: investor } = await supabase
    .from(TABLES.investors)
    .select("id, fundraising_id")
    .eq("id", id)
    .single();

  if (!investor) {
    return NextResponse.json({ success: false, error: "Investisseur introuvable." }, { status: 404 });
  }

  const { data: fundraising } = await supabase
    .from(TABLES.fundraising)
    .select("id, startup_id")
    .eq("id", investor.fundraising_id)
    .single();

  if (!fundraising) {
    return NextResponse.json({ success: false, error: "Investisseur introuvable." }, { status: 404 });
  }

  const { data: startup } = await supabase
    .from(TABLES.startups)
    .select("id")
    .eq("id", fundraising.startup_id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!startup) {
    return NextResponse.json({ success: false, error: "Investisseur introuvable." }, { status: 404 });
  }

  const { error } = await supabase.from(TABLES.investors).delete().eq("id", id);

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la suppression." }, { status: 500 });

  return NextResponse.json({ success: true });
}
