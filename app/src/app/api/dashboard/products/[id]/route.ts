import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/dashboard/products/[id] — modifier un produit
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  // Vérifier que le produit appartient à la startup de l'utilisateur
  const { data: existing } = await supabase
    .from(TABLES.products)
    .select("id, startup_id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ success: false, error: "Produit introuvable." }, { status: 404 });
  }

  const { data: startup } = await supabase
    .from(TABLES.startups)
    .select("id")
    .eq("id", existing.startup_id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!startup) {
    return NextResponse.json({ success: false, error: "Produit introuvable." }, { status: 404 });
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
  if (body.short_desc !== undefined) {
    const short_desc = typeof body.short_desc === "string" ? body.short_desc.trim().slice(0, 300) : "";
    if (!short_desc) return NextResponse.json({ success: false, error: "La description courte est requise." }, { status: 400 });
    updates.short_desc = short_desc;
  }
  if (body.long_desc !== undefined) updates.long_desc = typeof body.long_desc === "string" ? body.long_desc.trim().slice(0, 5000) || null : null;
  if (body.category !== undefined) updates.category = typeof body.category === "string" ? body.category.trim().slice(0, 50) || null : null;
  if (body.tech_stack !== undefined) {
    updates.tech_stack = Array.isArray(body.tech_stack)
      ? (body.tech_stack as unknown[]).filter((t): t is string => typeof t === "string").map((t) => t.trim().slice(0, 50)).filter(Boolean)
      : [];
  }
  if (body.website_url !== undefined) updates.website_url = sanitizeUrl(body.website_url);
  if (body.app_store_url !== undefined) updates.app_store_url = sanitizeUrl(body.app_store_url);
  if (body.play_store_url !== undefined) updates.play_store_url = sanitizeUrl(body.play_store_url);
  if (body.docs_url !== undefined) updates.docs_url = sanitizeUrl(body.docs_url);
  if (body.github_url !== undefined) updates.github_url = sanitizeUrl(body.github_url);
  if (body.launch_date !== undefined) updates.launch_date = typeof body.launch_date === "string" ? body.launch_date.trim() || null : null;
  if (body.publish_on_portal !== undefined) updates.publish_on_portal = typeof body.publish_on_portal === "boolean" ? body.publish_on_portal : false;

  const { data, error } = await supabase
    .from(TABLES.products)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour." }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

// DELETE /api/dashboard/products/[id] — supprimer un produit
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from(TABLES.products)
    .select("id, startup_id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ success: false, error: "Produit introuvable." }, { status: 404 });
  }

  const { data: startup } = await supabase
    .from(TABLES.startups)
    .select("id")
    .eq("id", existing.startup_id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!startup) {
    return NextResponse.json({ success: false, error: "Produit introuvable." }, { status: 404 });
  }

  const { error } = await supabase.from(TABLES.products).delete().eq("id", id);

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
