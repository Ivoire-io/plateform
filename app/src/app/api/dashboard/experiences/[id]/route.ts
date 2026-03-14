import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/dashboard/experiences/[id]
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from(TABLES.experiences)
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return NextResponse.json({ success: false, error: "Expérience introuvable." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps invalide." }, { status: 400 });
  }

  const role = typeof body.role === "string" ? body.role.trim().slice(0, 100) : "";
  const company = typeof body.company === "string" ? body.company.trim().slice(0, 100) : "";
  const startDate = typeof body.start_date === "string" ? body.start_date : "";

  if (!role || !company || !startDate) {
    return NextResponse.json({ success: false, error: "Champs requis manquants." }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return NextResponse.json({ success: false, error: "Format de date invalide." }, { status: 400 });
  }

  const endDate = typeof body.end_date === "string" && body.end_date.trim() ? body.end_date.trim() : null;

  const { data, error } = await supabase
    .from(TABLES.experiences)
    .update({
      role,
      company,
      start_date: startDate,
      end_date: endDate,
      description: typeof body.description === "string" ? body.description.trim().slice(0, 500) || null : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour." }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

// DELETE /api/dashboard/experiences/[id]
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from(TABLES.experiences)
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return NextResponse.json({ success: false, error: "Expérience introuvable." }, { status: 404 });
  }

  const { error } = await supabase.from(TABLES.experiences).delete().eq("id", id);

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la suppression." }, { status: 500 });

  return NextResponse.json({ success: true });
}
