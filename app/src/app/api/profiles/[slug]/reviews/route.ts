import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/profiles/[slug]/reviews — Public: list reviews for a profile
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  try {
    // Resolve slug to profile_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from(TABLES.profiles)
      .select("id, full_name")
      .eq("slug", slug)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Profil introuvable." },
        { status: 404 }
      );
    }

    // Fetch published reviews with reviewer info
    const { data: reviews, error: reviewsError } = await supabaseAdmin
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
        created_at
      `
      )
      .eq("reviewed_id", profile.id)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (reviewsError) {
      console.error("[GET /api/profiles/[slug]/reviews]", reviewsError.message);
      return NextResponse.json(
        { success: false, error: "Erreur serveur." },
        { status: 500 }
      );
    }

    // Fetch reviewer profiles separately for the reviews
    const reviewerIds = [...new Set((reviews ?? []).map((r) => r.reviewer_id))];
    let reviewerMap: Record<
      string,
      { full_name: string; slug: string; avatar_url: string | null }
    > = {};

    if (reviewerIds.length > 0) {
      const { data: reviewers } = await supabaseAdmin
        .from(TABLES.profiles)
        .select("id, full_name, slug, avatar_url")
        .in("id", reviewerIds);

      if (reviewers) {
        reviewerMap = Object.fromEntries(
          reviewers.map((r) => [
            r.id,
            { full_name: r.full_name, slug: r.slug, avatar_url: r.avatar_url },
          ])
        );
      }
    }

    // Enrich reviews with reviewer data
    const enrichedReviews = (reviews ?? []).map((r) => ({
      id: r.id,
      project_ref: r.project_ref,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      reviewer: reviewerMap[r.reviewer_id] ?? {
        full_name: "Utilisateur",
        slug: "",
        avatar_url: null,
      },
    }));

    // Fetch aggregate rating
    const { data: ratingData } = await supabaseAdmin
      .from(TABLES.profile_ratings)
      .select("avg_rating, review_count")
      .eq("profile_id", profile.id)
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
  } catch (err) {
    console.error("[GET /api/profiles/[slug]/reviews] unexpected:", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur inattendue." },
      { status: 500 }
    );
  }
}
