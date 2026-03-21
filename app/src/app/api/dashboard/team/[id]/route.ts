import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/dashboard/team/[id] — modifier un membre de l'équipe
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  // Vérifier que le membre appartient à la startup de l'utilisateur
  const { data: existing } = await supabase
    .from(TABLES.team_members)
    .select("id, startup_id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ success: false, error: "Membre introuvable." }, { status: 404 });
  }

  // Vérifier la propriété de la startup
  const { data: startup } = await supabase
    .from(TABLES.startups)
    .select("id")
    .eq("id", existing.startup_id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!startup) {
    return NextResponse.json({ success: false, error: "Membre introuvable." }, { status: 404 });
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
  if (body.role !== undefined) {
    const role = typeof body.role === "string" ? body.role.trim().slice(0, 100) : "";
    if (!role) return NextResponse.json({ success: false, error: "Le rôle est requis." }, { status: 400 });
    updates.role = role;
  }
  if (body.email !== undefined) updates.email = typeof body.email === "string" ? body.email.trim().slice(0, 255) || null : null;
  if (body.linkedin !== undefined) updates.linkedin = sanitizeUrl(body.linkedin);
  if (body.ivoireio_slug !== undefined) updates.ivoireio_slug = typeof body.ivoireio_slug === "string" ? body.ivoireio_slug.trim().slice(0, 30) || null : null;
  if (body.sort_order !== undefined) updates.sort_order = typeof body.sort_order === "number" ? body.sort_order : 0;

  const { data, error } = await supabase
    .from(TABLES.team_members)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour." }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

// DELETE /api/dashboard/team/[id] — supprimer un membre de l'équipe
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  // Vérifier que le membre appartient à la startup de l'utilisateur
  const { data: existing } = await supabase
    .from(TABLES.team_members)
    .select("id, startup_id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ success: false, error: "Membre introuvable." }, { status: 404 });
  }

  const { data: startup } = await supabase
    .from(TABLES.startups)
    .select("id")
    .eq("id", existing.startup_id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!startup) {
    return NextResponse.json({ success: false, error: "Membre introuvable." }, { status: 404 });
  }

  const { error } = await supabase.from(TABLES.team_members).delete().eq("id", id);

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la suppression." }, { status: 500 });

  return NextResponse.json({ success: true });
}

function sanitizeUrl(raw: unknown): string | null {
  if (!raw || typeof raw !== "string" || raw.trim() === "") return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
