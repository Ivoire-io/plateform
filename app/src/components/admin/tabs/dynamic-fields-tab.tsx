"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface DynamicField {
  id: string;
  category: string;
  value: string;
  label: string;
  parent: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "city", label: "Villes / Communes" },
  { value: "skill", label: "Competences" },
  { value: "sector", label: "Secteurs" },
  { value: "stage", label: "Stades startup" },
  { value: "company_size", label: "Taille entreprise" },
  { value: "looking_for", label: "Recherches startup" },
  { value: "country", label: "Pays" },
  { value: "role", label: "Roles dev" },
  { value: "seniority", label: "Seniorite" },
  { value: "product_category", label: "Categories produit" },
];

const CATEGORY_COLORS: Record<string, string> = {
  city: "#3b82f6",
  skill: "#8b5cf6",
  sector: "#10b981",
  stage: "#f59e0b",
  company_size: "#ef4444",
  looking_for: "#06b6d4",
  country: "#14b8a6",
  role: "#a855f7",
  seniority: "#f97316",
  product_category: "#ec4899",
};

export function AdminDynamicFieldsTab() {
  const [fields, setFields] = useState<DynamicField[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("city");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Add form state
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newParent, setNewParent] = useState("");
  const [newOrder, setNewOrder] = useState(0);
  const [addLoading, setAddLoading] = useState(false);

  const fetchFields = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dynamic-fields?category=${selectedCategory}`);
      if (!res.ok) throw new Error();
      const data: DynamicField[] = await res.json();
      setFields(data);
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => { fetchFields(); }, [fetchFields]);

  const filtered = fields.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return f.label.toLowerCase().includes(q) || f.value.toLowerCase().includes(q) || (f.parent ?? "").toLowerCase().includes(q);
  });

  // Group by parent
  const grouped: Record<string, DynamicField[]> = {};
  for (const f of filtered) {
    const key = f.parent ?? "Autre";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(f);
  }

  async function handleAdd() {
    if (!newLabel.trim()) {
      toast.error("Le label est requis");
      return;
    }
    setAddLoading(true);
    try {
      const value = newValue.trim() || newLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const res = await fetch("/api/admin/dynamic-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          label: newLabel.trim(),
          value,
          parent: newParent.trim() || null,
          sort_order: newOrder,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur");
      }
      toast.success("Champ ajoute");
      setShowAdd(false);
      setNewLabel("");
      setNewValue("");
      setNewParent("");
      setNewOrder(0);
      fetchFields();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setAddLoading(false);
    }
  }

  async function toggleActive(field: DynamicField) {
    setActionLoading(field.id);
    try {
      const res = await fetch("/api/admin/dynamic-fields", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: field.id, is_active: !field.is_active }),
      });
      if (!res.ok) throw new Error();
      setFields((prev) => prev.map((f) => f.id === field.id ? { ...f, is_active: !f.is_active } : f));
      toast.success(field.is_active ? "Desactive" : "Active");
    } catch {
      toast.error("Erreur");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(field: DynamicField) {
    if (!confirm(`Supprimer "${field.label}" ?`)) return;
    setActionLoading(field.id);
    try {
      const res = await fetch("/api/admin/dynamic-fields", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: field.id }),
      });
      if (!res.ok) throw new Error();
      setFields((prev) => prev.filter((f) => f.id !== field.id));
      toast.success("Supprime");
    } catch {
      toast.error("Erreur");
    } finally {
      setActionLoading(null);
    }
  }

  const catColor = CATEGORY_COLORS[selectedCategory] ?? "#6b7280";
  const catLabel = CATEGORIES.find((c) => c.value === selectedCategory)?.label ?? selectedCategory;
  const activeCount = fields.filter((f) => f.is_active).length;
  const totalCount = fields.length;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Champs Dynamiques</h2>

      <div
        className="rounded-lg px-4 py-3 text-xs"
        style={{ background: "color-mix(in srgb,#3b82f6 10%,transparent)", border: "1px solid color-mix(in srgb,#3b82f6 25%,transparent)", color: "#93c5fd" }}
      >
        Gerez ici les listes de reference (villes, competences, secteurs...) utilisees dans les formulaires d&apos;inscription, les profils et les filtres de recherche.
      </div>

      {/* Category selector + stats */}
      <div className="flex flex-wrap gap-3 items-center">
        <NativeSelect value={selectedCategory} onValueChange={setSelectedCategory} className="w-52">
          {CATEGORIES.map((c) => (
            <NativeSelectOption key={c.value} value={c.value}>{c.label}</NativeSelectOption>
          ))}
        </NativeSelect>

        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>{totalCount} total</span>
          <span style={{ color: "#22c55e" }}>{activeCount} actifs</span>
          <span style={{ color: "#ef4444" }}>{totalCount - activeCount} inactifs</span>
        </div>

        <div className="flex-1" />

        <div className="relative min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-xs"
          />
        </div>

        <Button size="sm" className="gap-1 h-8" style={{ background: "var(--color-orange)" }} onClick={() => setShowAdd(true)}>
          <Plus className="h-3 w-3" /> Ajouter
        </Button>
      </div>

      {/* Fields list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        Object.entries(grouped).map(([parent, items]) => (
          <Card key={parent} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {parent} ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {items.map((field) => (
                      <tr key={field.id} className={`border-b border-border/50 hover:bg-white/2 ${!field.is_active ? "opacity-50" : ""}`}>
                        <td className="p-3 pl-4">
                          <Badge
                            className="text-xs"
                            style={{
                              background: `color-mix(in srgb,${catColor} 15%,transparent)`,
                              color: catColor,
                              border: `1px solid color-mix(in srgb,${catColor} 30%,transparent)`,
                            }}
                          >
                            {field.label}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground font-mono">{field.value}</td>
                        <td className="p-3 text-xs text-muted-foreground">#{field.sort_order}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              disabled={actionLoading === field.id}
                              onClick={() => toggleActive(field)}
                              title={field.is_active ? "Desactiver" : "Activer"}
                            >
                              {actionLoading === field.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : field.is_active ? (
                                <ToggleRight className="h-4 w-4 text-green-400" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-red-400"
                              disabled={actionLoading === field.id}
                              onClick={() => handleDelete(field)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          Aucun champ dans la categorie &ldquo;{catLabel}&rdquo;
        </div>
      )}

      {/* Add sheet */}
      <Sheet open={showAdd} onOpenChange={setShowAdd}>
        <SheetContent style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <SheetHeader>
            <SheetTitle className="text-sm">Ajouter un {catLabel.toLowerCase()}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Label (affiche dans l&apos;UI)</Label>
              <Input
                placeholder="Ex: Cocody, Abidjan"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Valeur (slug, auto-genere si vide)</Label>
              <Input
                placeholder="Ex: abidjan-cocody"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="mt-1 font-mono"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Groupe / Parent (optionnel)</Label>
              <Input
                placeholder="Ex: Abidjan, Frontend, ..."
                value={newParent}
                onChange={(e) => setNewParent(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Ordre de tri</Label>
              <Input
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(Number(e.target.value))}
                className="mt-1 w-24"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" style={{ background: "var(--color-orange)" }} onClick={handleAdd} disabled={addLoading}>
                {addLoading && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                Ajouter
              </Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
