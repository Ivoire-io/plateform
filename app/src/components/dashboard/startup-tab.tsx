"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Clock, Loader2, Rocket, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface StartupData {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string | null;
  website_url: string | null;
  sector: string;
  stage: string;
  city: string;
  team_size: number;
  founded_year: number | null;
  tech_stack: string[];
  is_hiring: boolean;
  status: "pending" | "approved" | "rejected" | "suspended";
  upvotes_count: number;
}

const SECTORS = ["tech", "fintech", "agritech", "healthtech", "edtech", "ecommerce", "logistics", "media", "energy", "other"];
const STAGES = ["idea", "mvp", "seed", "series_a", "growth", "profitable"];

const SECTOR_LABELS: Record<string, string> = {
  tech: "Tech", fintech: "Fintech", agritech: "Agritech", healthtech: "Healthtech",
  edtech: "Edtech", ecommerce: "E-commerce", logistics: "Logistique",
  media: "Médias", energy: "Énergie", other: "Autre"
};
const STAGE_LABELS: Record<string, string> = {
  idea: "Idée", mvp: "MVP", seed: "Seed", series_a: "Série A", growth: "Croissance", profitable: "Profitable"
};

const STATUS_CONFIG = {
  pending: { label: "En attente de validation", icon: Clock, color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
  approved: { label: "Approuvée ✅", icon: CheckCircle2, color: "text-green-400 border-green-500/30 bg-green-500/10" },
  rejected: { label: "Rejetée", icon: X, color: "text-red-400 border-red-500/30 bg-red-500/10" },
  suspended: { label: "Suspendue", icon: X, color: "text-orange-400 border-orange-500/30 bg-orange-500/10" },
};

export function StartupTab() {
  const [startup, setStartup] = useState<StartupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [techInput, setTechInput] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    website_url: "",
    sector: "tech",
    stage: "idea",
    city: "Abidjan",
    team_size: 1,
    founded_year: "",
    tech_stack: [] as string[],
    is_hiring: false,
  });

  useEffect(() => {
    fetch("/api/dashboard/startup")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) {
          setStartup(data);
          setForm({
            name: data.name ?? "",
            slug: data.slug ?? "",
            tagline: data.tagline ?? "",
            description: data.description ?? "",
            website_url: data.website_url ?? "",
            sector: data.sector ?? "tech",
            stage: data.stage ?? "idea",
            city: data.city ?? "Abidjan",
            team_size: data.team_size ?? 1,
            founded_year: data.founded_year ? String(data.founded_year) : "",
            tech_stack: data.tech_stack ?? [],
            is_hiring: data.is_hiring ?? false,
          });
        }
      })
      .catch(() => toast.error("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 30);
  }

  function addTech(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && techInput.trim()) {
      e.preventDefault();
      const t = techInput.trim().replace(/,/g, "");
      if (t && !form.tech_stack.includes(t)) {
        set("tech_stack", [...form.tech_stack, t]);
      }
      setTechInput("");
    }
  }

  function removeTech(t: string) {
    set("tech_stack", form.tech_stack.filter((x) => x !== t));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        founded_year: form.founded_year ? Number(form.founded_year) : null,
        team_size: Number(form.team_size),
      };

      const isEdit = !!startup;
      const res = await fetch("/api/dashboard/startup", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erreur serveur");

      setStartup(json.data);
      toast.success(isEdit ? "Fiche startup mise à jour !" : "Fiche startup soumise — en attente de validation.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur serveur");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer votre fiche startup ? Cette action est irréversible.")) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/dashboard/startup", { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur suppression");
      setStartup(null);
      setForm({ name: "", slug: "", tagline: "", description: "", website_url: "", sector: "tech", stage: "idea", city: "Abidjan", team_size: 1, founded_year: "", tech_stack: [], is_hiring: false });
      toast.success("Fiche startup supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  const statusCfg = startup ? STATUS_CONFIG[startup.status] : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Rocket className="h-5 w-5" style={{ color: "var(--color-orange)" }} />
            Ma Startup
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {startup ? "Gérez votre fiche startup sur ivoire.io" : "Soumettez votre startup — elle sera visible après validation."}
          </p>
        </div>
        {startup && (
          <Badge className={`text-xs border ${statusCfg?.color}`}>
            {statusCfg?.label}
          </Badge>
        )}
      </div>

      {startup?.status === "rejected" && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Votre fiche a été rejetée. Modifiez-la et soumettez à nouveau.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Informations principales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nom de la startup *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => {
                    set("name", e.target.value);
                    if (!startup) set("slug", autoSlug(e.target.value));
                  }}
                  placeholder="LeBontoit, WadiPay..."
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="lebontoit"
                  disabled={!!startup}
                  className={startup ? "opacity-50" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  startups.ivoire.io/<strong>{form.slug || "votre-slug"}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tagline">Tagline *</Label>
              <Input
                id="tagline"
                value={form.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                placeholder="La location immobilière simplifiée en Côte d'Ivoire"
                maxLength={120}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Décrivez votre startup, votre mission, vos traction..."
                rows={4}
                maxLength={1000}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website_url">Site web</Label>
              <Input
                id="website_url"
                type="url"
                value={form.website_url}
                onChange={(e) => set("website_url", e.target.value)}
                placeholder="https://lebontoit.ci"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Détails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sector">Secteur</Label>
                <select
                  id="sector"
                  value={form.sector}
                  onChange={(e) => set("sector", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-orange-400 focus:outline-none"
                >
                  {SECTORS.map((s) => <option key={s} value={s}>{SECTOR_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="stage">Étape</Label>
                <select
                  id="stage"
                  value={form.stage}
                  onChange={(e) => set("stage", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-orange-400 focus:outline-none"
                >
                  {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Abidjan" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="team_size">Taille équipe</Label>
                <Input id="team_size" type="number" min={1} max={9999} value={form.team_size} onChange={(e) => set("team_size", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="founded_year">Année fondation</Label>
                <Input id="founded_year" type="number" min={2000} max={2030} value={form.founded_year} onChange={(e) => set("founded_year", e.target.value)} placeholder="2024" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Stack technique</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.tech_stack.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-border bg-surface">
                    {t}
                    <button type="button" onClick={() => removeTech(t)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={addTech}
                placeholder="React, Node.js, Flutter... (Entrée pour ajouter)"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={form.is_hiring}
                onClick={() => set("is_hiring", !form.is_hiring)}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${form.is_hiring ? "bg-orange-500" : "bg-muted"}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${form.is_hiring ? "translate-x-4" : "translate-x-0"}`} />
              </button>
              <Label className="cursor-pointer" onClick={() => set("is_hiring", !form.is_hiring)}>
                On recrute 🚀
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-4">
          <Button type="submit" disabled={saving} style={{ background: "var(--color-orange)", color: "white" }}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {startup ? "Enregistrer les modifications" : "Soumettre ma startup"}
          </Button>

          {startup && (
            <Button
              type="button"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Supprimer la fiche
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
