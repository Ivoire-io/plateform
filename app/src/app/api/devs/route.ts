import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const skill = searchParams.get("skill") || "";
  const city = searchParams.get("city") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "recent";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(Math.max(1, Number(searchParams.get("limit") || "12")), 50);
  const available = searchParams.get("available") === "true";

  const offset = (page - 1) * limit;

  try {
    // ── Build main query ──
    let query = supabaseAdmin
      .from(TABLES.profiles)
      .select(
        "id, slug, full_name, title, city, bio, avatar_url, skills, is_available, type, verified_badge, created_at",
        { count: "exact" }
      )
      .eq("type", "developer")
      .eq("privacy_visible_in_directory", true);

    // Skill filter — check if skills array contains the value
    if (skill) {
      query = query.contains("skills", [skill]);
    }

    // City filter — exact match
    if (city) {
      query = query.eq("city", city);
    }

    // Search filter — ilike on full_name or title
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,title.ilike.%${search}%`
      );
    }

    // Available filter
    if (available) {
      query = query.eq("is_available", true);
    }

    // Sort
    switch (sort) {
      case "popular":
        query = query
          .order("verified_badge", { ascending: false })
          .order("created_at", { ascending: false });
        break;
      case "alpha":
        query = query.order("full_name", { ascending: true });
        break;
      case "recent":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: profiles, error, count } = await query;

    if (error) {
      console.error("[GET /api/devs] query error:", error.message);
      return NextResponse.json(
        { error: "Erreur serveur." },
        { status: 500 }
      );
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    // ── Fetch ratings for returned profiles ──
    const profileIds = (profiles ?? []).map((p) => p.id);
    let ratingsMap: Record<string, { avg_rating: number; review_count: number }> = {};

    if (profileIds.length > 0) {
      const { data: ratings } = await supabaseAdmin
        .from(TABLES.profile_ratings)
        .select("profile_id, avg_rating, review_count")
        .in("profile_id", profileIds);

      if (ratings) {
        ratingsMap = Object.fromEntries(
          ratings.map((r) => [
            r.profile_id,
            { avg_rating: Number(r.avg_rating), review_count: Number(r.review_count) },
          ])
        );
      }
    }

    // Attach ratings to profiles
    const enrichedProfiles = (profiles ?? []).map((p) => ({
      ...p,
      avg_rating: ratingsMap[p.id]?.avg_rating ?? null,
      review_count: ratingsMap[p.id]?.review_count ?? 0,
    }));

    // ── Fetch filter counts (skills & cities) ──
    // Get ALL visible developer profiles for aggregation
    const { data: allProfiles } = await supabaseAdmin
      .from(TABLES.profiles)
      .select("skills, city")
      .eq("type", "developer")
      .eq("privacy_visible_in_directory", true);

    const skillCounts: Record<string, number> = {};
    const cityCounts: Record<string, number> = {};

    if (allProfiles) {
      for (const p of allProfiles) {
        if (Array.isArray(p.skills)) {
          for (const s of p.skills) {
            if (s) skillCounts[s] = (skillCounts[s] || 0) + 1;
          }
        }
        if (p.city) {
          cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
        }
      }
    }

    const skills = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const cities = Object.entries(cityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      profiles: enrichedProfiles,
      total,
      page,
      totalPages,
      filters: { skills, cities },
    });
  } catch (err) {
    console.error("[GET /api/devs] unexpected error:", err);
    return NextResponse.json(
      { error: "Erreur serveur inattendue." },
      { status: 500 }
    );
  }
}
