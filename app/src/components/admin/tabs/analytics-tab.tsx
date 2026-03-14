"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Download, Eye, Globe, Map, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

type Period = "7j" | "30j" | "90j" | "1an";

const PORTALS = [
  { name: "ivoire.io (landing)", pct: 27, count: 3402 },
  { name: "devs.ivoire.io", pct: 15, count: 1889 },
  { name: "Portfolios (*.ivoire.io)", pct: 34, count: 4234 },
  { name: "startups.ivoire.io", pct: 8, count: 1012 },
  { name: "jobs.ivoire.io", pct: 6, count: 756 },
  { name: "Autres portails", pct: 10, count: 1163 },
];

const TOP_PORTFOLIOS = [
  { slug: "ulrich", visits: 445 },
  { slug: "fatou", visits: 312 },
  { slug: "yapi", visits: 287 },
  { slug: "awa", visits: 198 },
  { slug: "jean", visits: 156 },
];

const GEO = [
  { flag: "🇨🇮", country: "Côte d'Ivoire", pct: 65 },
  { flag: "🇫🇷", country: "France", pct: 14 },
  { flag: "🇸🇳", country: "Sénégal", pct: 6 },
  { flag: "🇧🇫", country: "Burkina Faso", pct: 4 },
  { flag: "🇺🇸", country: "États-Unis", pct: 3 },
  { flag: "🌍", country: "Autres", pct: 8 },
];

const SOURCES = [
  { icon: "🔍", label: "Google Search", pct: 38, color: "#22c55e" },
  { icon: "🔗", label: "Direct", pct: 24, color: "#3b82f6" },
  { icon: "💼", label: "LinkedIn", pct: 18, color: "#0077b5" },
  { icon: "🐦", label: "Twitter/X", pct: 11, color: "#1da1f2" },
  { icon: "📱", label: "Autres", pct: 9, color: "#a0a0a0" },
];

export function AdminAnalyticsTab() {
  const [period, setPeriod] = useState<Period>("30j");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold">Analytics Plateforme</h2>
        <div className="flex gap-1">
          {(["7j", "30j", "90j", "1an"] as Period[]).map((p) => (
            <Button key={p} size="sm" variant={period === p ? "default" : "outline"} onClick={() => setPeriod(p)}
              style={period === p ? { background: "var(--color-orange)" } : {}}
            >{p}</Button>
          ))}
        </div>
      </div>

      {/* Métriques trafic global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Eye, label: "Pages vues", value: "12 456", sub: "↑ +22%", color: "#8b5cf6" },
          { icon: Users, label: "Visiteurs uniques", value: "5 234", sub: "", color: "#3b82f6" },
          { icon: TrendingUp, label: "Durée moy. session", value: "3m 12s", sub: "", color: "#10b981" },
        ].map((m) => (
          <Card key={m.label} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <m.icon className="h-4 w-4" style={{ color: m.color }} />
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
              {m.sub && <div className="text-xs mt-1 text-green-400">{m.sub}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trafic par portail */}
        <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4" style={{ color: "var(--color-orange)" }} />
              Trafic par Portail
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PORTALS.map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="truncate">{p.name}</span>
                  <span className="text-muted-foreground ml-2 shrink-0">{p.pct}% ({p.count.toLocaleString()})</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${p.pct}%`, background: "var(--color-orange)" }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top portfolios */}
        <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" style={{ color: "var(--color-orange)" }} />
              Top Portfolios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {TOP_PORTFOLIOS.map((p, i) => (
              <div key={p.slug} className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground w-4 text-xs">{i + 1}.</span>
                <a
                  href={`https://${p.slug}.ivoire.io`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-blue-400 hover:underline text-xs font-mono"
                >
                  {p.slug}.ivoire.io
                </a>
                <Badge variant="outline" className="text-xs">{p.visits} visites</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Géographie */}
        <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Map className="h-4 w-4" style={{ color: "var(--color-orange)" }} />
              Provenance Géographique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {GEO.map((g) => (
              <div key={g.country}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{g.flag} {g.country}</span>
                  <span className="text-muted-foreground">{g.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${g.pct}%`, background: "var(--color-green)" }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sources de trafic */}
        <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" style={{ color: "var(--color-orange)" }} />
              Sources de Trafic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SOURCES.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{s.icon} {s.label}</span>
                  <span className="text-muted-foreground">{s.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Objectif inscriptions */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Inscriptions — Progression vers l&apos;objectif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span>1 247 profils</span>
            <span className="text-muted-foreground">Objectif : 2 000</span>
          </div>
          <div className="h-3 rounded-full" style={{ background: "var(--color-border)" }}>
            <div className="h-3 rounded-full transition-all" style={{ width: "62%", background: "var(--color-orange)" }} />
          </div>
          <div className="text-xs text-muted-foreground mt-1 text-right">62%</div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exporter le rapport CSV
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Rapport mensuel PDF
        </Button>
      </div>
    </div>
  );
}
