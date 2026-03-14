"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck, Ban, Eye, Trash2, UserCheck, X } from "lucide-react";
import { toast } from "sonner";

const REPORTS = [
  {
    id: "1",
    slug: "spammer",
    full_name: "Spammer",
    reporters: 2,
    reasons: ["Contenu trompeur", "Spam"],
    date: "12/03/2026",
    is_suspended: false,
  },
  {
    id: "2",
    slug: "fakestartup",
    full_name: "Fake Startup",
    reporters: 1,
    reasons: ["Startup inexistante / faux profil"],
    date: "11/03/2026",
    is_suspended: false,
  },
];

const CERTIFICATIONS = [
  {
    id: "1",
    slug: "acme",
    full_name: "Acme Corp",
    documents: ["RCCM", "Logo officiel"],
    date: "10/03/2026",
  },
  {
    id: "2",
    slug: "infotech",
    full_name: "InfoTech CI",
    documents: ["Attestation DFE"],
    date: "09/03/2026",
  },
];

const SUSPENDED = [
  { id: "1", slug: "spammer", full_name: "Spammer", date: "13/03", reason: "Spam" },
];

export function AdminModerationTab() {
  function action(label: string) {
    toast.success(label);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Modération & Signalements</h2>

      {/* Signalements en attente */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          🚨 SIGNALEMENTS EN ATTENTE ({REPORTS.length})
        </h3>
        <div className="space-y-3">
          {REPORTS.map((r) => (
            <Card key={r.id} style={{ background: "color-mix(in srgb,#ef4444 6%,var(--color-surface))", border: "1px solid color-mix(in srgb,#ef4444 20%,transparent)" }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      🚨 <a className="text-red-400 hover:underline" href={`https://${r.slug}.ivoire.io`} target="_blank" rel="noopener noreferrer">{r.slug}.ivoire.io</a>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Signalé par {r.reporters} utilisateur{r.reporters > 1 ? "s" : ""}
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {r.reasons.map((reason) => (
                        <Badge key={reason} className="text-xs bg-red-500/10 text-red-400 border-red-500/20">{reason}</Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Date du premier signalement : {r.date}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => action(`Profil ${r.slug} consulté`)}>
                    <Eye className="h-3 w-3" /> Voir profil
                  </Button>
                  <Button size="sm" className="gap-1 text-xs h-7 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30" onClick={() => action(`${r.slug} suspendu`)}>
                    <Ban className="h-3 w-3" /> Suspendre
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs h-7 text-green-400 border-green-500/30" onClick={() => action(`Signalement ${r.slug} ignoré`)}>
                    <UserCheck className="h-3 w-3" /> Ignorer
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1 text-xs h-7 text-red-400" onClick={() => action(`${r.slug} supprimé`)}>
                    <Trash2 className="h-3 w-3" /> Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          🏅 VALIDATION ENTREPRISES — Badge certifié ({CERTIFICATIONS.length})
        </h3>
        <div className="space-y-3">
          {CERTIFICATIONS.map((c) => (
            <Card key={c.id} style={{ background: "color-mix(in srgb,#f59e0b 6%,var(--color-surface))", border: "1px solid color-mix(in srgb,#f59e0b 20%,transparent)" }}>
              <CardContent className="p-4">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-yellow-400" />
                  <a className="text-yellow-400 hover:underline" href={`https://${c.slug}.ivoire.io`} target="_blank" rel="noopener noreferrer">
                    {c.full_name} — {c.slug}.ivoire.io
                  </a>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Demande de certification reçue le {c.date}</div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Documents fournis :</span>
                  {c.documents.map((doc) => (
                    <Badge key={doc} className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/20">{doc}</Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => action("Documents consultés")}>
                    <Eye className="h-3 w-3" /> Voir docs
                  </Button>
                  <Button size="sm" className="gap-1 text-xs h-7" style={{ background: "var(--color-orange)" }} onClick={() => action(`${c.slug} certifié 🏅`)}>
                    <BadgeCheck className="h-3 w-3" /> Certifier
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1 text-xs h-7 text-red-400" onClick={() => action(`Certification ${c.slug} refusée`)}>
                    <X className="h-3 w-3" /> Refuser
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Comptes suspendus */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          🚫 COMPTES SUSPENDUS ({SUSPENDED.length})
        </h3>
        <div className="space-y-2">
          {SUSPENDED.map((s) => (
            <Card key={s.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-sm font-medium">{s.slug}.ivoire.io</div>
                  <div className="text-xs text-muted-foreground">Suspendu le {s.date} · Motif : {s.reason}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1 text-xs h-7 text-green-400 border-green-500/30" onClick={() => action(`${s.slug} réactivé`)}>
                    <UserCheck className="h-3 w-3" /> Réactiver
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1 text-xs h-7 text-red-400" onClick={() => action(`${s.slug} supprimé définitivement`)}>
                    <Trash2 className="h-3 w-3" /> Supprimer définitivement
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
