import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface AiUsageRecord {
  id: string;
  profile_id: string;
  provider: string;
  task: string;
  cost_fcfa: number;
  created_at: string;
}

interface ProfileInfo {
  id: string;
  full_name: string | null;
  slug: string | null;
  email: string | null;
}

// GET /api/admin/ai-usage — AI usage dashboard data
export async function GET(request: Request) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(request.url);
  const periodDays = Number(searchParams.get("period") || "30");

  // Calculate the start date for the period
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - periodDays);
  const periodStartISO = periodStart.toISOString();

  // Fetch all ai_usage records for the period
  const { data: records, error } = await supabaseAdmin
    .from(TABLES.ai_usage)
    .select("id, profile_id, provider, task, cost_fcfa, created_at")
    .gte("created_at", periodStartISO)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const usageRecords = (records || []) as AiUsageRecord[];

  // --- Aggregations in JS ---

  // Total cost this period
  const totalCost = usageRecords.reduce(
    (sum, r) => sum + (r.cost_fcfa || 0),
    0
  );

  // Total requests this period
  const totalRequests = usageRecords.length;

  // Cost by provider
  const costByProvider: Record<string, { cost: number; count: number }> = {};
  for (const r of usageRecords) {
    const key = r.provider || "unknown";
    if (!costByProvider[key]) costByProvider[key] = { cost: 0, count: 0 };
    costByProvider[key].cost += r.cost_fcfa || 0;
    costByProvider[key].count += 1;
  }

  // Cost by task
  const costByTask: Record<string, { cost: number; count: number }> = {};
  for (const r of usageRecords) {
    const key = r.task || "unknown";
    if (!costByTask[key]) costByTask[key] = { cost: 0, count: 0 };
    costByTask[key].cost += r.cost_fcfa || 0;
    costByTask[key].count += 1;
  }

  // Top 10 most expensive users (aggregate by profile_id)
  const costByUser: Record<string, number> = {};
  for (const r of usageRecords) {
    if (!r.profile_id) continue;
    costByUser[r.profile_id] = (costByUser[r.profile_id] || 0) + (r.cost_fcfa || 0);
  }

  // Sort and take top 10
  const topUserIds = Object.entries(costByUser)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Fetch profile info for top users
  let topUsers: Array<{
    profile_id: string;
    full_name: string | null;
    slug: string | null;
    email: string | null;
    total_cost: number;
  }> = [];

  if (topUserIds.length > 0) {
    const profileIds = topUserIds.map(([pid]) => pid);

    const { data: profiles } = await supabaseAdmin
      .from(TABLES.profiles)
      .select("id, full_name, slug, email")
      .in("id", profileIds);

    const profileMap = new Map<string, ProfileInfo>();
    for (const p of (profiles || []) as ProfileInfo[]) {
      profileMap.set(p.id, p);
    }

    topUsers = topUserIds.map(([profileId, cost]) => {
      const profile = profileMap.get(profileId);
      return {
        profile_id: profileId,
        full_name: profile?.full_name ?? null,
        slug: profile?.slug ?? null,
        email: profile?.email ?? null,
        total_cost: cost,
      };
    });
  }

  return NextResponse.json({
    period_days: periodDays,
    total_cost: totalCost,
    total_requests: totalRequests,
    cost_by_provider: costByProvider,
    cost_by_task: costByTask,
    top_users: topUsers,
  });
}
