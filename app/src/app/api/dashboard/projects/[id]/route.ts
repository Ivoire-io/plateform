import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
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

// PATCH /api/dashboard/projects/[id] — modifie un projet
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  // Vérifier que le projet appartient bien à cet utilisateur (défense en profondeur, RLS gère aussi)
  const { data: existing } = await supabase
    .from(TABLES.projects)
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return NextResponse.json({ success: false, error: "Projet introuvable." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps invalide." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  if (!name) {
    return NextResponse.json({ success: false, error: "Le nom est requis." }, { status: 400 });
  }

  const techStack = Array.isArray(body.tech_stack)
    ? (body.tech_stack as unknown[]).filter((t): t is string => typeof t === "string").map((t) => t.trim().slice(0, 50)).filter(Boolean)
    : [];

  const { data, error } = await supabase
    .from(TABLES.projects)
    .update({
      name,
      description: typeof body.description === "string" ? body.description.trim().slice(0, 500) || null : null,
      tech_stack: techStack,
      github_url: sanitizeUrl(body.github_url),
      demo_url: sanitizeUrl(body.demo_url),
      image_url: sanitizeUrl(body.image_url),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour." }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

// DELETE /api/dashboard/projects/[id] — supprime un projet
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from(TABLES.projects)
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!existing || existing.profile_id !== user.id) {
    return NextResponse.json({ success: false, error: "Projet introuvable." }, { status: 404 });
  }

  const { error } = await supabase.from(TABLES.projects).delete().eq("id", id);

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la suppression." }, { status: 500 });

  return NextResponse.json({ success: true });
}
