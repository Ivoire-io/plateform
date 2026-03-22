import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET /api/dynamic-fields?category=city — Public endpoint (reads active fields)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  let query = supabaseAdmin
    .from(TABLES.dynamic_fields)
    .select("value, label, parent, category")
    .eq("is_active", true)
    .order("sort_order")
    .order("label");

  if (category) query = query.eq("category", category);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Group by category
  if (!category) {
    const grouped: Record<string, typeof data> = {};
    for (const item of data ?? []) {
      const cat = item.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    }
    return NextResponse.json(grouped);
  }

  return NextResponse.json(data ?? []);
}
