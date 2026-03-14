import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { target_type, target_plan } = await req.json() as {
    target_type?: string;
    target_plan?: string;
  };

  const supabase = await createClient();

  let query = supabase
    .from(TABLES.profiles)
    .select("*", { count: "exact", head: true })
    .eq("is_suspended", false);

  if (target_type) query = query.eq("profile_type", target_type);
  if (target_plan) query = query.eq("plan", target_plan);

  const { count } = await query;

  return NextResponse.json({ count: count ?? 0 });
}
