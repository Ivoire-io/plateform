import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 50;
  const from = (page - 1) * limit;
  const type = searchParams.get("type") ?? "";
  const period = searchParams.get("period") ?? "7d";


  const now = new Date();
  const days = period === "1d" ? 1 : period === "30d" ? 30 : period === "90d" ? 90 : 7;
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  let query = supabaseAdmin
    .from(TABLES.admin_logs)
    .select("*, admin:admin_id(full_name)", { count: "exact" })
    .gte("created_at", since)
    .range(from, from + limit - 1)
    .order("created_at", { ascending: false });

  if (type) query = query.eq("action", type);

  const { data, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ logs: data ?? [], total: count ?? 0 });
}
