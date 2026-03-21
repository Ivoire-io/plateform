import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/dev-projects — Liste les projets de dev du user
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Récupérer la startup du user
  const { data: startup } = await supabase
    .from(TABLES.startups)
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!startup) {
    return NextResponse.json({ projects: [] });
  }

  const { data: projects, error } = await supabase
    .from(TABLES.dev_projects)
    .select("*")
    .eq("startup_id", startup.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  return NextResponse.json({ projects: projects || [] });
}
