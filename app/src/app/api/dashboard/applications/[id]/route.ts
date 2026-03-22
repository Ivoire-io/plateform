import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/dashboard/applications/[id] — Update application status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Corps invalide." },
      { status: 400 }
    );
  }

  // Fetch the application with job info to determine permissions
  const { data: application, error: fetchError } = await supabase
    .from(TABLES.job_applications)
    .select(`
      id,
      profile_id,
      job_id,
      status,
      ${TABLES.job_listings} ( profile_id )
    `)
    .eq("id", id)
    .single();

  if (fetchError || !application) {
    return NextResponse.json(
      { success: false, error: "Candidature introuvable." },
      { status: 404 }
    );
  }

  const jobData = (application as Record<string, unknown>)[TABLES.job_listings] as {
    profile_id: string;
  } | null;
  const isApplicant = application.profile_id === user.id;
  const isJobPoster = jobData?.profile_id === user.id;

  if (!isApplicant && !isJobPoster) {
    return NextResponse.json(
      { success: false, error: "Acces refuse." },
      { status: 403 }
    );
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (isApplicant) {
    // Applicant can only withdraw
    if (body.status !== "withdrawn") {
      return NextResponse.json(
        { success: false, error: "Vous pouvez uniquement retirer votre candidature." },
        { status: 400 }
      );
    }
    // Can only withdraw if not already withdrawn, accepted, or rejected
    if (["withdrawn", "accepted", "rejected"].includes(application.status as string)) {
      return NextResponse.json(
        { success: false, error: "Cette candidature ne peut plus etre retiree." },
        { status: 400 }
      );
    }
    updates.status = "withdrawn";
  } else if (isJobPoster) {
    // Job poster can update status and reviewer_notes
    const validStatuses = ["reviewed", "interview", "accepted", "rejected"];
    if (body.status && typeof body.status === "string") {
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Statut invalide. Valeurs acceptees: ${validStatuses.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updates.status = body.status;
      updates.reviewed_at = new Date().toISOString();
    }
    if (typeof body.reviewer_notes === "string") {
      updates.reviewer_notes = body.reviewer_notes.trim().slice(0, 2000) || null;
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from(TABLES.job_applications)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    console.error("[PATCH /api/dashboard/applications/[id]]", updateError.message);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise a jour." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: updated });
}
