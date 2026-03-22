import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET /api/profiles/search?q=xxx — search profiles by name or slug
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ success: true, profiles: [] });
  }

  // Search by full_name or slug (case-insensitive via ilike)
  const { data: profiles, error } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("id, full_name, slug, avatar_url, title")
    .eq("is_suspended", false)
    .or(`full_name.ilike.%${query}%,slug.ilike.%${query}%`)
    .order("full_name", { ascending: true })
    .limit(20);

  if (error) {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, profiles: profiles ?? [] });
}
