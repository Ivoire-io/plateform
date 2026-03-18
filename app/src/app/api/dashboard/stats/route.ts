import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

function getPeriodStart(period: string): string {
  const now = new Date();
  switch (period) {
    case "7j": now.setDate(now.getDate() - 7); break;
    case "30j": now.setDate(now.getDate() - 30); break;
    case "90j": now.setDate(now.getDate() - 90); break;
    case "1an": now.setFullYear(now.getFullYear() - 1); break;
    default: now.setDate(now.getDate() - 30);
  }
  return now.toISOString();
}

function getPreviousPeriodStart(period: string): { start: string; end: string } {
  const end = new Date(getPeriodStart(period));
  const start = new Date(end);
  switch (period) {
    case "7j": start.setDate(start.getDate() - 7); break;
    case "30j": start.setDate(start.getDate() - 30); break;
    case "90j": start.setDate(start.getDate() - 90); break;
    case "1an": start.setFullYear(start.getFullYear() - 1); break;
    default: start.setDate(start.getDate() - 30);
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

function calcTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "30j";
  const periodStart = getPeriodStart(period);
  const prevPeriod = getPreviousPeriodStart(period);

  const { data: profile } = await supabase
    .from(TABLES.profiles)
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  const profileId = profile.id;

  // Requêtes optimisées : combine les queries redundantes, utilise count() quand possible
  const [
    currentViews,      // visitor_ip_hash + created_at → total, unique, chart
    prevViews,         // visitor_ip_hash → total + unique trends
    currentClicks,     // link_type → total + topLinks
    prevClicksCount,   // count only
    currentMsgCount,   // count only
    prevMsgCount,      // count only
    recentMessages,
    unreadMsgCount,
  ] = await Promise.all([
    supabase.from(TABLES.portfolio_views)
      .select("visitor_ip_hash, created_at")
      .eq("profile_id", profileId).gte("created_at", periodStart),

    supabase.from(TABLES.portfolio_views)
      .select("visitor_ip_hash")
      .eq("profile_id", profileId).gte("created_at", prevPeriod.start).lt("created_at", prevPeriod.end),

    supabase.from(TABLES.link_clicks)
      .select("link_type")
      .eq("profile_id", profileId).gte("created_at", periodStart),

    supabase.from(TABLES.link_clicks)
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId).gte("created_at", prevPeriod.start).lt("created_at", prevPeriod.end),

    supabase.from(TABLES.contact_messages)
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId).gte("created_at", periodStart),

    supabase.from(TABLES.contact_messages)
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId).gte("created_at", prevPeriod.start).lt("created_at", prevPeriod.end),

    supabase.from(TABLES.contact_messages)
      .select("id, sender_name, sender_email, message, created_at, is_read")
      .eq("profile_id", profileId).order("created_at", { ascending: false }).limit(5),

    supabase.from(TABLES.contact_messages)
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId).eq("is_read", false),
  ]);

  const viewsData = currentViews.data ?? [];
  const totalViews = viewsData.length;
  const uniqueViews = new Set(viewsData.map((v) => v.visitor_ip_hash).filter(Boolean)).size;

  const prevViewsData = prevViews.data ?? [];
  const prevTotalViews = prevViewsData.length;
  const prevUniqueViews = new Set(prevViewsData.map((v) => v.visitor_ip_hash).filter(Boolean)).size;

  const clicksData = currentClicks.data ?? [];
  const totalClicks = clicksData.length;
  const prevClicks = prevClicksCount.count ?? 0;

  const totalMessages = currentMsgCount.count ?? 0;
  const prevMessages = prevMsgCount.count ?? 0;

  // Chart : regrouper les vues par jour depuis currentViews
  const viewsByDay: Record<string, number> = {};
  for (const v of viewsData) {
    const day = v.created_at.substring(0, 10);
    viewsByDay[day] = (viewsByDay[day] ?? 0) + 1;
  }

  const chartDays = period === "1an" ? 52 : period === "90j" ? 13 : period === "30j" ? 30 : 7;
  const isWeekly = period === "1an" || period === "90j";
  const chartData: { label: string; views: number }[] = [];

  if (isWeekly) {
    const weeklyData: Record<string, number> = {};
    for (const [day, count] of Object.entries(viewsByDay)) {
      const date = new Date(day);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().substring(0, 10);
      weeklyData[weekKey] = (weeklyData[weekKey] ?? 0) + count;
    }
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      d.setDate(d.getDate() - d.getDay());
      const key = d.toISOString().substring(0, 10);
      const shortLabel = `S${Math.ceil((d.getDate() + d.getDay()) / 7)}`;
      chartData.push({
        label: period === "1an" ? `${d.toLocaleString("fr", { month: "short" })} S${Math.ceil(d.getDate() / 7)}` : shortLabel,
        views: weeklyData[key] ?? 0,
      });
    }
  } else {
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().substring(0, 10);
      const day = d.getDate();
      const monthShort = d.toLocaleString("fr", { month: "short" });
      chartData.push({
        label: period === "30j" ? `${day} ${monthShort}` : d.toLocaleString("fr", { weekday: "short" }),
        views: viewsByDay[key] ?? 0,
      });
    }
  }

  // Top liens par type
  const clickCountsByType: Record<string, number> = {};
  for (const c of clicksData) {
    clickCountsByType[c.link_type] = (clickCountsByType[c.link_type] ?? 0) + 1;
  }
  const topLinks = Object.entries(clickCountsByType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));

  return NextResponse.json({
    period,
    stats: {
      views: {
        total: totalViews,
        unique: uniqueViews,
        trend: calcTrend(totalViews, prevTotalViews),
        uniqueTrend: calcTrend(uniqueViews, prevUniqueViews),
      },
      clicks: {
        total: totalClicks,
        trend: calcTrend(totalClicks, prevClicks),
      },
      messages: {
        total: totalMessages,
        unread: unreadMsgCount.count ?? 0,
        trend: calcTrend(totalMessages, prevMessages),
      },
    },
    chart: chartData,
    topLinks,
    recentMessages: recentMessages.data ?? [],
  });
}
