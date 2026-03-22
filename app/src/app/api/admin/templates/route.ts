import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;


  const { data, error } = await supabaseAdmin
    .from(TABLES.templates)
    .select("*")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
