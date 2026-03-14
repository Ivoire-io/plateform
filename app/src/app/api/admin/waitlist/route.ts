import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "";
  const invited = searchParams.get("invited");

  const supabase = await createClient();

  let query = supabase
    .from(TABLES.waitlist)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);
  if (invited === "true") query = query.eq("invited", true);
  if (invited === "false") query = query.eq("invited", false);

  const { data, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ entries: data ?? [], total: count ?? 0 });
}
