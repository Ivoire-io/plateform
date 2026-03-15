"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

type Period = "7j" | "30j" | "90j" | "1an";

interface StatsApiResponse {
  period: string;
  stats: {
    views: { total: number; unique: number; trend: number; uniqueTrend: number };
    clicks: { total: number; trend: number };
    messages: { total: number; unread: number; trend: number };
  };
  chart: { label: string; views: number }[];
  topLinks: { type: string; count: number }[];
  recentMessages: unknown[];
}

const LINK_TYPE_LABELS: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  twitter: "Twitter / X",
  website: "Site web",
  project_github: "GitHub (projet)",
  project_demo: "Démo projet",
  other: "Autre",
};

const LINK_TYPE_COLORS: Record<string, string> = {
  github: "var(--color-orange)",
  linkedin: "#0a66c2",
  twitter: "#1da1f2",
  website: "#22c55e",
  project_github: "#f59e0b",
  project_demo: "#8b5cf6",
  other: "#6b7280",
};

export function StatsTab() {
  const [period, setPeriod] = useState<Period>("30j");
  const [data, setData] = useState<StatsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard/stats?period=${period}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [period]);

  const maxChart = data ? Math.max(...data.chart.map((d) => d.views), 1) : 1;

  const metrics = data
    ? [
      {
        label: "Visites totales",
        value: data.stats.views.total,
        trend: data.stats.views.trend,
      },
      {
        label: "Visiteurs uniques",
        value: data.stats.views.unique,
        trend: data.stats.views.uniqueTrend,
      },
      {
        label: "Clics liens",
        value: data.stats.clicks.total,
        trend: data.stats.clicks.trend,
      },
      {
        label: "Messages reçus",
        value: data.stats.messages.total,
        trend: data.stats.messages.trend,
      },
    ]
    : [];

  // Top links max value pour calculer les %
  const topLinksMax = data?.topLinks[0]?.count ?? 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Statistiques</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Performance de ton portfolio</p>
        </div>
        <div className="flex gap-1">
          {(["7j", "30j", "90j", "1an"] as Period[]).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "default" : "outline"}
              onClick={() => setPeriod(p)}
              style={period === p ? { background: "var(--color-orange)", color: "#fff" } : {}}
              className="px-3"
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center justify-center h-20">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ))
          : metrics.map((m) => (
            <Card key={m.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                <p className="text-2xl font-bold">{m.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {m.trend > 0 ? (
                    <>
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs text-green-500">+{m.trend}%</span>
                      <span className="text-xs text-muted-foreground">vs période préc.</span>
                    </>
                  ) : m.trend < 0 ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-red-400">{m.trend}%</span>
                      <span className="text-xs text-muted-foreground">vs période préc.</span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">Pas encore de données comparables</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            Visites — {period}
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-28 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : data && data.chart.length > 0 ? (
            <>
              <div className="flex items-end gap-1 overflow-x-auto" style={{ height: 100 }}>
                {data.chart.map((point, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-0.5 shrink-0"
                    style={{ minWidth: data.chart.length > 20 ? 16 : 24 }}
                  >
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${(point.views / maxChart) * 80}px`,
                        background:
                          i === data.chart.length - 1
                            ? "var(--color-orange)"
                            : "color-mix(in srgb, var(--color-orange) 40%, transparent)",
                        minHeight: point.views > 0 ? 3 : 0,
                      }}
                    />
                    {data.chart.length <= 14 && (
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                        {point.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {data.chart.length > 14 && (
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">{data.chart[0]?.label}</span>
                  <span className="text-[10px] text-muted-foreground">{data.chart[data.chart.length - 1]?.label}</span>
                </div>
              )}
              {data.chart.every((d) => d.views === 0) && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Pas encore de visites sur cette période. Partagez votre portfolio !
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Données indisponibles
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top links */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Top liens cliqués</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : data && data.topLinks.length > 0 ? (
            data.topLinks.map((link) => {
              const pct = Math.round((link.count / topLinksMax) * 100);
              const label = LINK_TYPE_LABELS[link.type] ?? link.type;
              const color = LINK_TYPE_COLORS[link.type] ?? "#6b7280";
              return (
                <div key={link.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{label}</span>
                    <span className="font-medium">{link.count} clic{link.count > 1 ? "s" : ""}</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--color-surface)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun clic enregistré pour cette période.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Premium lock */}
      <Card className="border-2" style={{ borderColor: "color-mix(in srgb, var(--color-orange) 40%, transparent)" }}>
        <CardContent className="p-6 flex flex-col gap-4 items-center text-center">
          <div className="text-3xl">⭐</div>
          <div>
            <h3 className="font-semibold text-lg">Stats avancées — Premium</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Accède aux stats par entreprise, aux alertes visiteurs, à l&apos;export CSV et à l&apos;historique complet.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <div
              className="flex-1 rounded-lg p-3 text-center text-sm border"
              style={{ borderColor: "var(--color-border)" }}
            >
              <p className="font-medium">Gratuit</p>
              <ul className="text-xs text-muted-foreground mt-2 flex flex-col gap-1">
                <li>Stats 30 jours</li>
                <li>Stats basiques</li>
              </ul>
            </div>
            <div
              className="flex-1 rounded-lg p-3 text-center text-sm border-2"
              style={{
                borderColor: "var(--color-orange)",
                background: "color-mix(in srgb, var(--color-orange) 8%, transparent)",
              }}
            >
              <p className="font-semibold" style={{ color: "var(--color-orange)" }}>Premium ⭐</p>
              <ul className="text-xs text-muted-foreground mt-2 flex flex-col gap-1">
                <li>Stats illimitées</li>
                <li>Export CSV/JSON</li>
                <li>Alertes visiteurs</li>
                <li>Stats avancées</li>
              </ul>
            </div>
          </div>
          <Button
            className="w-full max-w-sm"
            style={{ background: "var(--color-orange)", color: "#fff" }}
          >
            ⭐ Passer en Premium — 3 000 FCFA/mois
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
