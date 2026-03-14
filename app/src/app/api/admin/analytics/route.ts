import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "30d";

  const supabase = await createClient();

  const days = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Inscriptions par type
  const [
    { data: profilesByType },
    { data: recentSignups },
    { count: totalProfiles },
  ] = await Promise.all([
    supabase
      .from(TABLES.profiles)
      .select("profile_type, created_at")
      .gte("created_at", since),
    supabase
      .from(TABLES.profiles)
      .select("created_at")
      .gte("created_at", since)
      .order("created_at"),
    supabase
      .from(TABLES.profiles)
      .select("*", { count: "exact", head: true }),
  ]);

  // Agrégation par type
  const typeCounts: Record<string, number> = {};
  for (const p of profilesByType ?? []) {
    typeCounts[p.profile_type] = (typeCounts[p.profile_type] ?? 0) + 1;
  }

  // Agrégation inscriptions par jour
  const signupsByDay: Record<string, number> = {};
  for (const p of recentSignups ?? []) {
    const day = p.created_at.slice(0, 10);
    signupsByDay[day] = (signupsByDay[day] ?? 0) + 1;
  }

  return NextResponse.json({
    totalProfiles: totalProfiles ?? 0,
    typeCounts,
    signupsByDay,
    period,
    days,
  });
}
