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
import { useEffect, useState } from "react";
import type { AdminTab } from "../admin-shell";

interface AdminOverviewTabProps {
  onNavigate: (tab: AdminTab) => void;
}

interface StatsData {
  totalProfiles: number;
  startups: number;
  enterprises: number;
  waitlistPending: number;
  messages: number;
  reports: number;
  suspended: number;
  newThisMonth: number;
  mrr: number;
}

interface LogEntry {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  created_at: string;
  admin?: { full_name: string } | null;
}

function formatLogEntry(log: LogEntry): { dot: string; text: string; time: string } {
  const action = log.action ?? "";
  const time = new Date(log.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });

  const map: Record<string, { dot: string; prefix: string }> = {
    profile_created: { dot: "🟢", prefix: "Profil créé" },
    profile_suspended: { dot: "🔴", prefix: "Profil suspendu" },
    profile_activated: { dot: "🟢", prefix: "Profil réactivé" },
    profile_banned: { dot: "🔴", prefix: "Compte banni" },
    badge_granted: { dot: "🏅", prefix: "Badge accordé" },
    admin_promoted: { dot: "🛡️", prefix: "Admin promu" },
    waitlist_invited: { dot: "🟡", prefix: "Invitation waitlist" },
    report_resolved: { dot: "✅", prefix: "Signalement résolu" },
    plan_changed: { dot: "💳", prefix: "Plan modifié" },
  };

  const entry = map[action] ?? { dot: "⚪", prefix: action };
  const target = log.target_id ? ` — ${log.target_id.slice(0, 8)}` : "";
  return { dot: entry.dot, text: `${entry.prefix}${target}`, time };
}

