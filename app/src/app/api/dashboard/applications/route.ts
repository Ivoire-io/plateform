import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/applications — List all applications by current user
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Non authentifie." },
      { status: 401 }
    );
  }

  // Fetch applications with joined job details
  const { data: applications, error } = await supabase
    .from(TABLES.job_applications)
    .select(
      `
      id,
      job_id,
      profile_id,
      cover_letter,
      cv_url,
      status,
      reviewer_notes,
      reviewed_at,
      created_at,
      updated_at,
      ${TABLES.job_listings} (
        id,
        title,
        company,
        location,
        type,
        salary_min,
        salary_max,
        salary_currency,
        tech_tags,
        status,
        expires_at
      )
    `
    )
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/dashboard/applications]", error.message);
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }

  // Flatten the joined job data for easier consumption
  const enrichedApplications = (applications ?? []).map((app) => {
    const jobData = (app as Record<string, unknown>)[TABLES.job_listings];
    return {
      id: app.id,
      job_id: app.job_id,
      profile_id: app.profile_id,
      cover_letter: app.cover_letter,
      cv_url: app.cv_url,
      status: app.status,
      reviewer_notes: app.reviewer_notes,
      reviewed_at: app.reviewed_at,
      created_at: app.created_at,
      updated_at: app.updated_at,
      job: jobData ?? null,
    };
  });

  return NextResponse.json({
    success: true,
    applications: enrichedApplications,
  });
}
