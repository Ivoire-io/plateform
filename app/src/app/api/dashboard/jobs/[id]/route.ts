import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/dashboard/jobs/[id] — modifier une offre d'emploi
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  // Vérifier que l'offre appartient à l'utilisateur
  const { data: existing } = await supabase
    .from(TABLES.job_listings)
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return NextResponse.json({ success: false, error: "Offre introuvable." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps invalide." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) {
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
    if (!title) return NextResponse.json({ success: false, error: "Le titre est requis." }, { status: 400 });
    updates.title = title;
  }
  if (body.company !== undefined) {
    const company = typeof body.company === "string" ? body.company.trim().slice(0, 100) : "";
    if (!company) return NextResponse.json({ success: false, error: "L'entreprise est requise." }, { status: 400 });
    updates.company = company;
  }
  if (body.location !== undefined) updates.location = typeof body.location === "string" ? body.location.trim().slice(0, 100) || null : null;
  if (body.type !== undefined) updates.type = typeof body.type === "string" ? body.type.trim().slice(0, 50) || null : null;
  if (body.salary_min !== undefined) updates.salary_min = typeof body.salary_min === "number" ? body.salary_min : null;
  if (body.salary_max !== undefined) updates.salary_max = typeof body.salary_max === "number" ? body.salary_max : null;
  if (body.salary_currency !== undefined) updates.salary_currency = typeof body.salary_currency === "string" ? body.salary_currency.trim().slice(0, 10) || "XOF" : "XOF";
  if (body.description !== undefined) updates.description = typeof body.description === "string" ? body.description.trim().slice(0, 10000) || null : null;
  if (body.requirements !== undefined) updates.requirements = typeof body.requirements === "string" ? body.requirements.trim().slice(0, 5000) || null : null;
  if (body.tech_tags !== undefined) {
    updates.tech_tags = Array.isArray(body.tech_tags)
      ? (body.tech_tags as unknown[]).filter((t): t is string => typeof t === "string").map((t) => t.trim().slice(0, 50)).filter(Boolean)
      : [];
  }
  if (body.remote_ok !== undefined) updates.remote_ok = typeof body.remote_ok === "boolean" ? body.remote_ok : false;
  if (body.expires_at !== undefined) updates.expires_at = typeof body.expires_at === "string" ? body.expires_at.trim() || null : null;
  if (body.status !== undefined) {
    updates.status = typeof body.status === "string" && ["active", "draft", "closed"].includes(body.status) ? body.status : "draft";
  }

  const { data, error } = await supabase
    .from(TABLES.job_listings)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour." }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

// DELETE /api/dashboard/jobs/[id] — supprimer une offre d'emploi
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from(TABLES.job_listings)
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return NextResponse.json({ success: false, error: "Offre introuvable." }, { status: 404 });
  }

  const { error } = await supabase.from(TABLES.job_listings).delete().eq("id", id);

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la suppression." }, { status: 500 });

  return NextResponse.json({ success: true });
}
