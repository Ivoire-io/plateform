import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/products — liste les produits de la startup
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
    .from(TABLES.products)
    .select("*")
    .eq("startup_id", startup.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

// POST /api/dashboard/products — créer un produit
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
  const short_desc = typeof body.short_desc === "string" ? body.short_desc.trim().slice(0, 300) : "";

  if (!name || !short_desc) {
    return NextResponse.json({ success: false, error: "Le nom et la description courte sont requis." }, { status: 400 });
  }

  const techStack = Array.isArray(body.tech_stack)
    ? (body.tech_stack as unknown[]).filter((t): t is string => typeof t === "string").map((t) => t.trim().slice(0, 50)).filter(Boolean)
    : [];

  const insert = {
    startup_id: startup.id,
    name,
    short_desc,
    long_desc: typeof body.long_desc === "string" ? body.long_desc.trim().slice(0, 5000) || null : null,
    category: typeof body.category === "string" ? body.category.trim().slice(0, 50) || null : null,
    tech_stack: techStack,
    website_url: sanitizeUrl(body.website_url),
    app_store_url: sanitizeUrl(body.app_store_url),
    play_store_url: sanitizeUrl(body.play_store_url),
    docs_url: sanitizeUrl(body.docs_url),
    github_url: sanitizeUrl(body.github_url),
    launch_date: typeof body.launch_date === "string" ? body.launch_date.trim() || null : null,
    publish_on_portal: typeof body.publish_on_portal === "boolean" ? body.publish_on_portal : false,
  };

  const { data, error } = await supabase
    .from(TABLES.products)
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
