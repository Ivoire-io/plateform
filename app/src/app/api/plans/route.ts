import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get("target_type");

  let query = supabase
    .from(TABLES.plans)
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  // Filter by target_type if provided
  if (targetType) {
    query = query.in("target_type", ["all", targetType]);
  }

  const { data: plans, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ plans: plans ?? [] });
}
