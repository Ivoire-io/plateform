import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/profiles — liste les profils (pour l'annuaire)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skill = searchParams.get("skill");
  const city = searchParams.get("city");
  const available = searchParams.get("available");
  const type = searchParams.get("type") || "developer";
  const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);

  try {
    let query = supabaseAdmin
      .from(TABLES.profiles)
      .select(
        "id, slug, full_name, title, city, avatar_url, skills, is_available, type, created_at"
      )
      .eq("type", type)
      .eq("privacy_visible_in_directory", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (skill) {
      query = query.contains("skills", [skill]);
    }
    if (city) {
      query = query.eq("city", city);
    }
    if (available === "true") {
      query = query.eq("is_available", true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
