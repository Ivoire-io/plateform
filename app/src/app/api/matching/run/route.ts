import { matchDevToJob, matchDevToRequest } from "@/lib/matching";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { DevRequest, JobListing, Profile } from "@/lib/types";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// POST /api/matching/run — Run matching for a specific entity
// Body: { entity_type: "job_listing" | "dev_request", entity_id: string }
export async function POST(request: Request) {
  try {
    const { entity_type, entity_id } = await request.json();

    if (!entity_type || !entity_id) {
      return NextResponse.json({ error: "entity_type et entity_id requis" }, { status: 400 });
    }

    // Fetch all available developers
    const { data: devs, error: devsError } = await supabaseAdmin
      .from(TABLES.profiles)
      .select("*")
      .eq("type", "developer")
      .eq("is_suspended", false);

    if (devsError || !devs) {
      return NextResponse.json({ error: "Erreur chargement devs" }, { status: 500 });
    }

    let matches: Array<{ dev_id: string; score: number; reasons: string[] }> = [];

    if (entity_type === "job_listing") {
      const { data: job } = await supabaseAdmin
        .from(TABLES.job_listings)
        .select("*")
        .eq("id", entity_id)
        .single();

      if (!job) {
        return NextResponse.json({ error: "Job non trouve" }, { status: 404 });
      }

      matches = (devs as Profile[]).map((dev) => {
        const result = matchDevToJob(dev, job as JobListing);
        return { dev_id: dev.id, score: result.score, reasons: result.reasons };
      });
    } else if (entity_type === "dev_request") {
      const { data: req } = await supabaseAdmin
        .from(TABLES.dev_requests)
        .select("*")
        .eq("id", entity_id)
        .single();

      if (!req) {
        return NextResponse.json({ error: "Demande non trouvee" }, { status: 404 });
      }

      matches = (devs as Profile[]).map((dev) => {
        const result = matchDevToRequest(dev, req as DevRequest);
        return { dev_id: dev.id, score: result.score, reasons: result.reasons };
      });
    } else {
      return NextResponse.json({ error: "entity_type invalide" }, { status: 400 });
    }

    // Only keep matches with score >= 30
    const goodMatches = matches.filter((m) => m.score >= 30);

    // Upsert matches
    let upserted = 0;
    for (const match of goodMatches) {
      const { error } = await supabaseAdmin
        .from(TABLES.matches)
        .upsert(
          {
            dev_id: match.dev_id,
            entity_type,
            entity_id,
            score: match.score,
            match_reasons: match.reasons,
            status: "new",
            matched_at: new Date().toISOString(),
          },
          { onConflict: "dev_id,entity_type,entity_id" }
        );

      if (!error) upserted++;
    }

    return NextResponse.json({
      success: true,
      total_devs: devs.length,
      matches_found: goodMatches.length,
      matches_saved: upserted,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
