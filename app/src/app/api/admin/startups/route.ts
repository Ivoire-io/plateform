import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/admin/startups — Liste toutes les startups (admin)
export async function GET(request: Request) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const sector = searchParams.get("sector");
  const page = Number(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  let query = supabase
    .from(TABLES.startups)
    .select("*, profile:ivoireio_profiles!profile_id(full_name, slug, avatar_url)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (sector) query = query.eq("sector", sector);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  return NextResponse.json({ startups: data || [], total: count ?? 0 });
}
