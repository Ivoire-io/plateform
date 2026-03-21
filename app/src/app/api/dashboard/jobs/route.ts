import { checkResourceLimit } from "@/lib/plan-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/jobs — liste les offres d'emploi de l'utilisateur
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from(TABLES.job_listings)
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

// POST /api/dashboard/jobs — créer une offre d'emploi
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  // Check job listing limit
  const { count: jobCount } = await supabase
    .from(TABLES.job_listings)
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id);
  const limitCheck = await checkResourceLimit(user.id, "job_listings", jobCount ?? 0);
  if (!limitCheck.allowed) return limitCheck.response!;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps invalide." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim().slice(0, 200) : "";
  const company = typeof body.company === "string" ? body.company.trim().slice(0, 100) : "";

  if (!title || !company) {
    return NextResponse.json({ success: false, error: "Le titre et l'entreprise sont requis." }, { status: 400 });
  }

  const techTags = Array.isArray(body.tech_tags)
    ? (body.tech_tags as unknown[]).filter((t): t is string => typeof t === "string").map((t) => t.trim().slice(0, 50)).filter(Boolean)
    : [];

  // Récupérer la startup de l'utilisateur si elle existe
  const { data: startup } = await supabase
    .from(TABLES.startups)
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  const insert = {
    profile_id: user.id,
    startup_id: startup?.id || null,
    title,
    company,
    location: typeof body.location === "string" ? body.location.trim().slice(0, 100) || null : null,
    type: typeof body.type === "string" ? body.type.trim().slice(0, 50) || null : null,
    salary_min: typeof body.salary_min === "number" ? body.salary_min : null,
    salary_max: typeof body.salary_max === "number" ? body.salary_max : null,
    salary_currency: typeof body.salary_currency === "string" ? body.salary_currency.trim().slice(0, 10) || "XOF" : "XOF",
    description: typeof body.description === "string" ? body.description.trim().slice(0, 10000) || null : null,
    requirements: typeof body.requirements === "string" ? body.requirements.trim().slice(0, 5000) || null : null,
    tech_tags: techTags,
    remote_ok: typeof body.remote_ok === "boolean" ? body.remote_ok : false,
    expires_at: typeof body.expires_at === "string" ? body.expires_at.trim() || null : null,
    status: typeof body.status === "string" && ["active", "draft", "closed"].includes(body.status) ? body.status : "draft",
  };

  const { data, error } = await supabase
    .from(TABLES.job_listings)
    .insert(insert)
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la création." }, { status: 500 });

  return NextResponse.json({ success: true, data }, { status: 201 });
}
