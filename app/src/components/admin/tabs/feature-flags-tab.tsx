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
import { Loader2, Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  category: string;
  state: "off" | "beta" | "public";
  beta_plan?: string | null;
  beta_types?: string[] | null;
  coming_soon_msg?: string | null;
  created_at: string;
  updated_at: string;
}

const STATE_BADGES: Record<string, { label: string; style: React.CSSProperties }> = {
  off: { label: "OFF", style: { background: "color-mix(in srgb,#ef4444 15%,transparent)", color: "#ef4444", border: "1px solid color-mix(in srgb,#ef4444 30%,transparent)" } },
  beta: { label: "BETA", style: { background: "color-mix(in srgb,#f59e0b 15%,transparent)", color: "#f59e0b", border: "1px solid color-mix(in srgb,#f59e0b 30%,transparent)" } },
  public: { label: "PUBLIC", style: { background: "color-mix(in srgb,#22c55e 15%,transparent)", color: "#22c55e", border: "1px solid color-mix(in srgb,#22c55e 30%,transparent)" } },
};

function FlagTable({ rows, onEdit }: { rows: FeatureFlag[]; onEdit: (flag: FeatureFlag) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground text-xs">
            <th className="text-left p-3 pl-4">Cle</th>
            <th className="text-left p-3">Nom</th>
            <th className="text-left p-3">Etat</th>
            <th className="text-left p-3">Categorie</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((flag) => {
            const badge = STATE_BADGES[flag.state] ?? STATE_BADGES.off;
            return (
              <tr key={flag.key} className="border-b border-border/50 hover:bg-white/2">
                <td className="p-3 pl-4 font-mono text-xs">{flag.key}</td>
                <td className="p-3 text-sm font-medium">{flag.name}</td>
                <td className="p-3">
                  <Badge className="text-xs" style={badge.style}>{badge.label}</Badge>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{flag.category}</td>
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
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editFlag, setEditFlag] = useState<FeatureFlag | null>(null);
  const [editState, setEditState] = useState<"off" | "beta" | "public">("off");
  const [betaMessage, setBetaMessage] = useState("");
  const [betaTypes, setBetaTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchFlags = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/flags");
      if (!res.ok) throw new Error();
      const data: FeatureFlag[] = await res.json();
      setFlags(data);
    } catch {
      toast.error("Erreur lors du chargement des feature flags");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFlags(); }, [fetchFlags]);

  const portalFlags = flags.filter((f) => f.category === "portal");
  const featureFlags = flags.filter((f) => f.category !== "portal");

  function openEdit(flag: FeatureFlag) {
    setEditFlag(flag);
    setEditState(flag.state);
    setBetaMessage(flag.coming_soon_msg ?? "");
    setBetaTypes(flag.beta_types ?? []);
  }

  async function saveFlag() {
    if (!editFlag) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/flags/${editFlag.key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: editState,
          coming_soon_msg: betaMessage || null,
          beta_types: betaTypes.length > 0 ? betaTypes : null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated: FeatureFlag = await res.json();
      setFlags((prev) => prev.map((f) => f.key === editFlag.key ? updated : f));
      toast.success(`Flag "${editFlag.name}" mis a jour`);
      setEditFlag(null);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  function toggleBetaType(type: string) {
    setBetaTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Feature Flags — Activation Progressive</h2>

      <div
        className="rounded-lg px-4 py-3 text-xs"
        style={{ background: "color-mix(in srgb,#3b82f6 10%,transparent)", border: "1px solid color-mix(in srgb,#3b82f6 25%,transparent)", color: "#93c5fd" }}
      >
        Un portail OFF masque automatiquement toutes ses fonctionnalites. Un portail BETA rend les features disponibles uniquement aux utilisateurs autorises.
      </div>

      {portalFlags.length > 0 && (
        <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Portails</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <FlagTable rows={portalFlags} onEdit={openEdit} />
          </CardContent>
        </Card>
      )}

      {featureFlags.length > 0 && (
        <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Fonctionnalites Individuelles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <FlagTable rows={featureFlags} onEdit={openEdit} />
          </CardContent>
        </Card>
      )}

      {flags.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          Aucun feature flag configure
        </div>
      )}

      {/* Sheet edition flag */}
      <Sheet open={!!editFlag} onOpenChange={(o) => !o && setEditFlag(null)}>
        <SheetContent style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          {editFlag && (
            <>
              <SheetHeader>
                <SheetTitle className="text-sm">{editFlag.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Etat</Label>
                  <div className="mt-2 space-y-2">
                    {(["off", "beta", "public"] as const).map((s) => (
                      <label key={s} className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" value={s} checked={editState === s} onChange={() => setEditState(s)} className="accent-orange-500" />
                        <Badge className="text-xs" style={STATE_BADGES[s].style}>{STATE_BADGES[s].label}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {s === "off" && "— Page Bientot disponible affichee"}
                          {s === "beta" && "— Acces restreint a une liste"}
                          {s === "public" && "— Acces ouvert a tous"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {editState === "off" && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Message Coming Soon</Label>
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
                    <Label className="text-xs text-muted-foreground">Qui peut acceder ?</Label>
                    <div className="space-y-1">
                      {["enterprise", "startup", "developer"].map((t) => (
                        <label key={t} className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={betaTypes.includes(t)}
                            onChange={() => toggleBetaType(t)}
                            className="accent-orange-500"
                          />
                          <span className="capitalize">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" style={{ background: "var(--color-orange)" }} onClick={saveFlag} disabled={saving}>
                    {saving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                    Enregistrer
                  </Button>
                  <Button variant="outline" onClick={() => setEditFlag(null)}>
                    Annuler
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
