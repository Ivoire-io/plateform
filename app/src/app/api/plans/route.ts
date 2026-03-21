import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: plans, error } = await supabase
    .from(TABLES.plans)
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ plans: plans ?? [] });
}
