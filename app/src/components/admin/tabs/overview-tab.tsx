"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Briefcase,
  Clock,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  TrendingUp,
  Users,
} from "lucide-react";
import type { AdminTab } from "../admin-shell";

interface AdminOverviewTabProps {
  onNavigate: (tab: AdminTab) => void;
}

const METRICS = [
  { label: "Profils total", value: "1 247", sub: "+87 ce mois", icon: Users, tab: "users" as AdminTab, color: "#3b82f6" },
  { label: "Startups listées", value: "34", sub: "+3 ce mois", icon: TrendingUp, tab: "startups" as AdminTab, color: "#8b5cf6" },
  { label: "Entreprises certifiées", value: "12", sub: "+1 ce mois", icon: Briefcase, tab: "startups" as AdminTab, color: "#06b6d4" },
  { label: "Offres actives", value: "6", sub: "", icon: Briefcase, tab: "jobs" as AdminTab, color: "#10b981" },
  { label: "Waitlist en attente", value: "89", sub: "", icon: Clock, tab: "waitlist" as AdminTab, color: "#f59e0b" },
  { label: "Messages non lus", value: "23", sub: "", icon: MessageSquare, tab: "messages" as AdminTab, color: "#6366f1" },
  { label: "Signalements", value: "2", sub: "en attente", icon: AlertTriangle, tab: "moderation" as AdminTab, color: "#ef4444" },
  { label: "MRR", value: "$2.4K", sub: "↑ +18%", icon: CreditCard, tab: "subscriptions" as AdminTab, color: "var(--color-orange)" },
];

const ACTIVITY = [
  { dot: "🟢", text: "ulrich.ivoire.io — Profil créé", time: "2h", type: "profile" },
  { dot: "🟢", text: "fatou.ivoire.io — Profil créé", time: "5h", type: "profile" },
  { dot: "🔵", text: "TechCI — Startup ajoutée", time: "hier", type: "content" },
  { dot: "🟡", text: "jean@test.ci — Inscrit waitlist", time: "hier", type: "waitlist" },
  { dot: "🔴", text: "spammer@mail.com — Compte signalé", time: "hier", type: "moderation" },
  { dot: "💳", text: "Acme Corp — Abonnement Enterprise", time: "2j", type: "payment" },
  { dot: "🏅", text: "InfoTech CI — Badge certifié", time: "3j", type: "admin" },
];

const PROFILE_DIST = [
  { label: "🧑‍💻 Développeurs", pct: 78, count: 973, color: "#3b82f6" },
  { label: "🚀 Startups", pct: 12, count: 150, color: "#8b5cf6" },
  { label: "🏢 Entreprises", pct: 5, count: 62, color: "#10b981" },
  { label: "👤 Autres", pct: 5, count: 62, color: "#a0a0a0" },
];

export function AdminOverviewTab({ onNavigate }: AdminOverviewTabProps) {
  const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Dernière mise à jour : {today}</p>
        </div>
      </div>

      {/* Métriques clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {METRICS.map((m) => (
          <Card
            key={m.label}
            className="cursor-pointer hover:border-orange-500/40 transition-colors"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            onClick={() => onNavigate(m.tab)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <m.icon className="h-4 w-4" style={{ color: m.color }} />
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
              {m.sub && <div className="text-xs mt-1" style={{ color: m.color }}>{m.sub}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des profils */}
        <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" style={{ color: "var(--color-orange)" }} />
              Répartition des Profils
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {PROFILE_DIST.map((p) => (
              <div key={p.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{p.label}</span>
                  <span className="text-muted-foreground">{p.pct}% ({p.count})</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "var(--color-border)" }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${p.pct}%`, background: p.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" style={{ color: "var(--color-orange)" }} />
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-base leading-none">{a.dot}</span>
                <span className="flex-1 truncate">{a.text}</span>
                <span className="text-muted-foreground shrink-0">{a.time}</span>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 h-7 text-xs"
              onClick={() => onNavigate("logs")}
            >
              Voir tous les logs →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Actions urgentes */}
      <Card
        style={{
          background: "color-mix(in srgb, #ef4444 8%, var(--color-surface))",
          border: "1px solid color-mix(in srgb, #ef4444 25%, transparent)",
        }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            Actions Urgentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-red-400">🚨 2 signalements en attente de revue</span>
            <Button size="sm" variant="ghost" className="h-6 text-xs text-red-400 hover:text-red-300" onClick={() => onNavigate("moderation")}>Traiter →</Button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-yellow-400">✅ 4 entreprises en attente de certification</span>
            <Button size="sm" variant="ghost" className="h-6 text-xs text-yellow-400 hover:text-yellow-300" onClick={() => onNavigate("moderation")}>Certifier →</Button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-400">⏳ 89 inscrits waitlist à convertir</span>
            <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-400 hover:text-blue-300" onClick={() => onNavigate("waitlist")}>Inviter →</Button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">📨 23 messages contact non répondus</span>
            <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => onNavigate("messages")}>Voir →</Button>
          </div>
        </CardContent>
      </Card>

      {/* Inscriptions sparkline (simulée) */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Inscriptions — 30 derniers jours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-20">
            {[12, 8, 15, 20, 18, 25, 22, 30, 28, 35, 24, 18, 22, 29, 33, 27, 20, 24, 28, 32, 25, 18, 15, 22, 28, 30, 27, 24, 20, 25].map(
              (v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all hover:opacity-80"
                  style={{
                    height: `${(v / 35) * 100}%`,
                    background: i > 25 ? "var(--color-orange)" : "color-mix(in srgb,var(--color-orange) 40%,transparent)",
                  }}
                />
              )
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>14/02</span>
            <span>28/02</span>
            <span>14/03</span>
          </div>
          <div className="flex gap-4 mt-3 text-xs">
            <span>
              <span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: "var(--color-orange)" }} />
              Total
            </span>
            <Badge variant="outline" className="text-xs h-5">+87 ce mois</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
