"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/select";
import type { DynamicPlan } from "@/lib/types";
import {
  Check,
  Crown,
  GraduationCap,
  GripVertical,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Rocket,
  Shield,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  GraduationCap,
  Rocket,
  Crown,
  Shield,
};

const BILLING_LABELS: Record<string, string> = {
  free: "Gratuit",
  monthly: "Mensuel",
  yearly: "Annuel",
  one_time: "Paiement unique",
  custom: "Sur mesure",
};

const TEMPLATE_OPTIONS = ["free", "free+1", "all", "all+corporate"];

const ALL_FEATURES = [
  { key: "pitch_deck", label: "Pitch Deck" },
  { key: "cahier_charges", label: "Cahier des charges" },
  { key: "business_plan", label: "Business Plan" },
  { key: "one_pager", label: "One Pager" },
  { key: "cgu", label: "CGU" },
  { key: "roadmap", label: "Roadmap produit" },
  { key: "competitors_analysis", label: "Analyse concurrents" },
  { key: "oapi_check", label: "Verification OAPI" },
  { key: "timestamp", label: "Horodatage" },
  { key: "export_pdf", label: "Export PDF" },
  { key: "fundraising", label: "Levee de fonds" },
  { key: "advanced_stats", label: "Stats avancees" },
  { key: "verified_badge", label: "Badge verifie" },
  { key: "priority_visibility", label: "Visibilite prioritaire" },
  { key: "homepage_featured", label: "Mise en avant homepage" },
  { key: "dev_outsourcing", label: "Dev outsourcing" },
];