export function AdminOverviewTab({ onNavigate }: AdminOverviewTabProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/logs?period=7d&limit=7").then((r) => r.json()),
    ])
      .then(([s, l]) => {
        setStats(s);
        setLogs(l.logs ?? []);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const totalProfiles = stats?.totalProfiles ?? 0;
  const startups = stats?.startups ?? 0;
  const enterprises = stats?.enterprises ?? 0;
  const developers = Math.max(0, totalProfiles - startups - enterprises);

  const profileDist = totalProfiles > 0
    ? [
      { label: "🧑‍💻 Développeurs", count: developers, pct: Math.round((developers / totalProfiles) * 100), color: "#3b82f6" },
      { label: "🚀 Startups", count: startups, pct: Math.round((startups / totalProfiles) * 100), color: "#8b5cf6" },
      { label: "🏢 Entreprises", count: enterprises, pct: Math.round((enterprises / totalProfiles) * 100), color: "#10b981" },
      { label: "👤 Autres", count: Math.max(0, totalProfiles - developers - startups - enterprises), pct: Math.max(0, 100 - Math.round((developers / totalProfiles) * 100) - Math.round((startups / totalProfiles) * 100) - Math.round((enterprises / totalProfiles) * 100)), color: "#a0a0a0" },
    ]
    : [];

  const metrics = [
    { label: "Profils total", value: loading ? "…" : totalProfiles.toLocaleString("fr-FR"), sub: stats ? `+${stats.newThisMonth} ce mois` : "", icon: Users, tab: "users" as AdminTab, color: "#3b82f6" },
    { label: "Startups listées", value: loading ? "…" : startups.toString(), sub: "", icon: TrendingUp, tab: "startups" as AdminTab, color: "#8b5cf6" },
    { label: "Entreprises", value: loading ? "…" : enterprises.toString(), sub: "", icon: Briefcase, tab: "startups" as AdminTab, color: "#06b6d4" },
    { label: "Waitlist en attente", value: loading ? "…" : (stats?.waitlistPending ?? 0).toString(), sub: "", icon: Clock, tab: "waitlist" as AdminTab, color: "#f59e0b" },
    { label: "Messages non lus", value: loading ? "…" : (stats?.messages ?? 0).toString(), sub: "", icon: MessageSquare, tab: "messages" as AdminTab, color: "#6366f1" },
    { label: "Signalements", value: loading ? "…" : (stats?.reports ?? 0).toString(), sub: "en attente", icon: AlertTriangle, tab: "moderation" as AdminTab, color: "#ef4444" },
    { label: "Comptes suspendus", value: loading ? "…" : (stats?.suspended ?? 0).toString(), sub: "", icon: ShieldAlert, tab: "users" as AdminTab, color: "#f97316" },
    { label: "MRR", value: stats?.mrr ? `$${stats.mrr.toLocaleString("fr-FR")}` : "$0", sub: "Stripe non actif", icon: CreditCard, tab: "subscriptions" as AdminTab, color: "var(--color-orange)" },
  ];

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
        {metrics.map((m) => (
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
            {loading ? (
              <div className="text-xs text-muted-foreground py-4 text-center">Chargement…</div>
            ) : profileDist.length === 0 ? (
              <div className="text-xs text-muted-foreground py-4 text-center">Aucun profil</div>
            ) : (
              profileDist.map((p) => (
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
              ))
            )}
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
            {loading ? (
              <div className="text-xs text-muted-foreground py-4 text-center">Chargement…</div>
            ) : logs.length === 0 ? (
              <div className="text-xs text-muted-foreground py-4 text-center">Aucune activité récente</div>
            ) : (
              logs.map((log) => {
                const { dot, text, time } = formatLogEntry(log);
                return (
                  <div key={log.id} className="flex items-center gap-2 text-xs">
                    <span className="text-base leading-none">{dot}</span>
                    <span className="flex-1 truncate">{text}</span>
                    <span className="text-muted-foreground shrink-0">{time}</span>
                  </div>
                );
              })
            )}
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
      {stats && (stats.reports > 0 || stats.waitlistPending > 0 || stats.messages > 0) && (
        <Card
          style={{
            background: "color-mix(in srgb, #ef4444 8%, var(--color-surface))",
            border: "1px solid color-mix(in srgb, #ef4444 25%, transparent)",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-400" />
              Actions en Attente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.reports > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-400">🚨 {stats.reports} signalement{stats.reports > 1 ? "s" : ""} en attente</span>
                <Button size="sm" variant="ghost" className="h-6 text-xs text-red-400 hover:text-red-300" onClick={() => onNavigate("moderation")}>Traiter →</Button>
              </div>
            )}
            {stats.waitlistPending > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-400">⏳ {stats.waitlistPending} inscrit{stats.waitlistPending > 1 ? "s" : ""} waitlist à convertir</span>
                <Button size="sm" variant="ghost" className="h-6 text-xs text-blue-400 hover:text-blue-300" onClick={() => onNavigate("waitlist")}>Inviter →</Button>
              </div>
            )}
            {stats.messages > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">📨 {stats.messages} message{stats.messages > 1 ? "s" : ""} contact non répondus</span>
                <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => onNavigate("messages")}>Voir →</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activité — nouveaux profils ce mois */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span>Nouvelles inscriptions ce mois</span>
            {stats && (
              <Badge variant="outline" className="text-xs h-5">
                +{stats.newThisMonth} ce mois
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-20 flex items-center justify-center text-xs text-muted-foreground">Chargement…</div>
          ) : (
            <>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold" style={{ color: "var(--color-orange)" }}>
                    {stats?.newThisMonth ?? 0}
                  </span>
                  <span className="text-xs text-muted-foreground">nouveaux profils</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-blue-400">{totalProfiles}</span>
                  <span className="text-xs text-muted-foreground">total</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-purple-400">{startups}</span>
                  <span className="text-xs text-muted-foreground">startups</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-emerald-400">{enterprises}</span>
                  <span className="text-xs text-muted-foreground">entreprises</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Les graphiques d&apos;évolution quotidienne seront disponibles une fois l&apos;analytics activé.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
