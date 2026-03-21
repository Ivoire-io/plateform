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
  const source = searchParams.get("source") ?? "";
  const from = (page - 1) * limit;

  let query = supabaseAdmin
    .from(TABLES.credits)
    .select("*, profile:profile_id(full_name, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (source) query = query.eq("source", source);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ credits: data ?? [], total: count ?? 0 });
}

export async function POST(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { profile_id, amount, description } = (await req.json()) as {
    profile_id: string;
    amount: number;
    description: string;
  };

  // ── Validate required fields ──
  if (!profile_id || !amount || !description) {
    return NextResponse.json(
      { error: "profile_id, amount, and description are required" },
      { status: 400 }
    );
  }

  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive number" },
      { status: 400 }
    );
  }

  // ── Insert credit with source = "admin" ──
  const { data: credit, error: creditErr } = await supabaseAdmin
    .from(TABLES.credits)
    .insert({
      profile_id,
      amount,
      description,
      source: "admin",
    })
    .select()
    .single();

  if (creditErr) {
    return NextResponse.json({ error: creditErr.message }, { status: 500 });
  }

  // ── Log in admin_logs ──
  await supabaseAdmin.from(TABLES.admin_logs).insert({
    admin_id: guard.userId,
    action: "credit_granted",
    target_type: "credit",
    target_id: credit.id,
    metadata: { profile_id, amount, description },
  });

  return NextResponse.json({ success: true, credit });
}
