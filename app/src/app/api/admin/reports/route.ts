import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "pending";


  const { data, error } = await supabaseAdmin
    .from(TABLES.reports)
    .select("*, reporter:reporter_id(full_name, slug), target:target_id(full_name, slug)")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
