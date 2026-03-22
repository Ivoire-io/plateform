"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Profile } from "@/lib/types";
import {
  Briefcase,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Send,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string | null;
  type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  description: string | null;
  tech_tags: string[];
  remote_ok: boolean;
  status: string;
  expires_at: string | null;
  created_at: string;
}

interface ApplicationJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  tech_tags: string[];
  status: string;
  expires_at: string | null;
}

interface Application {
  id: string;
  job_id: string;
  profile_id: string;
  cover_letter: string | null;
  cv_url: string | null;
  status: string;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  job: ApplicationJob | null;
}

interface ReceivedApplication {
  id: string;
  job_id: string;
  profile_id: string;
  cover_letter: string | null;
  cv_url: string | null;
  status: string;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  applicant: {
    id: string;
    full_name: string;
    slug: string;
    avatar_url: string | null;
    title: string | null;
    skills: string[];
    city: string | null;
    is_available: boolean;
  } | null;
}

type AppStatus =
  | "pending"
  | "reviewed"
  | "interview"
  | "accepted"
  | "rejected"
  | "withdrawn";

const STATUS_CONFIG: Record<AppStatus, { color: string; label: string }> = {
  pending: { color: "#6b7280", label: "Envoyee" },
  reviewed: { color: "#f59e0b", label: "En revue" },
  interview: { color: "#3b82f6", label: "Entretien" },
  accepted: { color: "#22c55e", label: "Acceptee" },
  rejected: { color: "#ef4444", label: "Refusee" },
  withdrawn: { color: "#9ca3af", label: "Retiree" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as AppStatus] ?? STATUS_CONFIG.pending;
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: `${cfg.color}22`, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function formatSalary(min: number | null, max: number | null, currency: string) {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR").format(n) + " " + currency;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `A partir de ${fmt(min)}`;
  if (max) return `Jusqu'a ${fmt(max)}`;
  return null;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Apply Modal
// ---------------------------------------------------------------------------

function ApplyModal({
  job,
  onClose,
  onSuccess,
}: {
  job: JobListing;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [coverLetter, setCoverLetter] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/dashboard/jobs/${job.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cover_letter: coverLetter || undefined,
          cv_url: cvUrl || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la candidature.");
        return;
      }

      toast.success("Candidature envoyee avec succes !");
      onSuccess();
      onClose();
    } catch {
      toast.error("Erreur reseau. Reessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-background border border-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-bold">Postuler</h3>
            <p className="text-sm text-muted-foreground">
              {job.title} -- {job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Lettre de motivation (optionnel)
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Expliquez pourquoi vous etes le bon candidat..."
              rows={6}
              maxLength={5000}
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-orange transition-colors placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {coverLetter.length}/5000
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Lien CV (optionnel)
            </label>
            <input
              type="url"
              value={cvUrl}
              onChange={(e) => setCvUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              style={{ background: "var(--color-orange)", color: "#fff" }}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {submitting ? "Envoi..." : "Envoyer ma candidature"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review Application Modal (for job posters)
// ---------------------------------------------------------------------------

function ReviewApplicationModal({
  application,
  onClose,
  onUpdate,
}: {
  application: ReceivedApplication;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [newStatus, setNewStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.reviewer_notes || "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/dashboard/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          reviewer_notes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de la mise a jour.");
        return;
      }

      toast.success("Candidature mise a jour.");
      onUpdate();
      onClose();
    } catch {
      toast.error("Erreur reseau.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-background border border-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-bold">Evaluer la candidature</h3>
            <p className="text-sm text-muted-foreground">
              {application.applicant?.full_name ?? "Candidat"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Applicant details */}
        <div className="p-6 border-b border-border">
          {application.applicant && (
            <div className="flex items-center gap-3 mb-3">
              {application.applicant.avatar_url ? (
                <img
                  src={application.applicant.avatar_url}
                  alt={application.applicant.full_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {application.applicant.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-sm">
                  {application.applicant.full_name}
                </p>
                {application.applicant.title && (
                  <p className="text-xs text-muted-foreground">
                    {application.applicant.title}
                  </p>
                )}
              </div>
            </div>
          )}
          {application.cover_letter && (
            <div className="bg-surface rounded-lg p-3 mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Lettre de motivation
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {application.cover_letter}
              </p>
            </div>
          )}
          {application.cv_url && (
            <a
              href={application.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm mt-2"
              style={{ color: "var(--color-orange)" }}
            >
              <FileText size={14} /> Voir le CV
            </a>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Statut</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
            >
              <option value="reviewed">En revue</option>
              <option value="interview">Entretien</option>
              <option value="accepted">Acceptee</option>
              <option value="rejected">Refusee</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Notes internes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes sur ce candidat..."
              rows={3}
              maxLength={2000}
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-orange transition-colors placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              style={{ background: "var(--color-orange)", color: "#fff" }}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {submitting ? "Mise a jour..." : "Mettre a jour"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface JobsTabProps {
  profile: Profile;
}

export function JobsTab({ profile }: JobsTabProps) {
  const skills = profile.skills.slice(0, 4);
  const isStartup = profile.type === "startup";

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [receivedApps, setReceivedApps] = useState<
    Record<string, ReceivedApplication[]>
  >({});
  const [loading, setLoading] = useState(true);

  // Modal state
  const [applyingJob, setApplyingJob] = useState<JobListing | null>(null);
  const [reviewingApp, setReviewingApp] = useState<ReceivedApplication | null>(
    null
  );

  // Set of job_ids the user already applied to
  const appliedJobIds = new Set(applications.map((a) => a.job_id));

  const fetchData = useCallback(async () => {
    try {
      if (isStartup) {
        // Startup: fetch own posted jobs + received applications
        const res = await fetch("/api/dashboard/jobs");
        if (!res.ok) throw new Error("Erreur chargement");
        const data = await res.json();
        const ownJobs: JobListing[] = data.data ?? [];
        setJobs(ownJobs);

        // Fetch applications for each job
        const appsMap: Record<string, ReceivedApplication[]> = {};
        await Promise.all(
          ownJobs.map(async (job) => {
            try {
              const appsRes = await fetch(
                `/api/dashboard/jobs/${job.id}/applications`
              );
              if (appsRes.ok) {
                const appsData = await appsRes.json();
                appsMap[job.id] = appsData.applications ?? [];
              }
            } catch {
              // silently skip
            }
          })
        );
        setReceivedApps(appsMap);
      } else {
        // Developer: fetch public job listings + own applications
        const [jobsRes, appsRes] = await Promise.all([
          fetch("/api/jobs?page=1&limit=20"),
          fetch("/api/dashboard/applications"),
        ]);

        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          setJobs(jobsData.jobs ?? jobsData.data ?? []);
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

  // Withdraw an application
  async function handleWithdraw(applicationId: string) {
    try {
      const res = await fetch(`/api/dashboard/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "withdrawn" }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur.");
        return;
      }

      toast.success("Candidature retiree.");
      fetchData();
    } catch {
      toast.error("Erreur reseau.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Startup view: own jobs + received applications ──
  if (isStartup) {
    const totalApps = Object.values(receivedApps).reduce(
      (sum, arr) => sum + arr.length,
      0
    );

    return (
      <div className="flex flex-col gap-8">
        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h1 className="text-2xl font-bold">Mes offres d&apos;emploi</h1>
            <Badge
              className="text-xs"
              style={{ background: "var(--color-orange)", color: "#fff" }}
            >
              {jobs.length} offre(s)
            </Badge>
          </div>

          {jobs.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Vous n&apos;avez pas encore publie d&apos;offre.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {jobs.map((job) => {
                const jobApps = receivedApps[job.id] ?? [];
                return (
                  <Card key={job.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                            <span className="font-semibold">{job.company}</span>
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.location}
                              </span>
                            )}
                            {job.type && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3" />
                                {job.type}
                              </span>
                            )}
                          </div>
                          {job.tech_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {job.tech_tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-0.5 rounded-full border"
                                  style={{ borderColor: "var(--color-border)" }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <StatusBadge status={job.status} />
                      </div>

                      {/* Received applications */}
                      {jobApps.length > 0 && (
                        <div className="mt-4 border-t border-border pt-3">
                          <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                            <User size={14} />
                            {jobApps.length} candidature(s) recue(s)
                          </p>
                          <div className="flex flex-col gap-2">
                            {jobApps.map((app) => (
                              <div
                                key={app.id}
                                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface"
                              >
                                <div className="flex items-center gap-2">
                                  {app.applicant?.avatar_url ? (
                                    <img
                                      src={app.applicant.avatar_url}
                                      alt={app.applicant.full_name}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-orange/20 flex items-center justify-center">
                                      <span className="text-xs font-semibold">
                                        {app.applicant?.full_name
                                          ?.charAt(0)
                                          .toUpperCase() ?? "?"}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium">
                                      {app.applicant?.full_name ?? "Candidat"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(app.created_at)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <StatusBadge status={app.status} />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setReviewingApp(app)}
                                  >
                                    <Eye className="w-3.5 h-3.5 mr-1" />
                                    Evaluer
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {totalApps > 0 && (
            <div
              className="mt-4 rounded-lg p-3 text-xs text-muted-foreground"
              style={{ background: "var(--color-surface)" }}
            >
              Total: {totalApps} candidature(s) recue(s) sur{" "}
              {jobs.length} offre(s).
            </div>
          )}
        </div>

        {/* Review application modal */}
        {reviewingApp && (
          <ReviewApplicationModal
            application={reviewingApp}
            onClose={() => setReviewingApp(null)}
            onUpdate={fetchData}
          />
        )}
      </div>
    );
  }

  // ── Developer view ──
  return (
    <div className="flex flex-col gap-8">
      {/* ── Offres recommandees ── */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold">Offres recommandees</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Base sur :{" "}
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-block text-xs font-medium rounded px-1.5 py-0.5 mr-1"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-orange) 15%, transparent)",
                    color: "var(--color-orange)",
                  }}
                >
                  {s}
                </span>
              ))}
              {profile.city && (
                <span className="text-xs text-muted-foreground">
                  -- {profile.city}
                </span>
              )}
            </p>
          </div>
          <Badge
            className="text-xs"
            style={{ background: "var(--color-orange)", color: "#fff" }}
          >
            {jobs.length} offre(s)
          </Badge>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Aucune offre disponible pour le moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map((job) => {
              const alreadyApplied = appliedJobIds.has(job.id);
              const salary = formatSalary(
                job.salary_min,
                job.salary_max,
                job.salary_currency
              );

              return (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold">
                            {job.company}
                          </span>
                        </div>
                        <p className="font-medium">{job.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                          )}
                          {job.type && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {job.type}
                            </span>
                          )}
                          {salary && <span>{salary}</span>}
                        </div>
                        {job.tech_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {job.tech_tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 rounded-full border"
                                style={{ borderColor: "var(--color-border)" }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {job.expires_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Expire le {formatDate(job.expires_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {alreadyApplied ? (
                        <Button size="sm" variant="outline" disabled>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Deja postule
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          style={{
                            background: "var(--color-orange)",
                            color: "#fff",
                          }}
                          onClick={() => setApplyingJob(job)}
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          Postuler
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <a
            href="https://jobs.ivoire.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm flex items-center gap-1.5"
            style={{ color: "var(--color-orange)" }}
          >
            Voir toutes les offres
          </a>
        </div>
      </div>

      {/* ── Mes candidatures ── */}
      <div>
        <h2 className="text-xl font-bold mb-3">
          Mes candidatures ({applications.length})
        </h2>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Vous n&apos;avez pas encore postule.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        {app.job && (
                          <>
                            <span className="font-medium text-sm">
                              {app.job.company}
                            </span>
                            <span className="text-muted-foreground text-sm">
                              --
                            </span>
                            <span className="text-sm">{app.job.title}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Postule le {formatDate(app.created_at)}
                        {app.job?.type && ` -- ${app.job.type}`}
                        {app.job?.location && ` -- ${app.job.location}`}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <StatusBadge status={app.status} />
                      </div>
                      {app.reviewer_notes && app.status !== "pending" && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          &ldquo;{app.reviewer_notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Withdraw button for active applications */}
                  {!["withdrawn", "accepted", "rejected"].includes(
                    app.status
                  ) && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleWithdraw(app.id)}
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Retirer ma candidature
                        </Button>
                      </div>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Status legend */}
        <div
          className="mt-4 rounded-lg p-3 text-xs text-muted-foreground flex flex-wrap gap-3"
          style={{ background: "var(--color-surface)" }}
        >
          <span className="font-medium text-foreground mr-1">Statuts :</span>
          <span>Envoyee</span>
          <span>&rarr;</span>
          <span>En revue</span>
          <span>&rarr;</span>
          <span>Entretien</span>
          <span>&rarr;</span>
          <span>Acceptee</span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="text-muted-foreground">&crarr;</span>
            Refusee
          </span>
        </div>
      </div>

      {/* ── Apply modal ── */}
      {applyingJob && (
        <ApplyModal
          job={applyingJob}
          onClose={() => setApplyingJob(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
