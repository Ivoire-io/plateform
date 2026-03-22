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
import type { Pack } from "@/lib/types";
import {
  Check,
  Package,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ICON_MAP: Record<string, React.ElementType> = {
  Package,
  TrendingUp,
};

const EMPTY_PACK: Omit<Pack, "id" | "created_at" | "updated_at"> = {
  slug: "",
  name: "",
  description: "",
  price: 0,
  currency: "XOF",
  icon: "Package",
  color: "#f97316",
  is_active: true,
  sort_order: 99,
  includes: [],
  unlocked_features: [],
  duration_days: null,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AdminPacksTab() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<Pack | null>(null);
  const [form, setForm] = useState(EMPTY_PACK);
  const [includeInput, setIncludeInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deletePack, setDeletePack] = useState<Pack | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packs");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPacks(data.packs ?? []);
    } catch {
      toast.error("Erreur lors du chargement des packs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  function openCreate() {
    setEditingPack(null);
    setForm(EMPTY_PACK);
    setDialogOpen(true);
  }

  function openEdit(pack: Pack) {
    setEditingPack(pack);
    setForm({
      slug: pack.slug,
      name: pack.name,
      description: pack.description ?? "",
      price: pack.price,
      currency: pack.currency,
      icon: pack.icon,
      color: pack.color,
      is_active: pack.is_active,
      sort_order: pack.sort_order,
      includes: pack.includes ?? [],
      unlocked_features: pack.unlocked_features ?? [],
      duration_days: pack.duration_days,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.slug.trim() || !form.name.trim()) {
      toast.error("Slug et nom sont requis");
      return;
    }

    setSaving(true);
    try {
      const url = editingPack
        ? `/api/admin/packs/${editingPack.id}`
        : "/api/admin/packs";
      const method = editingPack ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur serveur");
      }

      toast.success(editingPack ? "Pack mis a jour" : "Pack cree");
      setDialogOpen(false);
      fetchPacks();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(pack: Pack) {
    try {
      const res = await fetch(`/api/admin/packs/${pack.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !pack.is_active }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur");
      }
      toast.success(`Pack "${pack.name}" ${!pack.is_active ? "active" : "desactive"}`);
      fetchPacks();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  async function handleDelete() {
    if (!deletePack) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/packs/${deletePack.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur");
      }
      toast.success(`Pack "${deletePack.name}" supprime`);
      setDeletePack(null);
      fetchPacks();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setDeleting(false);
    }
  }

  function addInclude() {
    const text = includeInput.trim();
    if (!text || form.includes.includes(text)) return;
    setForm({ ...form, includes: [...form.includes, text] });
    setIncludeInput("");
  }

  function removeInclude(index: number) {
    setForm({ ...form, includes: form.includes.filter((_, i) => i !== index) });
  }

  function addFeature() {
    const text = featureInput.trim();
    if (!text || form.unlocked_features.includes(text)) return;
    setForm({ ...form, unlocked_features: [...form.unlocked_features, text] });
    setFeatureInput("");
  }

  function removeFeature(index: number) {
    setForm({ ...form, unlocked_features: form.unlocked_features.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestion des Packs</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Packs a achat unique (Pack Lancement, Pack Investisseur, etc.)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={fetchPacks}>
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
            Nouveau pack
          </Button>
        </div>
      </div>

      {/* Packs grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : packs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Aucun pack configure. Cliquez sur &quot;Nouveau pack&quot; pour commencer.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {packs.map((pack) => {
            const IconComp = ICON_MAP[pack.icon] ?? Package;
            return (
              <Card
                key={pack.id}
                className={`relative transition-all ${!pack.is_active ? "opacity-50" : ""}`}
                style={{
                  background: "var(--color-surface)",
                  border: `1px solid var(--color-border)`,
                }}
              >
                {!pack.is_active && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white px-2 py-0.5 rounded-full bg-red-500">
                    DESACTIVE
                  </span>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${pack.color}20`, color: pack.color }}
                      >
                        <IconComp className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{pack.name}</CardTitle>
                        <p className="text-[10px] text-muted-foreground">{pack.slug}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      Achat unique
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold" style={{ color: pack.color }}>
                      {pack.price.toLocaleString("fr-FR")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {pack.currency}
                    </span>
                  </div>

                  {/* Description */}
                  {pack.description && (
                    <p className="text-xs text-muted-foreground">{pack.description}</p>
                  )}

                  {/* Duration */}
                  {pack.duration_days && (
                    <Badge variant="outline" className="text-[10px]">
                      Duree: {pack.duration_days} jours
                    </Badge>
                  )}

                  {/* Includes */}
                  {pack.includes?.length > 0 && (
                    <ul className="space-y-1 max-h-28 overflow-y-auto">
                      {pack.includes.slice(0, 5).map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px]">
                          <Check className="h-3 w-3 mt-0.5 shrink-0" style={{ color: pack.color }} />
                          <span>{item}</span>
                        </li>
                      ))}
                      {pack.includes.length > 5 && (
                        <li className="text-[10px] text-muted-foreground pl-5">
                          +{pack.includes.length - 5} autres...
                        </li>
                      )}
                    </ul>
                  )}

                  {/* Unlocked features count */}
                  {pack.unlocked_features?.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {pack.unlocked_features.length} fonctionnalite{pack.unlocked_features.length > 1 ? "s" : ""} debloquee{pack.unlocked_features.length > 1 ? "s" : ""}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1 h-7 text-xs"
                      onClick={() => openEdit(pack)}
                    >
                      <Pencil className="h-3 w-3" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleToggle(pack)}
                      title={pack.is_active ? "Desactiver" : "Activer"}
                    >
                      <Power className={`h-3 w-3 ${pack.is_active ? "text-green-500" : "text-red-500"}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                      onClick={() => setDeletePack(pack)}
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
              {editingPack ? `Modifier — ${editingPack.name}` : "Nouveau pack"}
            </DialogTitle>
            <DialogDescription>
              {editingPack
                ? "Les modifications seront appliquees immediatement."
                : "Ce pack sera disponible a l'achat des qu'il sera actif."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Basic info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Informations de base</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="h-8 text-sm mt-1"
                    placeholder="ex: pack-lancement"
                    disabled={!!editingPack}
                  />
                </div>
                <div>
                  <Label className="text-xs">Nom</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-8 text-sm mt-1"
                    placeholder="ex: Pack Lancement"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={form.description ?? ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="h-8 text-sm mt-1"
                    placeholder="Court descriptif du pack"
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
                  <Label className="text-xs">Duree (jours)</Label>
                  <Input
                    type="number"
                    value={form.duration_days ?? ""}
                    onChange={(e) => setForm({ ...form, duration_days: e.target.value ? parseInt(e.target.value) : null })}
                    className="h-8 text-sm mt-1"
                    placeholder="Permanent si vide"
                  />
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
              </div>
            </div>

            {/* Appearance */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Apparence</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Icone</Label>
                  <Input
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="h-8 text-sm mt-1"
                    placeholder="Package"
                  />
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
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="accent-orange-500"
                    />
                    Actif (visible)
                  </label>
                </div>
              </div>
            </div>

            {/* Includes (what the user gets) */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">
                Contenu du pack ({form.includes.length})
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Ce que l&apos;utilisateur recoit en achetant ce pack.
              </p>

              {form.includes.length > 0 && (
                <div className="space-y-1">
                  {form.includes.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="h-3 w-3 shrink-0" style={{ color: form.color }} />
                      <span className="text-xs flex-1">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeInclude(i)}
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
                  value={includeInput}
                  onChange={(e) => setIncludeInput(e.target.value)}
                  className="h-7 text-xs flex-1"
                  placeholder="ex: Business Plan genere par IA"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInclude())}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={addInclude}
                >
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Unlocked features */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">
                Fonctionnalites debloquees ({form.unlocked_features.length})
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Fonctionnalites que ce pack debloque pour l&apos;utilisateur.
              </p>

              {form.unlocked_features.length > 0 && (
                <div className="space-y-1">
                  {form.unlocked_features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="h-3 w-3 shrink-0" style={{ color: form.color }} />
                      <span className="text-xs flex-1">{feat}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
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
                  placeholder="ex: pitch_deck, export_pdf"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={addFeature}
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
              {saving ? "Enregistrement..." : editingPack ? "Mettre a jour" : "Creer le pack"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─── */}
      <Dialog open={!!deletePack} onOpenChange={(o) => !o && setDeletePack(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer le pack</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer le pack &quot;{deletePack?.name}&quot; ?
              Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeletePack(null)} disabled={deleting}>
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
