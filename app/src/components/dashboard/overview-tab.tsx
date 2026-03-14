"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Experience, Profile, Project } from "@/lib/types";
import {
  BarChart2,
  Briefcase,
  Check,
  Clock,
  Copy,
  Eye,
  Link2,
  MessageSquare,
  PenLine,
  Share2,
  Star,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface OverviewTabProps {
  profile: Profile;
  projects: Project[];
  experiences: Experience[];
  unreadMessages: number;
  onNavigate: (tab: string) => void;
}

function calcCompletion(profile: Profile, projects: Project[]): {
  score: number;
  items: { label: string; done: boolean; action: string }[];
} {
  const items = [
    { label: "Photo de profil", done: !!profile.avatar_url, action: "Ajouter une photo" },
    { label: "Bio", done: !!profile.bio && profile.bio.length > 20, action: "Écrire ta bio" },
    { label: "Titre & ville", done: !!(profile.title && profile.city), action: "Ajouter titre et ville" },
    { label: "Compétences (3 min.)", done: profile.skills.length >= 3, action: "Ajouter des compétences" },
    {
      label: "Liens sociaux (1 min.)",
      done: !!(profile.github_url || profile.linkedin_url || profile.twitter_url || profile.website_url),
      action: "Ajouter un lien social",
    },
    { label: "Projets (1 min.)", done: projects.length >= 1, action: "Ajouter un projet" },
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

  async function copyLink() {
    const url = `https://${profile.slug}.ivoire.io`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié !");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  }

  // Mock weekly sparkline (5 bars)
  const sparkBars = [28, 42, 35, 55, 48];
  const maxBar = Math.max(...sparkBars);

  const statCards = [
    {
      icon: <Eye className="w-5 h-5" />,
      label: "Visites ce mois",
      value: 342,
      trend: "+18%",
      color: "var(--color-orange)",
    },
    {
      icon: <Link2 className="w-5 h-5" />,
      label: "Clics liens",
      value: 28,
      trend: "+9%",
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
    {
      icon: <Star className="w-5 h-5" />,
      label: "Favoris reçus",
      value: 12,
      trend: "+3",
      color: "#ec4899",
    },
  ];

  const recentActivity = [
    { icon: "📨", text: "Nouveau message de Marie K.", time: "Il y a 2h" },
    { icon: "👁️", text: "12 nouvelles visites aujourd'hui", time: "Il y a 4h" },
    { icon: "⭐", text: "2 personnes ont mis ton profil en favori", time: "Hier" },
    { icon: "🔗", text: "5 clics sur tes liens ce matin", time: "Hier" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bonjour, {firstName} 👋</h1>
        <p className="text-muted-foreground mt-1">Voici un résumé de ton activité</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="relative overflow-hidden">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span style={{ color: card.color }}>{card.icon}</span>
                {card.trend && (
                  <span className="text-xs font-medium text-green-500 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {card.trend}
                  </span>
                )}
                {card.badge && (
                  <Badge
                    className="text-xs px-1.5 py-0"
                    style={{ background: card.color, color: "#fff" }}
                  >
                    {card.value}
                  </Badge>
                )}
              </div>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-xs text-muted-foreground">{card.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile completion */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Complétion du profil</CardTitle>
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
                      onClick={() => onNavigate("profile")}
                    >
                      {item.action}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-1">
              💡 Conseil : Les profils complets reçoivent 3x plus de visites
            </p>
            {score < 100 && (
              <Button
                size="sm"
                className="w-full mt-1"
                style={{ background: "var(--color-orange)", color: "#fff" }}
                onClick={() => onNavigate("profile")}
              >
                Compléter mon profil →
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
          <ul className="flex flex-col gap-3">
            {recentActivity.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-base shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p>{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigate("profile")}
              className="flex flex-col items-center gap-2 rounded-lg p-3 border border-border hover:border-orange-400 transition-colors text-sm"
              style={{ borderColor: "var(--color-border)" }}
            >
              <PenLine className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
              <span>Modifier profil</span>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
