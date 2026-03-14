"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Project } from "@/lib/types";
import { Edit2, Github, Globe, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProjectsTabProps {
  profileId: string;
  initialProjects: Project[];
}

type ProjectForm = {
  name: string;
  description: string;
  github_url: string;
  demo_url: string;
  tech_stack: string;
  image_url: string;
};

const emptyForm: ProjectForm = {
  name: "", description: "", github_url: "", demo_url: "", tech_stack: "", image_url: "",
};

export function ProjectsTab({ initialProjects }: ProjectsTabProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setSheetOpen(true);
  }

  function openEdit(project: Project) {
    setEditingId(project.id);
    setForm({
      name: project.name,
      description: project.description ?? "",
      github_url: project.github_url ?? "",
      demo_url: project.demo_url ?? "",
      tech_stack: project.tech_stack.join(", "),
      image_url: project.image_url ?? "",
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
    if (!form.name.trim()) {
      toast.error("Le nom du projet est requis.");
      return;
    }
    setSaving(true);
    const techStack = form.tech_stack.split(",").map((t) => t.trim()).filter(Boolean);
    const body = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      github_url: form.github_url.trim() || null,
      demo_url: form.demo_url.trim() || null,
      tech_stack: techStack,
      image_url: form.image_url.trim() || null,
      sort_order: editingId ? undefined : projects.length,
    };

    const url = editingId ? `/api/dashboard/projects/${editingId}` : "/api/dashboard/projects";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    setSaving(false);

    if (!json.success) {
      toast.error(json.error ?? "Erreur lors de la sauvegarde.");
      return;
    }

    if (editingId) {
      setProjects((prev) => prev.map((p) => (p.id === editingId ? json.data : p)));
      toast.success("Projet mis à jour !");
    } else {
      setProjects((prev) => [...prev, json.data]);
      toast.success("Projet créé !");
    }
    closeSheet();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce projet définitivement ?")) return;
    setDeletingId(id);
    const toastId = toast.loading("Suppression…");
    const res = await fetch(`/api/dashboard/projects/${id}`, { method: "DELETE" });
    const json = await res.json();
    setDeletingId(null);
    if (json.success) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Projet supprimé.", { id: toastId });
    } else {
      toast.error(json.error ?? "Erreur.", { id: toastId });
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Projets</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {projects.length} projet{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={openCreate}
          size="sm"
          className="gap-2 text-white"
          style={{ background: "var(--color-orange)" }}
        >
          <Plus size={14} /> Nouveau projet
        </Button>
      </div>

      {/* Liste vide */}
      {projects.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground mb-4">Vous n&apos;avez pas encore de projets.</p>
          <Button
            onClick={openCreate}
            size="sm"
            className="gap-2 text-white"
            style={{ background: "var(--color-orange)" }}
          >
            <Plus size={14} /> Ajouter votre premier projet
          </Button>
        </div>
      )}

      {/* Grille de projets */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Card key={project.id} size="sm" className="group/card">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(project)}
                      aria-label="Modifier"
                    >
                      <Edit2 />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      className="hover:text-destructive"
                      aria-label="Supprimer"
                    >
                      {deletingId === project.id
                        ? <Loader2 className="animate-spin" />
                        : <Trash2 />}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                {project.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                )}
                {project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech_stack.map((t) => (
                      <Badge key={t} variant="secondary" className="font-mono text-xs py-0">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>

              {(project.github_url || project.demo_url) && (
                <CardFooter className="flex items-center gap-4">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github size={12} /> Code
                    </a>
                  )}
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      style={{ ["--hover-color" as string]: "var(--color-orange)" }}
                    >
                      <Globe size={12} /> Démo
                    </a>
                  )}
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ─── Sheet : formulaire ─── */}
      <Sheet open={sheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? "Modifier le projet" : "Nouveau projet"}</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-name">
                  Nom <span style={{ color: "var(--color-orange)" }}>*</span>
                </Label>
                <Input
                  id="project-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="MonApp"
                  maxLength={100}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Technologies <span className="text-muted-foreground font-normal">(séparées par des virgules)</span></Label>
                <Input
                  value={form.tech_stack}
                  onChange={(e) => setForm((f) => ({ ...f, tech_stack: e.target.value }))}
                  placeholder="Flutter, Dart, Firebase"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description courte du projet…"
                rows={3}
                maxLength={500}
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60 transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Lien GitHub</Label>
                <Input
                  value={form.github_url}
                  onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))}
                  placeholder="https://github.com/…"
                  type="url"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Démo / Site</Label>
                <Input
                  value={form.demo_url}
                  onChange={(e) => setForm((f) => ({ ...f, demo_url: e.target.value }))}
                  placeholder="https://…"
                  type="url"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>URL Image / Screenshot</Label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                placeholder="https://…/screenshot.png"
                type="url"
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
                  : (editingId ? "Enregistrer" : "Créer le projet")}
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

