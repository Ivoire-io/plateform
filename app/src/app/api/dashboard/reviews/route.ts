import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET /api/dashboard/reviews — List reviews received by current user
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

  // Fetch reviews received
  const { data: reviews, error } = await supabase
    .from(TABLES.reviews)
    .select(
      `
      id,
      reviewer_id,
      reviewed_id,
      project_ref,
      rating,
      comment,
      status,
      created_at,
      ${TABLES.profiles}!ivoireio_reviews_reviewer_id_fkey (
        full_name,
        slug,
        avatar_url
      )
    `
    )
    .eq("reviewed_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/dashboard/reviews]", error.message);
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }

  // Flatten reviewer data
  const enrichedReviews = (reviews ?? []).map((r) => {
    const reviewerData = (r as Record<string, unknown>)[TABLES.profiles];
    return {
      id: r.id,
      reviewer_id: r.reviewer_id,
      reviewed_id: r.reviewed_id,
      project_ref: r.project_ref,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      created_at: r.created_at,
      reviewer: reviewerData ?? null,
    };
  });

  // Also fetch aggregate rating
  const { data: ratingData } = await supabase
    .from(TABLES.profile_ratings)
    .select("avg_rating, review_count")
    .eq("profile_id", user.id)
    .single();

  return NextResponse.json({
    success: true,
    reviews: enrichedReviews,
    rating: ratingData
      ? {
        avg_rating: Number(ratingData.avg_rating),
        review_count: Number(ratingData.review_count),
      }
      : { avg_rating: 0, review_count: 0 },
  });
}

// POST /api/dashboard/reviews — Submit a review
export async function POST(request: NextRequest) {
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

  const reviewed_id =
    typeof body.reviewed_id === "string" ? body.reviewed_id.trim() : "";
  const project_ref =
    typeof body.project_ref === "string"
      ? body.project_ref.trim().slice(0, 200) || null
      : null;
  const rating =
    typeof body.rating === "number" ? Math.round(body.rating) : 0;
  const comment =
    typeof body.comment === "string"
      ? body.comment.trim().slice(0, 2000) || null
      : null;

  // Validate reviewed_id
  if (!reviewed_id) {
    return NextResponse.json(
      { success: false, error: "reviewed_id est requis." },
      { status: 400 }
    );
  }

  // Cannot review yourself
  if (reviewed_id === user.id) {
    return NextResponse.json(
      { success: false, error: "Vous ne pouvez pas vous evaluer vous-meme." },
      { status: 400 }
    );
  }

  // Validate rating 1-5
  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { success: false, error: "La note doit etre entre 1 et 5." },
      { status: 400 }
    );
  }

  // Verify the reviewed profile exists
  const { data: reviewedProfile } = await supabase
    .from(TABLES.profiles)
    .select("id")
    .eq("id", reviewed_id)
    .single();

  if (!reviewedProfile) {
    return NextResponse.json(
      { success: false, error: "Profil evalue introuvable." },
      { status: 404 }
    );
  }

  // Insert the review
  const { data: review, error: insertError } = await supabase
    .from(TABLES.reviews)
    .insert({
      reviewer_id: user.id,
      reviewed_id,
      project_ref,
      rating,
      comment,
      status: "published",
    })
    .select()
    .single();

  if (insertError) {
    console.error("[POST /api/dashboard/reviews]", insertError.message);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la creation de l'avis." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: review }, { status: 201 });
}
