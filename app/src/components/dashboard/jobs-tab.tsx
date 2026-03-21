"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Profile } from "@/lib/types";
import { Briefcase, CheckCircle, Clock, Loader2, MapPin, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Job {
  id: string;
  company: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  tags: string[];
  match: number;
  applications: number;
  expiresAt: string;
}

interface Application {
  id: string;
  company: string;
  title: string;
  appliedAt: string;
  type: string;
  location: string;
  match: number;
  status: AppStatus;
  statusLabel: string;
  interview?: string;
  reason?: string;
  offer?: string;
}

type AppStatus = "interview" | "review" | "rejected" | "offer" | "sent";

const STATUS_CONFIG: Record<AppStatus, { color: string; icon: string }> = {
  interview: { color: "#3b82f6", icon: "📅" },
  review: { color: "#f59e0b", icon: "📖" },
  rejected: { color: "#ef4444", icon: "❌" },
  offer: { color: "#22c55e", icon: "🎉" },
  sent: { color: "#6b7280", icon: "📩" },
};

function MatchBadge({ pct }: { pct: number }) {
  const color = pct >= 90 ? "#22c55e" : pct >= 80 ? "#f59e0b" : "#6b7280";
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${color}22`, color }}
    >
      ⭐ {pct}% match
    </span>
  );
}

interface JobsTabProps {
  profile: Profile;
}

export function JobsTab({ profile }: JobsTabProps) {
  const skills = profile.skills.slice(0, 4);
  const isStartup = profile.type === "startup";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      if (isStartup) {
        // Startup: fetch own posted jobs
        const res = await fetch("/api/dashboard/jobs");
        if (!res.ok) throw new Error("Erreur chargement");
        const data = await res.json();
        setJobs(data.jobs ?? []);
      } else {
        // Developer: fetch public job listings + own applications
        const [jobsRes, appsRes] = await Promise.all([
          fetch("/api/jobs?page=1&limit=20"),
          fetch("/api/dashboard/jobs"),
        ]);
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData.jobs ?? []);
        }
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApplications(appsData.applications ?? []);
        }
      }
    } catch {
      toast.error("Impossible de charger les offres.");
    } finally {
      setLoading(false);
    }
  }, [isStartup]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Offres recommandées ── */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">💼 Offres recommandées</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Basé sur :{" "}
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-block text-xs font-medium rounded px-1.5 py-0.5 mr-1"
                  style={{
                    background: "color-mix(in srgb, var(--color-orange) 15%, transparent)",
                    color: "var(--color-orange)",
                  }}
                >
                  {s}
                </span>
              ))}
              {profile.city && (
                <span className="text-xs text-muted-foreground">· {profile.city}</span>
              )}
            </p>
          </div>
          <Badge
            className="text-xs"
            style={{ background: "var(--color-orange)", color: "#fff" }}
          >
            {jobs.length} nouvelles
          </Badge>
        </div>

        <div className="flex flex-col gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">{job.company}</span>
                      <MatchBadge pct={job.match} />
                    </div>
                    <p className="font-medium">{job.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {job.type}
                      </span>
                      <span>💰 {job.salary}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full border"
                          style={{ borderColor: "var(--color-border)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      📅 Expire le {job.expiresAt} · 📨 {job.applications} candidatures
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Button
                    size="sm"
                    style={{ background: "var(--color-orange)", color: "#fff" }}
                    onClick={() => toast.info("Fonctionnalite bientot disponible.")}
                  >
                    📩 Postuler
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info("Fonctionnalite bientot disponible.")}>
                    🔗 Voir détails
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.info("Fonctionnalite bientot disponible.")}>
                    🔖 Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Pertinence ↓
            </Button>
            <Button size="sm" variant="outline">
              Récent ↓
            </Button>
            <Button size="sm" variant="outline">
              Salaire ↓
            </Button>
          </div>
          <a
            href="https://jobs.ivoire.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm flex items-center gap-1.5"
            style={{ color: "var(--color-orange)" }}
          >
            🔍 Voir toutes les offres →
          </a>
        </div>
      </div>

      {/* ── Mes candidatures ── */}
      <div>
        <h2 className="text-xl font-bold mb-3">
          📩 Mes candidatures ({applications.length})
        </h2>

        <div className="flex flex-col gap-3">
          {applications.map((app) => {
            const cfg = STATUS_CONFIG[app.status];
            return (
              <Card key={app.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-medium text-sm">{app.company}</span>
                        <span className="text-muted-foreground text-sm">—</span>
                        <span className="text-sm">{app.title}</span>
                        <MatchBadge pct={app.match} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Postulé le {app.appliedAt} · {app.type} · {app.location}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-base">{cfg.icon}</span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: cfg.color }}
                        >
                          {app.statusLabel}
                        </span>
                      </div>
                      {app.status === "interview" && app.interview && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📅 {app.interview} · Visio ivoire.io
                        </p>
                      )}
                      {app.status === "rejected" && app.reason && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          &ldquo;{app.reason}&rdquo;
                        </p>
                      )}
                      {app.status === "offer" && app.offer && (
                        <p className="text-xs text-muted-foreground mt-1">
                          💰 {app.offer}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Action buttons */}
                  {app.status === "interview" && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Button
                        size="sm"
                        style={{ background: "#3b82f6", color: "#fff" }}
                      >
                        🎬 Rejoindre la visio
                      </Button>
                      <Button size="sm" variant="outline">
                        💬 Message
                      </Button>
                    </div>
                  )}
                  {app.status === "offer" && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Button
                        size="sm"
                        style={{ background: "#22c55e", color: "#fff" }}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Accepter
                      </Button>
                      <Button size="sm" variant="outline">
                        💬 Négocier
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600">
                        <X className="w-3.5 h-3.5 mr-1" />
                        Décliner
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Status legend */}
        <div
          className="mt-4 rounded-lg p-3 text-xs text-muted-foreground flex flex-wrap gap-3"
          style={{ background: "var(--color-surface)" }}
        >
          <span className="font-medium text-foreground mr-1">Statuts :</span>
          <span>📩 Envoyée</span>
          <span>→</span>
          <span>📖 En revue</span>
          <span>→</span>
          <span>📅 Entretien</span>
          <span>→</span>
          <span>🎉 Proposition</span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="text-muted-foreground">↳</span>
            ❌ Refusée
          </span>
        </div>
      </div>

      {/* ── Entretiens à venir ── */}
      <div>
        <h2 className="text-xl font-bold mb-3">📅 Mes entretiens</h2>
        <p className="text-xs text-muted-foreground mb-3 uppercase font-medium tracking-wide">
          À venir
        </p>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Jeu 20 mars · 14:00 – 14:45</p>
                <p className="text-sm text-muted-foreground">
                  Acme Corp — Dév Full-Stack React
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  🎬 Visio ivoire.io · ⏰ Rappel : dans 3 jours
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Button
                size="sm"
                style={{ background: "#3b82f6", color: "#fff" }}
              >
                🎬 Rejoindre
              </Button>
              <Button size="sm" variant="outline">
                📅 Ajouter au calendrier
              </Button>
              <Button size="sm" variant="ghost">
                💬 Message
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-5 mb-3 uppercase font-medium tracking-wide">
          Passés
        </p>
        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Mar 11 mars · 10:00 – 10:45</p>
              <p className="text-sm text-muted-foreground">WebAgency — Dev React Senior</p>
              <p className="text-xs text-green-500 mt-0.5">✅ Réalisé → Proposition reçue !</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
