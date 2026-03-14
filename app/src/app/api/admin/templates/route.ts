import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLES.templates)
    .select("*")
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}
