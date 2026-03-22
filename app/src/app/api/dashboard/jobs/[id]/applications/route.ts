import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/dashboard/jobs/[id]/applications — List applications for a job (poster only)
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id: jobId } = await params;
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

  // Verify the job belongs to the current user
  const { data: job, error: jobError } = await supabase
    .from(TABLES.job_listings)
    .select("id, profile_id, title, company")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return NextResponse.json(
      { success: false, error: "Offre introuvable." },
      { status: 404 }
    );
  }

  if (job.profile_id !== user.id) {
    return NextResponse.json(
      { success: false, error: "Acces refuse. Cette offre ne vous appartient pas." },
      { status: 403 }
    );
  }

  // Fetch applications with applicant profile info
  const { data: applications, error: appsError } = await supabase
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
      ${TABLES.profiles} (
        id,
        full_name,
        slug,
        avatar_url,
        title,
        skills,
        city,
        is_available
      )
    `
    )
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (appsError) {
    console.error("[GET /api/dashboard/jobs/[id]/applications]", appsError.message);
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }

  // Flatten joined profile data
  const enrichedApplications = (applications ?? []).map((app) => {
    const profileData = (app as Record<string, unknown>)[TABLES.profiles];
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
      applicant: profileData ?? null,
    };
  });

  return NextResponse.json({
    success: true,
    job: { id: job.id, title: job.title, company: job.company },
    applications: enrichedApplications,
  });
}
