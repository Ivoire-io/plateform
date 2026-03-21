import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET /api/jobs — liste publique des offres d'emploi actives
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;

  const sector = searchParams.get("sector");
  const location = searchParams.get("location");
  const type = searchParams.get("type");
  const remote = searchParams.get("remote");
  const search = searchParams.get("search");

  const today = new Date().toISOString().split("T")[0];

  // Utiliser supabaseAdmin pour bypass RLS sur les lectures publiques
  let query = supabaseAdmin
    .from(TABLES.job_listings)
    .select("*, startup:startup_id(id, name, slug, logo_url, sector, city)", { count: "exact" })
    .eq("status", "active")
    .or(`expires_at.is.null,expires_at.gte.${today}`);

  // Filtres optionnels
  if (sector) {
    query = query.eq("sector", sector);
  }
  if (location) {
    query = query.ilike("location", `%${location}%`);
  }
  if (type) {
    query = query.eq("type", type);
  }
  if (remote === "true") {
    query = query.eq("remote_ok", true);
  }
  if (search) {
    const term = `%${search}%`;
    query = query.or(`title.ilike.${term},company.ilike.${term},description.ilike.${term}`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });

  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      total_pages: count ? Math.ceil(count / limit) : 0,
    },
  });
}
