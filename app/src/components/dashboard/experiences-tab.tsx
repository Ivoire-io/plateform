"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Experience } from "@/lib/types";
import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ExperiencesTabProps {
  profileId: string;
  initialExperiences: Experience[];
}

type ExpForm = {
  role: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
};

const emptyForm: ExpForm = {
  role: "", company: "", start_date: "", end_date: "", description: "",
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("fr-CI", {
    month: "short",
    year: "numeric",
  });
}

export function ExperiencesTab({ initialExperiences }: ExperiencesTabProps) {
  const [experiences, setExperiences] = useState(initialExperiences);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setSheetOpen(true);
  }

  function openEdit(exp: Experience) {
    setEditingId(exp.id);
    setForm({
      role: exp.role,
      company: exp.company,
      start_date: exp.start_date.slice(0, 10),
      end_date: exp.end_date ? exp.end_date.slice(0, 10) : "",
      description: exp.description ?? "",
    });
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.role.trim() || !form.company.trim() || !form.start_date) {
      toast.error("Poste, entreprise et date de début sont requis.");
      return;
    }
    setSaving(true);
    const body = {
      role: form.role.trim(),
      company: form.company.trim(),
      start_date: form.start_date,
      end_date: form.end_date || null,
      description: form.description.trim() || null,
      sort_order: editingId ? undefined : experiences.length,
    };

    const url = editingId ? `/api/dashboard/experiences/${editingId}` : "/api/dashboard/experiences";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    setSaving(false);

    if (!json.success) {
      toast.error(json.error ?? "Erreur lors de la sauvegarde.");
      return;
    }

    if (editingId) {
      setExperiences((prev) => prev.map((e) => (e.id === editingId ? json.data : e)));
      toast.success("Expérience mise à jour !");
    } else {
      setExperiences((prev) => [json.data, ...prev]);
      toast.success("Expérience ajoutée !");
    }
    closeSheet();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette expérience définitivement ?")) return;
    setDeletingId(id);
    const toastId = toast.loading("Suppression…");
    const res = await fetch(`/api/dashboard/experiences/${id}`, { method: "DELETE" });
    const json = await res.json();
    setDeletingId(null);
    if (json.success) {
      setExperiences((prev) => prev.filter((e) => e.id !== id));
      toast.success("Expérience supprimée.", { id: toastId });
    } else {
      toast.error(json.error ?? "Erreur.", { id: toastId });
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Expériences</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {experiences.length} expérience{experiences.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={openCreate}
          size="sm"
          className="gap-2 text-white"
          style={{ background: "var(--color-orange)" }}
        >
          <Plus size={14} /> Nouvelle expérience
        </Button>
      </div>

      {/* État vide */}
      {experiences.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground mb-4">Aucune expérience ajoutée.</p>
          <Button
            onClick={openCreate}
            size="sm"
            className="gap-2 text-white"
            style={{ background: "var(--color-orange)" }}
          >
            <Plus size={14} /> Ajouter une expérience
          </Button>
        </div>
      )}

      {/* Timeline */}
      {experiences.length > 0 && (
        <ol className="relative border-l border-border/50 ml-3 space-y-4">
          {experiences.map((exp, index) => {
            const isCurrent = index === 0 && !exp.end_date;
            return (
              <li key={exp.id} className="pl-8 relative group/exp">
                {/* Dot */}
                <span
                  className="absolute -left-[9px] top-3 flex size-[18px] items-center justify-center rounded-full border-2 bg-background"
                  style={{ borderColor: "color-mix(in srgb, var(--color-orange) 50%, transparent)" }}
                  aria-hidden
                >
                  {isCurrent && (
                    <span className="size-2 rounded-full animate-pulse" style={{ background: "var(--color-orange)" }} />
                  )}
                </span>

                <Card size="sm" className="group/card">
                  <CardContent className="flex items-start justify-between gap-2 pt-3 pb-3">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{exp.role}</span>
                        {isCurrent && (
                          <Badge
                            variant="secondary"
                            className="text-xs py-0"
                            style={{ color: "var(--color-green)", borderColor: "color-mix(in srgb, var(--color-green) 30%, transparent)", background: "color-mix(in srgb, var(--color-green) 10%, transparent)" }}
                          >
                            En poste
                          </Badge>
                        )}
                      </div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-orange)" }}
                      >
                        {exp.company}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(exp.start_date)} — {exp.end_date ? formatDate(exp.end_date) : "Présent"}
                      </span>
                      {exp.description && (
                        <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{exp.description}</p>
                      )}
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover/exp:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(exp)}
                        aria-label="Modifier"
                      >
                        <Edit2 />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(exp.id)}
                        disabled={deletingId === exp.id}
                        className="hover:text-destructive"
                        aria-label="Supprimer"
                      >
                        {deletingId === exp.id
                          ? <Loader2 className="animate-spin" />
                          : <Trash2 />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      )}

      {/* ─── Sheet : formulaire ─── */}
      <Sheet open={sheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Modifier l'expérience" : "Nouvelle expérience"}</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>
                  Poste <span style={{ color: "var(--color-orange)" }}>*</span>
                </Label>
                <Input
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  placeholder="Lead Developer"
                  maxLength={100}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>
                  Entreprise <span style={{ color: "var(--color-orange)" }}>*</span>
                </Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  placeholder="Startup XY"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>
                  Date de début <span style={{ color: "var(--color-orange)" }}>*</span>
                </Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Date de fin <span className="text-muted-foreground font-normal">(vide = Présent)</span></Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brève description du rôle…"
                rows={3}
                maxLength={500}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60 transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="gap-2 text-white"
                style={{ background: "var(--color-orange)" }}
              >
                {saving
                  ? <><Loader2 size={13} className="animate-spin" /> Sauvegarde…</>
                  : (editingId ? "Enregistrer" : "Ajouter")}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={closeSheet}>
                Annuler
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

