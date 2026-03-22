import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/matches — List matches for current user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const { data: matches, error } = await supabase
      .from(TABLES.matches)
      .select("*")
      .eq("dev_id", user.id)
      .neq("status", "dismissed")
      .order("score", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: "Erreur chargement matches" }, { status: 500 });
    }

    // Enrich with entity details
    const enriched = await Promise.all(
      (matches || []).map(async (match) => {
        let entityTitle = "";
        let entityCompany = "";

        if (match.entity_type === "job_listing") {
          const { data: job } = await supabase
            .from(TABLES.job_listings)
            .select("title, company")
            .eq("id", match.entity_id)
            .single();
          entityTitle = job?.title || "";
          entityCompany = job?.company || "";
        } else if (match.entity_type === "dev_request") {
          const { data: req } = await supabase
            .from(TABLES.dev_requests)
            .select("title")
            .eq("id", match.entity_id)
            .single();
          entityTitle = req?.title || "";
          entityCompany = "Dev Outsourcing";
        }

        return { ...match, entity_title: entityTitle, entity_company: entityCompany };
      })
    );

    return NextResponse.json({ success: true, matches: enriched });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
