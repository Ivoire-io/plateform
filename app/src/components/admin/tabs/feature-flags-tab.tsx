"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FlagRow {
  key: string;
  label: string;
  state: "off" | "beta" | "public";
  access: string;
  isPortal?: boolean;
  feature?: string;
}

const PORTAL_FLAGS: FlagRow[] = [
  { key: "devs", label: "devs.ivoire.io", state: "public", access: "Tous", isPortal: true },
  { key: "portfolio", label: "[slug].ivoire.io", state: "public", access: "Tous", isPortal: true },
  { key: "startups", label: "startups.ivoire.io", state: "beta", access: "Invités (34)", isPortal: true },
  { key: "jobs", label: "jobs.ivoire.io", state: "beta", access: "Entreprises", isPortal: true },
  { key: "learn", label: "learn.ivoire.io", state: "off", access: "—", isPortal: true },
  { key: "events", label: "events.ivoire.io", state: "off", access: "—", isPortal: true },
  { key: "health", label: "health.ivoire.io", state: "off", access: "—", isPortal: true },
  { key: "invest", label: "invest.ivoire.io", state: "off", access: "—", isPortal: true },
  { key: "data", label: "data.ivoire.io", state: "off", access: "—", isPortal: true },
  { key: "blog", label: "blog.ivoire.io", state: "public", access: "Tous", isPortal: true },
];

const FEATURE_FLAGS: FlagRow[] = [
  { key: "feature_messaging", label: "Messagerie interne", state: "public", access: "Global", feature: "Global" },
  { key: "feature_visio", label: "Visioconférence", state: "off", access: "—", feature: "jobs." },
  { key: "feature_calendar", label: "Calendrier d'entretiens", state: "off", access: "—", feature: "jobs." },
  { key: "feature_votes", label: "Votes & Commentaires", state: "public", access: "Global", feature: "startups." },
  { key: "feature_mobile_money", label: "Paiement Mobile Money", state: "beta", access: "Beta", feature: "Global" },
  { key: "feature_stripe", label: "Paiement Stripe", state: "public", access: "Global", feature: "Global" },
  { key: "feature_pdf_export", label: "Export PDF Portfolio", state: "public", access: "Global", feature: "[slug]." },
  { key: "feature_custom_domain", label: "Domaine personnalisé", state: "off", access: "—", feature: "[slug]." },
  { key: "feature_analytics", label: "Analytics portfolio", state: "beta", access: "Beta", feature: "[slug]." },
  { key: "feature_open_data_api", label: "Open Data API", state: "off", access: "—", feature: "data." },
  { key: "feature_quiz", label: "Système de quiz", state: "off", access: "—", feature: "learn." },
  { key: "feature_mentorship", label: "Mentorat", state: "off", access: "—", feature: "learn." },
];

const STATE_BADGES: Record<string, { label: string; style: React.CSSProperties }> = {
  off: { label: "🔴 OFF", style: { background: "color-mix(in srgb,#ef4444 15%,transparent)", color: "#ef4444", border: "1px solid color-mix(in srgb,#ef4444 30%,transparent)" } },
  beta: { label: "🟡 BETA", style: { background: "color-mix(in srgb,#f59e0b 15%,transparent)", color: "#f59e0b", border: "1px solid color-mix(in srgb,#f59e0b 30%,transparent)" } },
  public: { label: "🟢 PUBLIC", style: { background: "color-mix(in srgb,#22c55e 15%,transparent)", color: "#22c55e", border: "1px solid color-mix(in srgb,#22c55e 30%,transparent)" } },
};

