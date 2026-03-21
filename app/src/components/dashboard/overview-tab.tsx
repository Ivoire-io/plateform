"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Experience, Profile, Project } from "@/lib/types";
import {
  BarChart2,
  Blocks,
  Briefcase,
  Check,
  Clock,
  Copy,
  Eye,
  Link2,
  Loader2,
  MessageSquare,
  PenLine,
  Rocket,
  Share2,
  Star,
  TrendingUp,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface OverviewTabProps {
  profile: Profile;
  projects: Project[];
  experiences: Experience[];
  unreadMessages: number;
  onNavigate: (tab: string) => void;
}

interface StatsData {
  stats: {
    views: { total: number; unique: number; trend: number };
    clicks: { total: number; trend: number };
    messages: { total: number; unread: number; trend: number };
  };
  chart: { label: string; views: number }[];
  recentMessages: {
    id: string;
    name: string;
    message: string;
    created_at: string;
    read: boolean;
  }[];
}

function calcCompletion(profile: Profile, projects: Project[]): {
  score: number;
  items: { label: string; done: boolean; action: string; tab: string }[];
} {
  const isStartup = profile.type === "startup";

  const items = isStartup
    ? [
        { label: "Logo de la startup", done: !!profile.avatar_url, action: "Ajouter un logo", tab: "startup" },
        { label: "Description / pitch", done: !!profile.bio && profile.bio.length > 20, action: "Écrire votre pitch", tab: "startup" },
        { label: "Ville & localisation", done: !!profile.city, action: "Indiquer votre ville", tab: "startup" },
        { label: "Site web", done: !!profile.website_url, action: "Ajouter votre site web", tab: "startup" },
        { label: "Secteur & stade", done: !!profile.title, action: "Choisir secteur et stade", tab: "startup" },
      ]
    : [
        { label: "Photo de profil", done: !!profile.avatar_url, action: "Ajouter une photo", tab: "profile" },
        { label: "Bio", done: !!profile.bio && profile.bio.length > 20, action: "Écrire ta bio", tab: "profile" },
        { label: "Titre & ville", done: !!(profile.title && profile.city), action: "Ajouter titre et ville", tab: "profile" },
        { label: "Compétences (3 min.)", done: profile.skills.length >= 3, action: "Ajouter des compétences", tab: "profile" },
        {
          label: "Liens sociaux (1 min.)",
          done: !!(profile.github_url || profile.linkedin_url || profile.twitter_url || profile.website_url),
          action: "Ajouter un lien social",
          tab: "profile",
        },
        { label: "Projets (1 min.)", done: projects.length >= 1, action: "Ajouter un projet", tab: "projects" },
      ];

  const done = items.filter((i) => i.done).length;
  return { score: Math.round((done / items.length) * 100), items };
}

export function OverviewTab({
  profile,
  projects,
  experiences,
  unreadMessages,
  onNavigate,
}: OverviewTabProps) {
  const firstName = (profile.full_name ?? "").split(" ")[0] || "Développeur";
  const { score, items } = calcCompletion(profile, projects);

  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [projectScore, setProjectScore] = useState<{ global: number; statusLabel: string; statusColor: string; identity: { score: number }; vision: { score: number }; technique: { score: number }; financier: { score: number } } | null>(null);

  const isStartup = profile.type === "startup";

  useEffect(() => {
    fetch("/api/dashboard/stats?period=30j")
      .then((r) => r.json())
      .then((data) => {
        setStatsData(data);
      })
      .catch(() => {
        // silencieux — les cards afficheront 0
      })
      .finally(() => setStatsLoading(false));

    // Fetch project score for startups
    if (isStartup) {
      fetch("/api/project-builder/score")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setProjectScore(data.data);
        })
        .catch(() => { });
    }
  }, [isStartup]);

  async function copyLink() {
    const url = `https://${profile.slug}.ivoire.io`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié !");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  }

  const viewsTotal = statsData?.stats.views.total ?? 0;
  const viewsTrend = statsData?.stats.views.trend ?? 0;
  const clicksTotal = statsData?.stats.clicks.total ?? 0;
  const clicksTrend = statsData?.stats.clicks.trend ?? 0;

  // Sparkline : 5 dernières semaines agrégées depuis le chart journalier
  const chartRaw = statsData?.chart ?? [];
  let sparkBars: number[];
  if (chartRaw.length >= 5) {
    // Grouper les 30 jours en 5 semaines de 6 jours
    sparkBars = [0, 1, 2, 3, 4].map((wi) => {
      const slice = chartRaw.slice(wi * 6, wi * 6 + 6);
      return slice.reduce((acc, d) => acc + d.views, 0);
    });
  } else {
    // Pas encore assez de données
    sparkBars = [0, 0, 0, 0, 0];
  }
  const maxBar = Math.max(...sparkBars, 1);

  const statCards = [
    {
      icon: <Eye className="w-5 h-5" />,
      label: "Visites ce mois",
      value: viewsTotal,
      trend: viewsTrend !== 0 ? `${viewsTrend > 0 ? "+" : ""}${viewsTrend}%` : null,
      color: "var(--color-orange)",
    },
    {
      icon: <Link2 className="w-5 h-5" />,
      label: "Clics liens",
      value: clicksTotal,
      trend: clicksTrend !== 0 ? `${clicksTrend > 0 ? "+" : ""}${clicksTrend}%` : null,
      color: "#3b82f6",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Messages non lus",
      value: unreadMessages,
      trend: null,
      color: "#a855f7",
      badge: unreadMessages > 0,
    },
    {
      icon: <Star className="w-5 h-5" />,
      label: "Visiteurs uniques",
      value: statsData?.stats.views.unique ?? 0,
      trend: null,
      color: "#ec4899",
    },
    ...(!isStartup
      ? [
          {
            icon: <Briefcase className="w-5 h-5" />,
            label: "Projets publiés",
            value: projects.length,
            trend: null,
            color: "#22c55e",
          },
          {
            icon: <Clock className="w-5 h-5" />,
            label: "Expériences listées",
            value: experiences.length,
            trend: null,
            color: "#f59e0b",
          },
        ]
      : []),
  ];

  // Activité récente : derniers messages reçus
  const recentMessages = statsData?.recentMessages ?? [];
  const recentActivity = recentMessages.length > 0
    ? recentMessages.map((m) => ({
      icon: m.read ? "📩" : "📨",
      text: `Message de ${m.name} : « ${m.message.substring(0, 60)}${m.message.length > 60 ? "…" : ""} »`,
      time: new Date(m.created_at).toLocaleString("fr", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }))
    : [{ icon: "👋", text: "Pas encore d'activité récente. Partagez votre portfolio !", time: "" }];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bonjour, {firstName} 👋</h1>
        <p className="text-muted-foreground mt-1">Voici un résumé de ton activité</p>
      </div>

      {/* Stat cards */}
      <div className={`grid grid-cols-2 ${isStartup ? "md:grid-cols-4" : "md:grid-cols-3"} gap-4`}>
        {statCards.map((card) => (
          <Card key={card.label} className="relative overflow-hidden">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span style={{ color: card.color }}>{card.icon}</span>
                {statsLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                ) : card.trend ? (
                  <span className="text-xs font-medium text-green-500 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {card.trend}
                  </span>
                ) : card.badge ? (
                  <Badge
                    className="text-xs px-1.5 py-0"
                    style={{ background: card.color, color: "#fff" }}
                  >
                    {card.value}
                  </Badge>
                ) : null}
              </div>
              <div className="text-3xl font-bold">
                {statsLoading && !["Messages non lus", "Projets publiés", "Expériences listées"].includes(card.label) ? (
                  <span className="text-muted-foreground text-lg">…</span>
                ) : card.value}
              </div>
              <div className="text-xs text-muted-foreground">{card.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Score (startup only) */}
        {isStartup && (
          <Card className="md:col-span-2 overflow-hidden border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex items-center gap-5 flex-1">
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4"
                      style={{
                        borderColor: projectScore?.statusColor || "var(--color-orange)",
                        color: projectScore?.statusColor || "var(--color-orange)",
                      }}
                    >
                      {projectScore?.global ?? "—"}
                      {projectScore && <span className="text-sm">%</span>}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Blocks className="w-4 h-4" style={{ color: "var(--color-orange)" }} />
                      <h3 className="font-semibold">Score Projet</h3>
                      {projectScore && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: projectScore.statusColor + "15", color: projectScore.statusColor }}
                        >
                          {projectScore.statusLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Dossier projet complété à {projectScore?.global ?? 0}%
                    </p>
                    <div className="h-2 rounded-full overflow-hidden mt-2" style={{ background: "var(--color-surface)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${projectScore?.global ?? 0}%`, background: projectScore?.statusColor || "var(--color-orange)" }}
                      />
                    </div>
                  </div>
                </div>
                {/* Category mini scores */}
                <div className="flex gap-3">
                  {[
                    { label: "Identité", score: projectScore?.identity.score ?? 0, icon: "🎨" },
                    { label: "Vision", score: projectScore?.vision.score ?? 0, icon: "🎯" },
                    { label: "Technique", score: projectScore?.technique.score ?? 0, icon: "🔧" },
                    { label: "Financier", score: projectScore?.financier.score ?? 0, icon: "💰" },
                  ].map((cat) => (
                    <div key={cat.label} className="text-center">
                      <span className="text-sm">{cat.icon}</span>
                      <p className="text-xs font-bold mt-0.5" style={{ color: cat.score >= 80 ? "#22c55e" : cat.score >= 50 ? "#eab308" : "#ef4444" }}>
                        {cat.score}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">{cat.label}</p>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={() => onNavigate("project-builder")}
                  style={{ background: "var(--color-orange)", color: "#fff" }}
                >
                  <Blocks className="w-3.5 h-3.5 mr-1.5" />
                  {(projectScore?.global ?? 0) < 50 ? "Lancer le Project Builder" : "Continuer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile / Startup completion */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {isStartup ? "Checklist de la startup" : "Checklist du profil"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{score}%</span>
              <span className="text-muted-foreground">
                {items.filter((i) => i.done).length}/{items.length} éléments
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "var(--color-surface)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${score}%`, background: "var(--color-orange)" }}
              />
            </div>
            <ul className="flex flex-col gap-1.5 mt-1">
              {items.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm">
                  <span
                    className={`flex items-center justify-center w-4 h-4 rounded-full shrink-0 ${item.done
                      ? "bg-green-500/20 text-green-500"
                      : "bg-red-500/20 text-red-500"
                      }`}
                  >
                    {item.done ? <Check className="w-2.5 h-2.5" /> : <span className="text-[9px] font-bold">!</span>}
                  </span>
                  {item.done ? (
                    <span className="text-muted-foreground line-through">{item.label}</span>
                  ) : (
                    <span
                      className="cursor-pointer hover:underline text-red-400"
                      onClick={() => onNavigate(item.tab)}
                    >
                      {item.action}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-1">
              {isStartup
                ? "💡 Les startups avec une fiche complète attirent plus d'investisseurs et de devs"
                : "💡 Conseil : Les profils complets reçoivent 3x plus de visites"}
            </p>
            {score < 100 && (
              <Button
                size="sm"
                className="w-full mt-1"
                style={{ background: "var(--color-orange)", color: "#fff" }}
                onClick={() => onNavigate(isStartup ? "startup" : "profile")}
              >
                {isStartup ? "Compléter ma startup →" : "Éditer mon profil →"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Sparkline chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart2 className="w-4 h-4" style={{ color: "var(--color-orange)" }} />
              Visites (30 derniers jours)
              {statsLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-24">
              {sparkBars.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${(val / maxBar) * 80}px`,
                      background:
                        i === sparkBars.length - 1
                          ? "var(--color-orange)"
                          : "color-mix(in srgb, var(--color-orange) 35%, transparent)",
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {["S1", "S2", "S3", "S4", "S5"][i]}
                  </span>
                </div>
              ))}
            </div>
            {!statsLoading && sparkBars.every((v) => v === 0) && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Les visites s&apos;afficheront dès que votre portfolio reçoit du trafic.
              </p>
            )}
            <button
              onClick={() => onNavigate("stats")}
              className="mt-3 text-xs w-full text-center hover:underline"
              style={{ color: "var(--color-orange)" }}
            >
              Voir les statistiques complètes →
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Chargement…
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {recentActivity.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-base shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p>{item.text}</p>
                    {item.time && (
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {isStartup ? (
              <>
                <button
                  onClick={() => onNavigate("project-builder")}
                  className="flex flex-col items-center gap-2 rounded-lg p-3 border border-border hover:border-orange-400 transition-colors text-sm"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <Blocks className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
                  <span>Project Builder</span>
                </button>
                <button
                  onClick={() => onNavigate("team")}
                  className="flex flex-col items-center gap-2 rounded-lg p-3 border border-border hover:border-orange-400 transition-colors text-sm"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <Users className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
                  <span>Mon équipe</span>
                </button>
                <button
                  onClick={() => onNavigate("products")}
                  className="flex flex-col items-center gap-2 rounded-lg p-3 border border-border hover:border-orange-400 transition-colors text-sm"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <Rocket className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
                  <span>Mes produits</span>
                </button>
                <button
                  onClick={() => onNavigate("fundraising")}
                  className="flex flex-col items-center gap-2 rounded-lg p-3 border border-border hover:border-orange-400 transition-colors text-sm"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <TrendingUp className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
                  <span>Levée de fonds</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate("profile")}
                  className="flex flex-col items-center gap-2 rounded-lg p-3 border border-border hover:border-orange-400 transition-colors text-sm"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <PenLine className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
                  <span>Éditer mon profil</span>
                </button>
                <button
                  onClick={() => onNavigate("projects")}
                  className="flex flex-col items-center gap-2 rounded-lg p-3 border border-border hover:border-orange-400 transition-colors text-sm"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <Briefcase className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
                  <span>Ajouter projet</span>
                </button>
                <a
                  href={`https://${profile.slug}.ivoire.io`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 rounded-lg p-3 border border-border hover:border-orange-400 transition-colors text-sm"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <Share2 className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
                  <span>Voir portfolio</span>
                </a>
                <button
                  onClick={copyLink}
                  className="flex flex-col items-center gap-2 rounded-lg p-3 border border-border hover:border-orange-400 transition-colors text-sm"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <Copy className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
                  <span>Copier lien</span>
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
