import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Retourne la date de début selon la période
function getPeriodStart(period: string): string {
  const now = new Date();
  switch (period) {
    case "7j":
      now.setDate(now.getDate() - 7);
      break;
    case "30j":
      now.setDate(now.getDate() - 30);
      break;
    case "90j":
      now.setDate(now.getDate() - 90);
      break;
    case "1an":
      now.setFullYear(now.getFullYear() - 1);
      break;
    default:
      now.setDate(now.getDate() - 30);
  }
  return now.toISOString();
}

// Retourne la date de début de la période précédente (pour le calcul du trend)
function getPreviousPeriodStart(period: string): { start: string; end: string } {
  const end = new Date(getPeriodStart(period));
  const start = new Date(end);
  switch (period) {
    case "7j":
      start.setDate(start.getDate() - 7);
      break;
    case "30j":
      start.setDate(start.getDate() - 30);
      break;
    case "90j":
      start.setDate(start.getDate() - 90);
      break;
    case "1an":
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

// Calcule le trend en % (ex: +12.5 si hausse, -5.2 si baisse)
function calcTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "30j";

  const periodStart = getPeriodStart(period);
  const prevPeriod = getPreviousPeriodStart(period);

  // ── Récupérer le profile_id du user courant ──
  const { data: profile } = await supabase
    .from("ivoireio_profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  const profileId = profile.id;

  // ── Requêtes parallèles ──
  const [
    viewsCurrent,
    viewsPrevious,
    clicksCurrent,
    clicksPrevious,
    messagesCurrent,
    messagesPrevious,
    viewsForChart,
    clicksByType,
    recentMessages,
  ] = await Promise.all([
    // Vues période courante
    supabase
      .from("ivoireio_portfolio_views")
      .select("id, visitor_ip_hash")
      .eq("profile_id", profileId)
      .gte("created_at", periodStart),

    // Vues période précédente
    supabase
      .from("ivoireio_portfolio_views")
      .select("id, visitor_ip_hash")
      .eq("profile_id", profileId)
      .gte("created_at", prevPeriod.start)
      .lt("created_at", prevPeriod.end),

    // Clics période courante
    supabase
      .from("ivoireio_link_clicks")
      .select("id, link_type")
      .eq("profile_id", profileId)
      .gte("created_at", periodStart),

    // Clics période précédente
    supabase
      .from("ivoireio_link_clicks")
      .select("id")
      .eq("profile_id", profileId)
      .gte("created_at", prevPeriod.start)
      .lt("created_at", prevPeriod.end),

    // Messages période courante
    supabase
      .from("ivoireio_contact_messages")
      .select("id")
      .eq("profile_id", profileId)
      .gte("created_at", periodStart),

    // Messages période précédente
    supabase
      .from("ivoireio_contact_messages")
      .select("id")
      .eq("profile_id", profileId)
      .gte("created_at", prevPeriod.start)
      .lt("created_at", prevPeriod.end),

    // Vues par jour pour le graphique (période courante)
    supabase
      .from("ivoireio_portfolio_views")
      .select("created_at")
      .eq("profile_id", profileId)
      .gte("created_at", periodStart)
      .order("created_at", { ascending: true }),

    // Clics par type pour le TOP LIENS
    supabase
      .from("ivoireio_link_clicks")
      .select("link_type")
      .eq("profile_id", profileId)
      .gte("created_at", periodStart),

    // Derniers messages pour le résumé
    supabase
      .from("ivoireio_contact_messages")
      .select("id, name, email, message, created_at, read")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // ── Calculs ──
  const totalViews = viewsCurrent.data?.length ?? 0;
  const uniqueViews = new Set(
    viewsCurrent.data?.map((v) => v.visitor_ip_hash).filter(Boolean)
  ).size;
  const prevViews = viewsPrevious.data?.length ?? 0;
  const prevUniqueViews = new Set(
    viewsPrevious.data?.map((v) => v.visitor_ip_hash).filter(Boolean)
  ).size;

  const totalClicks = clicksCurrent.data?.length ?? 0;
  const prevClicks = clicksPrevious.data?.length ?? 0;

  const totalMessages = messagesCurrent.data?.length ?? 0;
  const prevMessages = messagesPrevious.data?.length ?? 0;

  // Graphique : regrouper les vues par jour
  const viewsByDay: Record<string, number> = {};
  for (const v of viewsForChart.data ?? []) {
    const day = v.created_at.substring(0, 10); // YYYY-MM-DD
    viewsByDay[day] = (viewsByDay[day] ?? 0) + 1;
  }

  // Remplir les jours manquants (pour avoir un graphique continu)
  const chartDays = period === "1an" ? 52 : period === "90j" ? 13 : period === "30j" ? 30 : 7;
  const isWeekly = period === "1an" || period === "90j";
  const chartData: { label: string; views: number }[] = [];

  if (isWeekly) {
    // Grouper par semaine
    const weeklyData: Record<string, number> = {};
    for (const [day, count] of Object.entries(viewsByDay)) {
      const date = new Date(day);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().substring(0, 10);
      weeklyData[weekKey] = (weeklyData[weekKey] ?? 0) + count;
    }
    // Générer les chartDays dernières semaines
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      d.setDate(d.getDate() - d.getDay()); // début de semaine
      const key = d.toISOString().substring(0, 10);
      const shortLabel = `S${Math.ceil((d.getDate() + d.getDay()) / 7)}`; // S1, S2, etc.
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

  // TOP LIENS par type
  const clickCountsByType: Record<string, number> = {};
  for (const c of clicksByType.data ?? []) {
    clickCountsByType[c.link_type] = (clickCountsByType[c.link_type] ?? 0) + 1;
  }
  const topLinks = Object.entries(clickCountsByType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({ type, count }));

  // Messages non lus (global, pas filtré par période pour le badge)
  const { count: unreadCount } = await supabase
    .from("ivoireio_contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .eq("read", false);

  return NextResponse.json({
    period,
    stats: {
      views: {
        total: totalViews,
        unique: uniqueViews,
        trend: calcTrend(totalViews, prevViews),
        uniqueTrend: calcTrend(uniqueViews, prevUniqueViews),
      },
      clicks: {
        total: totalClicks,
        trend: calcTrend(totalClicks, prevClicks),
      },
      messages: {
        total: totalMessages,
        unread: unreadCount ?? 0,
        trend: calcTrend(totalMessages, prevMessages),
      },
    },
    chart: chartData,
    topLinks,
    recentMessages: recentMessages.data ?? [],
  });
}
