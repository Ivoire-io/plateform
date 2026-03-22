import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/dashboard/jobs/[id]/apply — Submit a job application
export async function POST(request: NextRequest, { params }: RouteParams) {
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

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const cover_letter =
    typeof body.cover_letter === "string"
      ? body.cover_letter.trim().slice(0, 5000) || null
      : null;
  const cv_url =
    typeof body.cv_url === "string"
      ? body.cv_url.trim().slice(0, 500) || null
      : null;

  // Validate: job exists and is active
  const { data: job, error: jobError } = await supabase
    .from(TABLES.job_listings)
    .select("id, status, profile_id")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    return NextResponse.json(
      { success: false, error: "Offre introuvable." },
      { status: 404 }
    );
  }

  if (job.status !== "active") {
    return NextResponse.json(
      { success: false, error: "Cette offre n'est plus active." },
      { status: 400 }
    );
  }

  // Cannot apply to own job
  if (job.profile_id === user.id) {
    return NextResponse.json(
      { success: false, error: "Vous ne pouvez pas postuler a votre propre offre." },
      { status: 400 }
    );
  }

  // Check if already applied (UNIQUE constraint on job_id + profile_id)
  const { data: existing } = await supabase
    .from(TABLES.job_applications)
    .select("id")
    .eq("job_id", jobId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { success: false, error: "Vous avez deja postule a cette offre." },
      { status: 409 }
    );
  }

  // Insert application
  const { data: application, error: insertError } = await supabase
    .from(TABLES.job_applications)
    .insert({
      job_id: jobId,
      profile_id: user.id,
      cover_letter,
      cv_url,
      status: "pending",
    })
    .select()
    .single();

  if (insertError) {
    // Handle unique constraint violation at DB level too
    if (insertError.code === "23505") {
      return NextResponse.json(
        { success: false, error: "Vous avez deja postule a cette offre." },
        { status: 409 }
      );
    }
    console.error("[POST /api/dashboard/jobs/[id]/apply]", insertError.message);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la candidature." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: application }, { status: 201 });
}
