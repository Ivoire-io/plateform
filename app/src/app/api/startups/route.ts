import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/startups — liste publique des startups approuvées
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get("sector");
  const stage = searchParams.get("stage");
  const city = searchParams.get("city");
  const sort = searchParams.get("sort") || "upvotes"; // upvotes | recent
  const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);
  const offset = Number(searchParams.get("offset") || "0");

  try {
    let query = supabaseAdmin
      .from(TABLES.startups)
      .select("*, profile:ivoireio_profiles!profile_id(full_name, slug, avatar_url)")
      .eq("status", "approved")
      .range(offset, offset + limit - 1);

    if (sector) query = query.eq("sector", sector);
    if (stage) query = query.eq("stage", stage);
    if (city) query = query.ilike("city", `%${city}%`);

    if (sort === "recent") {
      query = query.order("created_at", { ascending: false });
    } else {
      query = query.order("upvotes_count", { ascending: false });
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [], total: count });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
