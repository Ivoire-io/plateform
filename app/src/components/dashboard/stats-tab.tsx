"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

type Period = "7j" | "30j" | "90j" | "1an";

interface MetricCard {
  label: string;
  value: number | string;
  unit?: string;
  trend: number;
}

// Mock data per period
const MOCK_DATA: Record<
  Period,
  {
    metrics: MetricCard[];
    chartLabels: string[];
    chartVisites: number[];
    chartUniques: number[];
  }
> = {
  "7j": {
    metrics: [
      { label: "Visites totales", value: 89, trend: 12 },
      { label: "Visiteurs uniques", value: 64, trend: 8 },
      { label: "Durée moy. session", value: "2m 18s", trend: 5 },
      { label: "Clics liens", value: 14, trend: -3 },
      { label: "Messages reçus", value: 2, trend: 0 },
      { label: "Favoris reçus", value: 3, trend: 50 },
    ],
    chartLabels: ["L", "M", "M", "J", "V", "S", "D"],
    chartVisites: [10, 14, 11, 18, 15, 9, 12],
    chartUniques: [7, 10, 8, 13, 11, 7, 8],
  },
  "30j": {
    metrics: [
      { label: "Visites totales", value: 342, trend: 18 },
      { label: "Visiteurs uniques", value: 241, trend: 14 },
      { label: "Durée moy. session", value: "2m 45s", trend: 7 },
      { label: "Clics liens", value: 28, trend: 9 },
      { label: "Messages reçus", value: 7, trend: 40 },
      { label: "Favoris reçus", value: 12, trend: 20 },
    ],
    chartLabels: ["S1", "S2", "S3", "S4"],
    chartVisites: [72, 88, 95, 87],
    chartUniques: [51, 63, 68, 59],
  },
  "90j": {
    metrics: [
      { label: "Visites totales", value: 987, trend: 22 },
      { label: "Visiteurs uniques", value: 703, trend: 19 },
      { label: "Durée moy. session", value: "2m 52s", trend: 10 },
      { label: "Clics liens", value: 84, trend: 15 },
      { label: "Messages reçus", value: 19, trend: 58 },
      { label: "Favoris reçus", value: 35, trend: 30 },
    ],
    chartLabels: ["M1", "M2", "M3"],
    chartVisites: [298, 342, 347],
    chartUniques: [212, 244, 247],
  },
  "1an": {
    metrics: [
      { label: "Visites totales", value: 3842, trend: 45 },
      { label: "Visiteurs uniques", value: 2741, trend: 38 },
      { label: "Durée moy. session", value: "3m 01s", trend: 12 },
      { label: "Clics liens", value: 312, trend: 28 },
      { label: "Messages reçus", value: 73, trend: 80 },
      { label: "Favoris reçus", value: 121, trend: 65 },
    ],
    chartLabels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    chartVisites: [240, 280, 290, 310, 330, 350, 380, 370, 360, 340, 300, 292],
    chartUniques: [160, 192, 200, 216, 228, 244, 263, 257, 250, 236, 208, 200],
  },
};

const TOP_LINKS = [
  { label: "GitHub", clicks: 50, color: "var(--color-orange)" },
  { label: "LinkedIn", clicks: 29, color: "#0a66c2" },
  { label: "Projets", clicks: 14, color: "#22c55e" },
  { label: "Twitter", clicks: 7, color: "#1da1f2" },
];

const TOP_PROJECTS = [
  { name: "Portfolio ivoire.io", views: 124, clicks: 38 },
  { name: "App mobile CI+", views: 87, clicks: 21 },
  { name: "API REST Node.js", views: 65, clicks: 14 },
];

const PROVENANCE = [
  { country: "🇨🇮 Côte d'Ivoire", pct: 67 },
  { country: "🇫🇷 France", pct: 14 },
  { country: "🇸🇳 Sénégal", pct: 8 },
  { country: "🇺🇸 États-Unis", pct: 5 },
  { country: "🌍 Autres", pct: 6 },
];

const SOURCES = [
  { label: "Google", pct: 34, color: "#4285f4" },
  { label: "Direct", pct: 28, color: "#6b7280" },
  { label: "LinkedIn", pct: 22, color: "#0a66c2" },
  { label: "Twitter", pct: 10, color: "#1da1f2" },
  { label: "Autres", pct: 6, color: "#8b5cf6" },
];

export function StatsTab() {
  const [period, setPeriod] = useState<Period>("30j");
  const data = MOCK_DATA[period];
  const maxChart = Math.max(...data.chartVisites);

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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {data.metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
              <p className="text-2xl font-bold">{m.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {m.trend > 0 ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-green-500">+{m.trend}%</span>
                  </>
                ) : m.trend < 0 ? (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs text-red-400">{m.trend}%</span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Visites & Visiteurs uniques — {period}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {data.chartLabels.map((label, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-0.5" style={{ height: 90 }}>
                  {/* Visites bar */}
                  <div className="w-full flex flex-col justify-end" style={{ height: 90 }}>
                    <div className="flex items-end justify-center gap-0.5 h-full">
                      <div
                        className="w-[45%] rounded-t transition-all"
                        style={{
                          height: `${(data.chartVisites[i] / maxChart) * 80}px`,
                          background: "var(--color-orange)",
                          opacity: 0.9,
                        }}
                      />
                      <div
                        className="w-[45%] rounded-t transition-all"
                        style={{
                          height: `${(data.chartUniques[i] / maxChart) * 80}px`,
                          background: "color-mix(in srgb, var(--color-orange) 45%, #3b82f6)",
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-3 h-2 rounded-sm" style={{ background: "var(--color-orange)" }} />
              Visites
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div
                className="w-3 h-2 rounded-sm"
                style={{
                  background: "color-mix(in srgb, var(--color-orange) 45%, #3b82f6)",
                  opacity: 0.7,
                }}
              />
              Visiteurs uniques
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top links */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top liens cliqués</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {TOP_LINKS.map((link) => (
              <div key={link.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{link.label}</span>
                  <span className="font-medium">{link.clicks}%</span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--color-surface)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${link.clicks}%`, background: link.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top projects */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top projets consultés</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {TOP_PROJECTS.map((proj, i) => (
              <div key={proj.name} className="flex items-center gap-3">
                <span
                  className="text-sm font-bold shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: "color-mix(in srgb, var(--color-orange) 20%, transparent)",
                    color: "var(--color-orange)",
                    fontSize: 11,
                  }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{proj.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {proj.views} vues · {proj.clicks} clics
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Provenance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              Provenance géographique
              {period !== "7j" && period !== "30j" && (
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {PROVENANCE.map((item) => (
              <div key={item.country}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.country}</span>
                  <span className="font-medium">{item.pct}%</span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--color-surface)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.pct}%`,
                      background: "var(--color-orange)",
                      opacity: 0.75,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Sources de trafic</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {SOURCES.map((src) => (
              <div key={src.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{src.label}</span>
                  <span className="font-medium">{src.pct}%</span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--color-surface)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${src.pct}%`, background: src.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

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