function FlagTable({ rows, onEdit }: { rows: FlagRow[]; onEdit: (flag: FlagRow) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground text-xs">
            <th className="text-left p-3 pl-4">Portail / Fonctionnalité</th>
            <th className="text-left p-3">État</th>
            <th className="text-left p-3">Accès</th>
            <th className="text-left p-3">⚙️</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((flag) => {
            const badge = STATE_BADGES[flag.state];
            return (
              <tr key={flag.key} className="border-b border-border/50 hover:bg-white/2">
                <td className="p-3 pl-4 font-mono text-xs">{flag.label}</td>
                <td className="p-3">
                  <Badge className="text-xs" style={badge.style}>{badge.label}</Badge>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{flag.access}</td>
                <td className="p-3">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onEdit(flag)}>
                    <Settings className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AdminFeatureFlagsTab() {
  const [portalFlags, setPortalFlags] = useState(PORTAL_FLAGS);
  const [featureFlags, setFeatureFlags] = useState(FEATURE_FLAGS);
  const [editFlag, setEditFlag] = useState<FlagRow | null>(null);
  const [editState, setEditState] = useState<"off" | "beta" | "public">("off");
  const [betaMessage, setBetaMessage] = useState("Ce portail arrive bientôt ! 🚀");

  function openEdit(flag: FlagRow) {
    setEditFlag(flag);
    setEditState(flag.state);
    setBetaMessage("Ce portail arrive bientôt ! 🚀");
  }

  function saveFlag() {
    if (!editFlag) return;
    const update = (list: FlagRow[]) =>
      list.map((f) => f.key === editFlag.key ? { ...f, state: editState } : f);
    if (editFlag.isPortal) setPortalFlags(update(portalFlags));
    else setFeatureFlags(update(featureFlags));
    toast.success(`Flag "${editFlag.label}" mis à jour → ${editState.toUpperCase()}`);
    setEditFlag(null);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">🎛️ Feature Flags — Activation Progressive</h2>

      <div
        className="rounded-lg px-4 py-3 text-xs"
        style={{ background: "color-mix(in srgb,#3b82f6 10%,transparent)", border: "1px solid color-mix(in srgb,#3b82f6 25%,transparent)", color: "#93c5fd" }}
      >
        ℹ️ Un portail OFF masque automatiquement toutes ses fonctionnalités. Un portail BETA rend les features disponibles uniquement aux utilisateurs autorisés.
      </div>

      {/* Portails */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Portails</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <FlagTable rows={portalFlags} onEdit={openEdit} />
        </CardContent>
      </Card>

      {/* Fonctionnalités */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Fonctionnalités Individuelles</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <FlagTable rows={featureFlags} onEdit={openEdit} />
        </CardContent>
      </Card>

      {/* Sheet édition flag */}
      <Sheet open={!!editFlag} onOpenChange={(o) => !o && setEditFlag(null)}>
        <SheetContent style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          {editFlag && (
            <>
              <SheetHeader>
                <SheetTitle className="text-sm">⚙️ {editFlag.label}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">État</Label>
                  <div className="mt-2 space-y-2">
                    {(["off", "beta", "public"] as const).map((s) => (
                      <label key={s} className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" value={s} checked={editState === s} onChange={() => setEditState(s)} className="accent-orange-500" />
                        <Badge className="text-xs" style={STATE_BADGES[s].style}>{STATE_BADGES[s].label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {s === "off" && "— Page \u00abBientôt disponible\u00bb affichée"}
                          {s === "beta" && "— Accès restreint à une liste"}
                          {s === "public" && "— Accès ouvert à tous"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {editState === "off" && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Message &quot;Coming Soon&quot;</Label>
                    <Textarea
                      className="mt-1 text-sm resize-none"
                      rows={2}
                      value={betaMessage}
                      onChange={(e) => setBetaMessage(e.target.value)}
                      style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}
                    />
                  </div>
                )}

                {editState === "beta" && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Qui peut accéder ?</Label>
                    <div className="space-y-1">
                      {["enterprise", "startup", "developer"].map((t) => (
                        <label key={t} className="flex items-center gap-2 text-xs cursor-pointer">
                          <input type="checkbox" defaultChecked={t === "enterprise"} className="accent-orange-500" />
                          <span className="capitalize">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" style={{ background: "var(--color-orange)" }} onClick={saveFlag}>
                    💾 Enregistrer
                  </Button>
                  <Button variant="outline" onClick={() => setEditFlag(null)}>
                    ✖ Annuler
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