const EMPTY_PLAN: Omit<DynamicPlan, "id" | "created_at" | "updated_at"> = {
  tier: "",
  name: "",
  tagline: "",
  description: "",
  price: 0,
  currency: "XOF",
  billing_type: "monthly",
  icon: "Zap",
  color: "#6b7280",
  target_type: "all",
  is_active: true,
  is_highlighted: false,
  sort_order: 99,
  max_projects: 5,
  max_team_members: 3,
  max_products: 2,
  max_job_listings: 1,
  max_ai_generations_per_day: 10,
  max_logo_variations: 1,
  max_regenerations: 3,
  allowed_templates: "free",
  features: Object.fromEntries(ALL_FEATURES.map((f) => [f.key, false])),
  display_features: [],
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AdminPlansTab() {
  const [plans, setPlans] = useState<DynamicPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DynamicPlan | null>(null);
  const [form, setForm] = useState(EMPTY_PLAN);
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deletePlan, setDeletePlan] = useState<DynamicPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlans(data.plans ?? []);
    } catch {
      toast.error("Erreur lors du chargement des plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  function openCreate() {
    setEditingPlan(null);
    setForm(EMPTY_PLAN);
    setDialogOpen(true);
  }

  function openEdit(plan: DynamicPlan) {
    setEditingPlan(plan);
    setForm({
      tier: plan.tier,
      name: plan.name,
      tagline: plan.tagline ?? "",
      description: plan.description ?? "",
      price: plan.price,
      currency: plan.currency,
      billing_type: plan.billing_type,
      icon: plan.icon,
      color: plan.color,
      target_type: plan.target_type ?? "all",
      is_active: plan.is_active,
      is_highlighted: plan.is_highlighted,
      sort_order: plan.sort_order,
      max_projects: plan.max_projects,
      max_team_members: plan.max_team_members,
      max_products: plan.max_products,
      max_job_listings: plan.max_job_listings,
      max_ai_generations_per_day: plan.max_ai_generations_per_day,
      max_logo_variations: plan.max_logo_variations,
      max_regenerations: plan.max_regenerations,
      allowed_templates: plan.allowed_templates,
      features: { ...Object.fromEntries(ALL_FEATURES.map((f) => [f.key, false])), ...plan.features },
      display_features: plan.display_features ?? [],
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.tier.trim() || !form.name.trim()) {
      toast.error("Tier et nom sont requis");
      return;
    }

    setSaving(true);
    try {
      const url = editingPlan
        ? `/api/admin/plans/${editingPlan.id}`
        : "/api/admin/plans";
      const method = editingPlan ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur serveur");
      }

      toast.success(editingPlan ? "Plan mis a jour" : "Plan cree");
      setDialogOpen(false);
      fetchPlans();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(plan: DynamicPlan) {
    try {
      const res = await fetch(`/api/admin/plans/${plan.id}/toggle`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur");
      }
      const data = await res.json();
      toast.success(`Plan "${plan.name}" ${data.is_active ? "active" : "desactive"}`);
      fetchPlans();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function handleDelete() {
    if (!deletePlan) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/plans/${deletePlan.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur");
      }
      toast.success(`Plan "${deletePlan.name}" supprime`);
      setDeletePlan(null);
      fetchPlans();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setDeleting(false);
    }
  }

  function addDisplayFeature() {
    const text = featureInput.trim();
    if (!text || form.display_features.includes(text)) return;
    setForm({ ...form, display_features: [...form.display_features, text] });
    setFeatureInput("");
  }

  function removeDisplayFeature(index: number) {
    setForm({
      ...form,
      display_features: form.display_features.filter((_, i) => i !== index),
    });
  }

  function toggleFeature(key: string) {
    setForm({
      ...form,
      features: { ...form.features, [key]: !form.features[key] },
    });
  }

  function setLimit(key: string, val: string) {
    const parsed = val === "" ? null : parseInt(val, 10);
    setForm({ ...form, [key]: isNaN(parsed as number) ? null : parsed });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestion des Plans</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Creez, modifiez et activez vos offres en temps reel
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={fetchPlans}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button
            size="sm"
            className="gap-2"
            style={{ background: "var(--color-orange)" }}
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" />
            Nouveau plan
          </Button>
        </div>
      </div>

      {/* Plans grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Aucun plan configure. Cliquez sur &quot;Nouveau plan&quot; pour commencer.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const IconComp = ICON_MAP[plan.icon] ?? Zap;
            return (
              <Card
                key={plan.id}
                className={`relative transition-all ${!plan.is_active ? "opacity-50" : ""}`}
                style={{
                  background: "var(--color-surface)",
                  border: plan.is_highlighted
                    ? `2px solid ${plan.color}`
                    : "1px solid var(--color-border)",
                }}
              >
                {plan.is_highlighted && (
                  <span
                    className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white px-2 py-0.5 rounded-full"
                    style={{ background: plan.color }}
                  >
                    POPULAIRE
                  </span>
                )}
                {!plan.is_active && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white px-2 py-0.5 rounded-full bg-red-500">
                    DESACTIVE
                  </span>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${plan.color}20`, color: plan.color }}
                      >
                        <IconComp className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{plan.name}</CardTitle>
                        <p className="text-[10px] text-muted-foreground">{plan.tier}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold" style={{ color: plan.color }}>
                      {plan.price === 0 ? "0" : plan.price.toLocaleString("fr-FR")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      FCFA {BILLING_LABELS[plan.billing_type] ?? plan.billing_type}
                    </span>
                  </div>

                  {/* Tagline */}
                  {plan.tagline && (
                    <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                  )}

                  {/* Limits summary */}
                  <div className="flex flex-wrap gap-1">
                    {plan.target_type && plan.target_type !== "all" && (
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: plan.color, color: plan.color }}>
                        {plan.target_type === "developer" ? "Devs" : plan.target_type === "startup" ? "Startups" : plan.target_type === "enterprise" ? "Entreprises" : plan.target_type}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {plan.max_projects === null ? "Projets: illimites" : `Projets: ${plan.max_projects}`}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {plan.max_ai_generations_per_day === null ? "IA: illimitee" : `IA: ${plan.max_ai_generations_per_day}/j`}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      Logo: {plan.max_logo_variations}
                    </Badge>
                  </div>

                  {/* Active features count */}
                  <div className="text-xs text-muted-foreground">
                    {Object.values(plan.features).filter(Boolean).length}/{ALL_FEATURES.length} fonctionnalites actives
                  </div>

                  {/* Display features */}
                  {plan.display_features?.length > 0 && (
                    <ul className="space-y-1 max-h-28 overflow-y-auto">
                      {plan.display_features.slice(0, 5).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px]">
                          <Check className="h-3 w-3 mt-0.5 shrink-0" style={{ color: plan.color }} />
                          <span>{f}</span>
                        </li>
                      ))}
                      {plan.display_features.length > 5 && (
                        <li className="text-[10px] text-muted-foreground pl-5">
                          +{plan.display_features.length - 5} autres...
                        </li>
                      )}
                    </ul>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 h-7 text-xs"
                      onClick={() => openEdit(plan)}
                    >
                      <Pencil className="h-3 w-3" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleToggle(plan)}
                      disabled={plan.tier === "free"}
                      title={plan.is_active ? "Desactiver" : "Activer"}
                    >
                      <Power className={`h-3 w-3 ${plan.is_active ? "text-green-500" : "text-red-500"}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                      onClick={() => setDeletePlan(plan)}
                      disabled={plan.tier === "free"}
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Create/Edit Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? `Modifier — ${editingPlan.name}` : "Nouveau plan"}
            </DialogTitle>
            <DialogDescription>
              {editingPlan
                ? "Les modifications seront appliquees immediatement."
                : "Ce plan sera disponible sur la page d'abonnement des qu'il sera actif."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Basic info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Informations de base</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Identifiant (tier)</Label>
                  <Input
                    value={form.tier}
                    onChange={(e) => setForm({ ...form, tier: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                    className="h-8 text-sm mt-1"
                    placeholder="ex: starter"
                    disabled={!!editingPlan}
                  />
                </div>
                <div>
                  <Label className="text-xs">Nom affiche</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-8 text-sm mt-1"
                    placeholder="ex: Builder"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Accroche</Label>
                  <Input
                    value={form.tagline ?? ""}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    className="h-8 text-sm mt-1"
                    placeholder="ex: Pour lancer votre startup"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={form.description ?? ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="h-8 text-sm mt-1"
                    placeholder="Description affichee sur la carte de pricing"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Tarification</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Prix (FCFA)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                    className="h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Facturation</Label>
                  <NativeSelect
                    value={form.billing_type}
                    onValueChange={(v) => setForm({ ...form, billing_type: v as DynamicPlan["billing_type"] })}
                    className="mt-1"
                  >
                    <NativeSelectOption value="free">Gratuit</NativeSelectOption>
                    <NativeSelectOption value="monthly">Mensuel</NativeSelectOption>
                    <NativeSelectOption value="yearly">Annuel</NativeSelectOption>
                    <NativeSelectOption value="one_time">Paiement unique</NativeSelectOption>
                    <NativeSelectOption value="custom">Sur mesure</NativeSelectOption>
                  </NativeSelect>
                </div>
                <div>
                  <Label className="text-xs">Ordre</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    className="h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Type cible</Label>
                  <NativeSelect
                    value={form.target_type ?? "all"}
                    onValueChange={(v) => setForm({ ...form, target_type: v as DynamicPlan["target_type"] })}
                    className="mt-1"
                  >
                    <NativeSelectOption value="all">Tous</NativeSelectOption>
                    <NativeSelectOption value="developer">Developpeurs</NativeSelectOption>
                    <NativeSelectOption value="startup">Startups</NativeSelectOption>
                    <NativeSelectOption value="enterprise">Entreprises</NativeSelectOption>
                    <NativeSelectOption value="talent">Talents</NativeSelectOption>
                  </NativeSelect>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Apparence</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Icone</Label>
                  <NativeSelect
                    value={form.icon}
                    onValueChange={(v) => setForm({ ...form, icon: v })}
                    className="mt-1"
                  >
                    {Object.keys(ICON_MAP).map((name) => (
                      <NativeSelectOption key={name} value={name}>{name}</NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div>
                  <Label className="text-xs">Couleur</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="h-8 w-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="h-8 text-sm flex-1"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={form.is_highlighted}
                      onChange={(e) => setForm({ ...form, is_highlighted: e.target.checked })}
                      className="accent-orange-500"
                    />
                    Populaire (mis en avant)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="accent-orange-500"
                    />
                    Actif (visible)
                  </label>
                </div>
              </div>
            </div>

            {/* Limits */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Limites</h3>
              <p className="text-[10px] text-muted-foreground">Laissez vide pour illimite</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: "max_projects", label: "Projets max" },
                  { key: "max_team_members", label: "Equipe max" },
                  { key: "max_products", label: "Produits max" },
                  { key: "max_job_listings", label: "Offres max" },
                  { key: "max_ai_generations_per_day", label: "IA / jour" },
                  { key: "max_logo_variations", label: "Logos max" },
                  { key: "max_regenerations", label: "Regen max" },
                ].map((lim) => (
                  <div key={lim.key}>
                    <Label className="text-[10px]">{lim.label}</Label>
                    <Input
                      type="number"
                      value={(form as unknown as Record<string, unknown>)[lim.key] as string ?? ""}
                      onChange={(e) => setLimit(lim.key, e.target.value)}
                      className="h-7 text-xs mt-0.5"
                      placeholder="illimite"
                    />
                  </div>
                ))}
                <div>
                  <Label className="text-[10px]">Templates</Label>
                  <NativeSelect
                    value={form.allowed_templates}
                    onValueChange={(v) => setForm({ ...form, allowed_templates: v })}
                    className="mt-0.5"
                  >
                    {TEMPLATE_OPTIONS.map((t) => (
                      <NativeSelectOption key={t} value={t}>{t}</NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
              </div>
            </div>

            {/* Feature toggles */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">
                Fonctionnalites ({Object.values(form.features).filter(Boolean).length}/{ALL_FEATURES.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {ALL_FEATURES.map((feat) => (
                  <label
                    key={feat.key}
                    className="flex items-center gap-2 cursor-pointer text-xs p-1.5 rounded hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={form.features[feat.key] ?? false}
                      onChange={() => toggleFeature(feat.key)}
                      className="accent-orange-500"
                    />
                    {feat.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Display features */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">
                Features affichees ({form.display_features.length})
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Texte libre affiche sur la carte de pricing. Ordre = ordre d&apos;affichage.
              </p>

              {form.display_features.length > 0 && (
                <div className="space-y-1">
                  {form.display_features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="h-3 w-3 shrink-0" style={{ color: form.color }} />
                      <span className="text-xs flex-1">{f}</span>
                      <button
                        type="button"
                        onClick={() => removeDisplayFeature(i)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  className="h-7 text-xs flex-1"
                  placeholder="ex: 10 projets maximum"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDisplayFeature())}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={addDisplayFeature}
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button
              size="sm"
              style={{ background: "var(--color-orange)" }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Enregistrement..." : editingPlan ? "Mettre a jour" : "Creer le plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─── */}
      <Dialog open={!!deletePlan} onOpenChange={(o) => !o && setDeletePlan(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer le plan</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer le plan &quot;{deletePlan?.name}&quot; ?
              Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeletePlan(null)} disabled={deleting}>
              Annuler
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
