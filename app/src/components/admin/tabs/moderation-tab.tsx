"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck, Ban, Eye, Loader2, UserCheck, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Report {
  id: string;
  reason: string;
  description?: string;
  status: string;
  created_at: string;
  reporter?: { full_name: string; slug: string } | null;
  target?: { full_name: string; slug: string } | null;
}

interface Certification {
  id: string;
  type: string;
  document_url?: string | null;
  status: string;
  submitted_at: string;
  profile?: { full_name: string; slug: string; profile_type: string } | null;
}

export function AdminModerationTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reports?status=pending");
      if (!res.ok) throw new Error();
      const data: Report[] = await res.json();
      setReports(data);
    } catch {
      toast.error("Erreur lors du chargement des signalements");
    } finally {
      setLoadingReports(false);
    }
  }, []);

  const fetchCertifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/certifications?status=pending");
      if (!res.ok) throw new Error();
      const data: Certification[] = await res.json();
      setCertifications(data);
    } catch {
      toast.error("Erreur lors du chargement des certifications");
    } finally {
      setLoadingCerts(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchCertifications();
  }, [fetchReports, fetchCertifications]);

  async function handleReport(reportId: string, status: "resolved" | "dismissed", action?: "suspend_target") {
    setActionLoading(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, action }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(
        status === "resolved"
          ? action === "suspend_target" ? "Profil suspendu" : "Signalement resolu"
          : "Signalement ignore"
      );
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch {
      toast.error("Erreur lors du traitement");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCertification(certId: string, action: "approve" | "reject") {
    setActionLoading(certId);
    try {
      const res = await fetch("/api/admin/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificationId: certId, action }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(action === "approve" ? "Certification approuvee" : "Certification refusee");
      setCertifications((prev) => prev.filter((c) => c.id !== certId));
    } catch {
      toast.error("Erreur lors du traitement");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Moderation & Signalements</h2>

      {/* Signalements en attente */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          SIGNALEMENTS EN ATTENTE ({reports.length})
        </h3>
        {loadingReports ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Aucun signalement en attente</div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Card key={r.id} style={{ background: "color-mix(in srgb,#ef4444 6%,var(--color-surface))", border: "1px solid color-mix(in srgb,#ef4444 20%,transparent)" }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {r.target?.slug ? (
                          <a className="text-red-400 hover:underline" href={`https://${r.target.slug}.ivoire.io`} target="_blank" rel="noopener noreferrer">
                            {r.target.full_name ?? r.target.slug}
                          </a>
                        ) : (
                          <span className="text-red-400">Profil inconnu</span>
                        )}
                      </div>
                      {r.reporter && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Signale par {r.reporter.full_name}
                        </div>
                      )}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        <Badge className="text-xs bg-red-500/10 text-red-400 border-red-500/20">{r.reason}</Badge>
                      </div>
                      {r.description && (
                        <div className="text-xs text-muted-foreground mt-1">{r.description}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Date : {new Date(r.created_at).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {r.target?.slug && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => window.open(`https://${r.target!.slug}.ivoire.io`, "_blank")}>
                        <Eye className="h-3 w-3" /> Voir profil
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="gap-1 text-xs h-7 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
                      disabled={actionLoading === r.id}
                      onClick={() => handleReport(r.id, "resolved", "suspend_target")}
                    >
                      {actionLoading === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
                      Suspendre
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs h-7 text-green-400 border-green-500/30"
                      disabled={actionLoading === r.id}
                      onClick={() => handleReport(r.id, "dismissed")}
                    >
                      <UserCheck className="h-3 w-3" /> Ignorer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Certifications */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          VALIDATION ENTREPRISES — Badge certifie ({certifications.length})
        </h3>
        {loadingCerts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : certifications.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Aucune certification en attente</div>
        ) : (
          <div className="space-y-3">
            {certifications.map((c) => (
              <Card key={c.id} style={{ background: "color-mix(in srgb,#f59e0b 6%,var(--color-surface))", border: "1px solid color-mix(in srgb,#f59e0b 20%,transparent)" }}>
                <CardContent className="p-4">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-yellow-400" />
                    {c.profile ? (
                      <a className="text-yellow-400 hover:underline" href={`https://${c.profile.slug}.ivoire.io`} target="_blank" rel="noopener noreferrer">
                        {c.profile.full_name} — {c.profile.slug}.ivoire.io
                      </a>
                    ) : (
                      <span>Profil inconnu</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Demande de certification — {c.type}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Date : {new Date(c.submitted_at).toLocaleDateString("fr-FR")}
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {c.document_url && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => window.open(c.document_url!, "_blank")}>
                        <Eye className="h-3 w-3" /> Voir docs
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="gap-1 text-xs h-7"
                      style={{ background: "var(--color-orange)" }}
                      disabled={actionLoading === c.id}
                      onClick={() => handleCertification(c.id, "approve")}
                    >
                      {actionLoading === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <BadgeCheck className="h-3 w-3" />}
                      Certifier
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-xs h-7 text-red-400"
                      disabled={actionLoading === c.id}
                      onClick={() => handleCertification(c.id, "reject")}
                    >
                      <X className="h-3 w-3" /> Refuser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
