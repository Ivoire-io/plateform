"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Template {
  id: string;
  slug: string;
  name: string;
  icon: string;
  state: "off" | "beta" | "active";
  plan: "free" | "premium" | "enterprise";
  allowed_types: string[];
  usage_count?: number;
  created_at: string;
  updated_at: string;
}

const STATE_BADGES: Record<string, { label: string; style: React.CSSProperties }> = {
  off: { label: "OFF", style: { background: "color-mix(in srgb,#ef4444 15%,transparent)", color: "#ef4444", border: "1px solid color-mix(in srgb,#ef4444 30%,transparent)" } },
  beta: { label: "Beta", style: { background: "color-mix(in srgb,#f59e0b 15%,transparent)", color: "#f59e0b", border: "1px solid color-mix(in srgb,#f59e0b 30%,transparent)" } },
  active: { label: "Actif", style: { background: "color-mix(in srgb,#22c55e 15%,transparent)", color: "#22c55e", border: "1px solid color-mix(in srgb,#22c55e 30%,transparent)" } },
};

const PLAN_BADGES: Record<string, { label: string; style: React.CSSProperties }> = {
  free: { label: "Gratuit", style: { background: "color-mix(in srgb,#3b82f6 10%,transparent)", color: "#3b82f6", border: "1px solid color-mix(in srgb,#3b82f6 25%,transparent)" } },
  premium: { label: "Premium", style: { background: "color-mix(in srgb,#8b5cf6 10%,transparent)", color: "#8b5cf6", border: "1px solid color-mix(in srgb,#8b5cf6 25%,transparent)" } },
  enterprise: { label: "Enterprise", style: { background: "color-mix(in srgb,#10b981 10%,transparent)", color: "#10b981", border: "1px solid color-mix(in srgb,#10b981 25%,transparent)" } },
};

const ALL_TYPES = ["developer", "startup", "enterprise", "other"];

export function AdminTemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTpl, setEditTpl] = useState<Template | null>(null);
  const [editState, setEditState] = useState<"off" | "beta" | "active">("active");
  const [editPlan, setEditPlan] = useState<"free" | "premium" | "enterprise">("free");
  const [editTypes, setEditTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/templates");
      if (!res.ok) throw new Error();
      const data: Template[] = await res.json();
      setTemplates(data);
    } catch {
      toast.error("Erreur lors du chargement des templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const totalUsage = templates.reduce((sum, t) => sum + (t.usage_count ?? 0), 0);

  function openEdit(tpl: Template) {
    setEditTpl(tpl);
    setEditState(tpl.state);
    setEditPlan(tpl.plan);
    setEditTypes([...tpl.allowed_types]);
  }

  async function saveTemplate() {
    if (!editTpl) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/templates/${editTpl.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: editState, plan: editPlan, allowed_types: editTypes }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated: Template = await res.json();
      setTemplates((prev) => prev.map((t) => t.id === editTpl.id ? updated : t));
      toast.success(`Template "${editTpl.name}" mis a jour`);
      setEditTpl(null);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  function toggleType(type: string) {
    setEditTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
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
      <h2 className="text-xl font-bold">Gestion des Templates</h2>

      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Templates Portfolios (pages publiques)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left p-3 pl-4">Template</th>
                  <th className="text-left p-3">Etat</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-left p-3">Utilise</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tpl) => (
                  <tr key={tpl.id} className="border-b border-border/50 hover:bg-white/2">
                    <td className="p-3 pl-4">
                      <span className="text-base mr-1">{tpl.icon}</span>
                      <span className="font-medium">{tpl.name}</span>
                    </td>
                    <td className="p-3">
                      <Badge className="text-xs" style={STATE_BADGES[tpl.state]?.style}>{STATE_BADGES[tpl.state]?.label ?? tpl.state}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className="text-xs" style={PLAN_BADGES[tpl.plan]?.style}>{PLAN_BADGES[tpl.plan]?.label ?? tpl.plan}</Badge>
                    </td>
                    <td className="p-3 text-xs font-semibold" style={{ color: (tpl.usage_count ?? 0) > 0 ? "var(--color-orange)" : "var(--color-muted)" }}>
                      {tpl.usage_count ?? 0}
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(tpl)}>
                        <Settings className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {templates.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">Aucun template</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {templates.some((t) => (t.usage_count ?? 0) > 0) && (
        <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Repartition d&apos;Utilisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.filter((t) => (t.usage_count ?? 0) > 0).map((t) => (
              <div key={t.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{t.icon} {t.name}</span>
                  <span className="text-muted-foreground">{t.usage_count} ({totalUsage > 0 ? Math.round(((t.usage_count ?? 0) / totalUsage) * 100) : 0}%)</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${totalUsage > 0 ? ((t.usage_count ?? 0) / totalUsage) * 100 : 0}%`, background: "var(--color-orange)" }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Sheet open={!!editTpl} onOpenChange={(o) => !o && setEditTpl(null)}>
        <SheetContent style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          {editTpl && (
            <>
              <SheetHeader>
                <SheetTitle className="text-sm">Template — {editTpl.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-5">
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-2">Etat</div>
                  {(["off", "beta", "active"] as const).map((s) => (
                    <label key={s} className="flex items-center gap-3 cursor-pointer mb-2">
                      <input type="radio" checked={editState === s} onChange={() => setEditState(s)} className="accent-orange-500" />
                      <Badge className="text-xs" style={STATE_BADGES[s].style}>{STATE_BADGES[s].label}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {s === "off" && "Non visible dans le selecteur"}
                        {s === "beta" && "Visible avec badge BETA"}
                        {s === "active" && "Disponible pour tous (selon plan)"}
                      </span>
                    </label>
                  ))}
                </div>

                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-2">Plan requis</div>
                  {(["free", "premium", "enterprise"] as const).map((p) => (
                    <label key={p} className="flex items-center gap-3 cursor-pointer mb-2">
                      <input type="radio" checked={editPlan === p} onChange={() => setEditPlan(p)} className="accent-orange-500" />
                      <Badge className="text-xs" style={PLAN_BADGES[p].style}>{PLAN_BADGES[p].label}</Badge>
                    </label>
                  ))}
                </div>

                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-2">Types autorises</div>
                  {ALL_TYPES.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer mb-1.5 text-sm capitalize">
                      <input type="checkbox" checked={editTypes.includes(type)} onChange={() => toggleType(type)} className="accent-orange-500" />
                      {type === "developer" ? "Developpeur" : type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>

                <div
                  className="rounded-lg px-3 py-2 text-xs"
                  style={{ background: "color-mix(in srgb,#f59e0b 10%,transparent)", border: "1px solid color-mix(in srgb,#f59e0b 25%,transparent)", color: "#f59e0b" }}
                >
                  Si desactive, les utilisateurs actuels gardent leur template mais ne peuvent plus le selectionner.
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" style={{ background: "var(--color-orange)" }} onClick={saveTemplate} disabled={saving}>
                    {saving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                    Enregistrer
                  </Button>
                  <Button variant="outline" onClick={() => setEditTpl(null)}>
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
