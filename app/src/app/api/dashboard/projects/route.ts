import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/projects — liste les projets de l'utilisateur
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from(TABLES.projects)
    .select("*")
    .eq("profile_id", user.id)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

// POST /api/dashboard/projects — crée un projet
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps invalide." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  if (!name) {
    return NextResponse.json({ success: false, error: "Le nom du projet est requis." }, { status: 400 });
  }

  const techStack = Array.isArray(body.tech_stack)
    ? (body.tech_stack as unknown[]).filter((t): t is string => typeof t === "string").map((t) => t.trim().slice(0, 50)).filter(Boolean)
    : [];

  const insert = {
    profile_id: user.id, // la RLS vérifie que profile_id ∈ profils appartenant à user
    name,
    description: typeof body.description === "string" ? body.description.trim().slice(0, 500) || null : null,
    tech_stack: techStack,
    github_url: sanitizeUrl(body.github_url),
    demo_url: sanitizeUrl(body.demo_url),
    image_url: sanitizeUrl(body.image_url),
    sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
  };

  const { data, error } = await supabase.from(TABLES.projects).insert(insert).select().single();

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
