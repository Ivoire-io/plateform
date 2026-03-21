import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const from = (page - 1) * limit;

  // ── Build query with referrer & referred profile joins ──
  let query = supabaseAdmin
    .from(TABLES.referrals)
    .select(
      "*, referrer:referrer_id(full_name, slug, avatar_url), referred:referred_id(full_name, slug, avatar_url)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ── Compute aggregate stats ──
  const { count: totalCount } = await supabaseAdmin
    .from(TABLES.referrals)
    .select("*", { count: "exact", head: true });

  const { count: convertedCount } = await supabaseAdmin
    .from(TABLES.referrals)
    .select("*", { count: "exact", head: true })
    .eq("status", "converted");

  const { data: rewardRows } = await supabaseAdmin
    .from(TABLES.referrals)
    .select("reward_amount")
    .not("reward_amount", "is", null);

  const totalRewards = (rewardRows ?? []).reduce(
    (sum: number, r: { reward_amount: number }) => sum + (r.reward_amount ?? 0),
    0
  );

  return NextResponse.json({
    referrals: data ?? [],
    total: count ?? 0,
    stats: {
      total: totalCount ?? 0,
      converted: convertedCount ?? 0,
      total_rewards: totalRewards,
    },
  });
}
