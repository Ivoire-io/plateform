import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/team — liste les membres de l'équipe de la startup
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

  const { data, error } = await supabase
    .from(TABLES.team_members)
    .select("*")
    .eq("startup_id", startup.id)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

// POST /api/dashboard/team — ajouter un membre à l'équipe
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps invalide." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  const role = typeof body.role === "string" ? body.role.trim().slice(0, 100) : "";

  if (!name || !role) {
    return NextResponse.json({ success: false, error: "Le nom et le rôle sont requis." }, { status: 400 });
  }

  const insert = {
    startup_id: startup.id,
    name,
    role,
    email: typeof body.email === "string" ? body.email.trim().slice(0, 255) || null : null,
    linkedin: sanitizeUrl(body.linkedin),
    ivoireio_slug: typeof body.ivoireio_slug === "string" ? body.ivoireio_slug.trim().slice(0, 30) || null : null,
    sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
  };

  const { data, error } = await supabase
    .from(TABLES.team_members)
    .insert(insert)
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la création." }, { status: 500 });

  return NextResponse.json({ success: true, data }, { status: 201 });
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
