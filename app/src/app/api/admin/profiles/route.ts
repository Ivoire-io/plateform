import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "";
  const status = searchParams.get("status") ?? "";
  const plan = searchParams.get("plan") ?? "";
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from(TABLES.profiles)
    .select("*", { count: "exact" })
    .range(from, to)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,slug.ilike.%${search}%,bio.ilike.%${search}%`
    );
  }
  if (type) query = query.eq("type", type);
  if (status === "suspended") query = query.eq("is_suspended", true);
  if (status === "active") query = query.eq("is_suspended", false);
  if (plan) query = query.eq("plan", plan);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    profiles: data ?? [],
    total: count ?? 0,
    page,
    limit,
  });
}
