"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  CheckCircle2,
  Github,
  Linkedin,
  Loader2,
  Rocket,
  Smartphone,
  Trash2,
  Twitter,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const SECTORS = [
  { value: "fintech", label: "Fintech" },
  { value: "edtech", label: "Edtech" },
  { value: "healthtech", label: "Healthtech" },
  { value: "agritech", label: "Agritech" },
  { value: "logistics", label: "Logistique" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "saas", label: "SaaS" },
  { value: "ai", label: "IA" },
  { value: "energy", label: "\u00c9nergie" },
  { value: "realestate", label: "Immobilier" },
  { value: "media", label: "M\u00e9dias" },
  { value: "tech", label: "Tech" },
  { value: "other", label: "Autre" },
];

const STAGES = [
  { value: "idea", label: "Id\u00e9e" },
  { value: "preseed", label: "Pr\u00e9-seed" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "S\u00e9rie A" },
  { value: "series_b", label: "S\u00e9rie B+" },
  { value: "profitable", label: "Rentable" },
  { value: "acquired", label: "Acquise" },
];

const LOOKING_FOR_OPTIONS = [
  { value: "cofounders", label: "Cherche des co-fondateurs" },
  { value: "developers", label: "Cherche des d\u00e9veloppeurs" },
  { value: "investors", label: "Cherche des investisseurs" },
  { value: "customers", label: "Cherche des clients / early adopters" },
  { value: "mentors", label: "Cherche des mentors / advisors" },
  { value: "partners", label: "Cherche des partenaires business" },
];

const STATUS_CONFIG = {
  pending: {
    label: "En attente de validation",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  },
  approved: {
    label: "Approuv\u00e9e \u2705",
    color: "text-green-400 border-green-500/30 bg-green-500/10",
  },
  rejected: {
    label: "Rejet\u00e9e",
    color: "text-red-400 border-red-500/30 bg-red-500/10",
  },
  suspended: {
    label: "Suspendue",
    color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  },
};

interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  app_store?: string;
  play_store?: string;
}

interface StartupData {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  sector: string;
  stage: string;
  city: string;
  team_size: number;
  founded_year: number | null;
  tech_stack: string[];
  social_links: SocialLinks;
  problem_statement: string | null;
  looking_for: string[];
  is_hiring: boolean;
  status: "pending" | "approved" | "rejected" | "suspended";
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-orange-400 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function teamSizeFromNumber(n: number): string {
  if (!n || n <= 10) return "1-10";
  if (n <= 50) return "11-50";
  if (n <= 200) return "51-200";
  if (n <= 500) return "201-500";
  return "500+";
}

function teamSizeToNumber(s: string): number {
  const map: Record<string, number> = {
    "1-10": 5,
    "11-50": 30,
    "51-200": 100,
    "201-500": 350,
    "500+": 501,
  };
  return map[s] ?? 1;
}

export function StartupTab() {
  const [startup, setStartup] = useState<StartupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [techInput, setTechInput] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  const emptyForm = {
    name: "",
    slug: "",
    tagline: "",
    description: "",
    problem_statement: "",
    sector: "fintech",
    stage: "idea",
    city: "Abidjan",
    team_size: "1-10",
    founded_year: "",
    tech_stack: [] as string[],
    website_url: "",
    social_links: {
      linkedin: "",
      twitter: "",
      github: "",
      app_store: "",
      play_store: "",
    } as SocialLinks,
    looking_for: [] as string[],
    is_hiring: false,
  };

  const [form, setFormState] = useState(emptyForm);

  useEffect(() => {
    fetch("/api/dashboard/startup")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) {
          setStartup(data);
          setFormState({
            name: data.name ?? "",
            slug: data.slug ?? "",
            tagline: data.tagline ?? "",
            description: data.description ?? "",
            problem_statement: data.problem_statement ?? "",
            sector: data.sector ?? "fintech",
            stage: data.stage ?? "idea",
            city: data.city ?? "Abidjan",
            team_size: teamSizeFromNumber(data.team_size),
            founded_year: data.founded_year ? String(data.founded_year) : "",
            tech_stack: data.tech_stack ?? [],
            website_url: data.website_url ?? "",
            social_links: {
              linkedin: data.social_links?.linkedin ?? "",
              twitter: data.social_links?.twitter ?? "",
              github: data.social_links?.github ?? "",
              app_store: data.social_links?.app_store ?? "",
              play_store: data.social_links?.play_store ?? "",
            },
            looking_for: data.looking_for ?? [],
            is_hiring: data.is_hiring ?? false,
          });
        }
      })
      .catch(() => toast.error("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  function setField(field: string, value: unknown) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  function setSocial(field: keyof SocialLinks, value: string) {
    setFormState((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [field]: value },
    }));
  }

  function toggleLookingFor(value: string) {
    setFormState((prev) => ({
      ...prev,
      looking_for: prev.looking_for.includes(value)
        ? prev.looking_for.filter((v) => v !== value)
        : [...prev.looking_for, value],
    }));
  }

  function addTech(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && techInput.trim()) {
      e.preventDefault();
      const t = techInput.trim().replace(/,/g, "");
      if (t && !form.tech_stack.includes(t))
        setField("tech_stack", [...form.tech_stack, t]);
      setTechInput("");
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await fetch("/api/dashboard/startup/logo", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erreur upload");
      setStartup((prev) =>
        prev ? { ...prev, logo_url: json.logo_url } : prev
      );
      toast.success("Logo mis \u00e0 jour !");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur upload");
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        team_size: teamSizeToNumber(form.team_size),
        founded_year: form.founded_year ? Number(form.founded_year) : null,
        social_links: Object.fromEntries(
          Object.entries(form.social_links).filter(
            ([, v]) => (v as string).trim() !== ""
          )
        ),
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
      toast.success(
        isEdit
          ? "Modifications enregistr\u00e9es !"
          : "Startup soumise \u2014 en attente de validation par l\u2019\u00e9quipe ivoire.io."
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur serveur");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Supprimer votre fiche startup ? Cette action est irr\u00e9versible."
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await fetch("/api/dashboard/startup", { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur suppression");
      setStartup(null);
      setFormState(emptyForm);
      toast.success("Fiche startup supprim\u00e9e.");
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
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Rocket
              className="h-5 w-5"
              style={{ color: "var(--color-orange)" }}
            />
            Ma Startup
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {startup
              ? "G\u00e9rez votre fiche startup sur ivoire.io"
              : "Soumettez votre startup \u2014 elle sera visible apr\u00e8s validation."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {startup && statusCfg && (
            <Badge className={`text-xs border ${statusCfg.color}`}>
              {statusCfg.label}
            </Badge>
          )}
          {startup?.status === "approved" && (
            <a
              href={`https://startups.ivoire.io/${startup.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-orange-400 underline underline-offset-2"
            >
              Voir la fiche \u2192
            </a>
          )}
        </div>
      </div>

      {startup?.status === "pending" && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
          \u23f3 Votre fiche est en cours de validation par l&apos;\u00e9quipe ivoire.io.
        </div>
      )}
      {startup?.status === "rejected" && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          \u274c Votre fiche a \u00e9t\u00e9 rejet\u00e9e. Modifiez-la et soumettez \u00e0 nouveau.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* IDENTIT\u00c9 */}
        <SectionCard title="Identit\u00e9">
          <div className="flex gap-5 items-start">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-24 h-24 rounded-xl border border-border overflow-hidden flex items-center justify-center bg-muted">
                {startup?.logo_url ? (
                  <Image
                    src={startup.logo_url}
                    alt="Logo startup"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Rocket className="h-10 w-10 text-muted-foreground/30" />
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={!startup || logoUploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs w-full"
                disabled={!startup || logoUploading}
                onClick={() => logoInputRef.current?.click()}
                title={
                  !startup
                    ? "Cr\u00e9ez d\u2019abord la fiche pour uploader le logo"
                    : undefined
                }
              >
                {logoUploading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Camera className="h-3 w-3 mr-1" />
                )}
                Changer
              </Button>
            </div>
            <div className="flex-1 space-y-3 min-w-0">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Nom de la startup{" "}
                  <span className="text-orange-400">*</span>
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => {
                    setField("name", e.target.value);
                    if (!startup)
                      setField(
                        "slug",
                        e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "")
                          .slice(0, 30)
                      );
                  }}
                  placeholder="TechCI, WadiPay..."
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tagline">
                  Tagline <span className="text-orange-400">*</span>{" "}
                  <span className="text-xs text-muted-foreground">
                    (max 80 car.)
                  </span>
                </Label>
                <Input
                  id="tagline"
                  value={form.tagline}
                  onChange={(e) => setField("tagline", e.target.value)}
                  placeholder="Le mobile banking simplifi\u00e9 pour la CI"
                  maxLength={80}
                  required
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug" className="flex items-center gap-1.5">
              Slug{" "}
              {startup && (
                <span className="text-xs text-muted-foreground">
                  \ud83d\udd12 d\u00e9finitif
                </span>
              )}
            </Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) =>
                setField(
                  "slug",
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                )
              }
              placeholder="techci"
              disabled={!!startup}
              className={startup ? "opacity-50 cursor-not-allowed" : ""}
            />
            <p className="text-xs text-muted-foreground">
              Votre vitrine :{" "}
              <strong>{form.slug || "votre-slug"}.ivoire.io</strong>
            </p>
          </div>
        </SectionCard>

        {/* INFORMATIONS */}
        <SectionCard title="Informations">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              id="sector"
              label="Secteur d'activit\u00e9 *"
              value={form.sector}
              onChange={(v) => setField("sector", v)}
              options={SECTORS}
            />
            <SelectField
              id="stage"
              label="Stade *"
              value={form.stage}
              onChange={(v) => setField("stage", v)}
              options={STAGES}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                placeholder="Abidjan"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="founded_year">Ann\u00e9e de cr\u00e9ation</Label>
              <Input
                id="founded_year"
                type="number"
                min={2000}
                max={2030}
                value={form.founded_year}
                onChange={(e) => setField("founded_year", e.target.value)}
                placeholder="2024"
              />
            </div>
            <SelectField
              id="team_size"
              label="Nombre d'employ\u00e9s"
              value={form.team_size}
              onChange={(v) => setField("team_size", v)}
              options={[
                { value: "1-10", label: "1 \u2013 10" },
                { value: "11-50", label: "11 \u2013 50" },
                { value: "51-200", label: "51 \u2013 200" },
                { value: "201-500", label: "201 \u2013 500" },
                { value: "500+", label: "500 +" },
              ]}
            />
          </div>
        </SectionCard>

        {/* DESCRIPTION */}
        <SectionCard title="Description">
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description longue{" "}
              <span className="text-xs text-muted-foreground">
                ({form.description.length} / 1000 caract\u00e8res)
              </span>
            </Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="D\u00e9crivez votre startup, votre mission, vos traction..."
              rows={5}
              maxLength={1000}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="problem_statement">
              Probl\u00e8me r\u00e9solu{" "}
              <span className="text-xs text-muted-foreground">
                (en 1 phrase)
              </span>
            </Label>
            <Input
              id="problem_statement"
              value={form.problem_statement}
              onChange={(e) => setField("problem_statement", e.target.value)}
              placeholder="Les PME ivoiriennes n'ont pas acc\u00e8s aux paiements en ligne..."
            />
          </div>
        </SectionCard>

        {/* STACK TECHNIQUE */}
        <SectionCard title="Stack technique">
          <div className="flex flex-wrap gap-2 min-h-[28px]">
            {form.tech_stack.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-border bg-background"
              >
                {t}
                <button
                  type="button"
                  onClick={() =>
                    setField(
                      "tech_stack",
                      form.tech_stack.filter((x) => x !== t)
                    )
                  }
                  className="text-muted-foreground hover:text-foreground ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <Input
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={addTech}
            placeholder="Flutter, Firebase, Node.js... (Entr\u00e9e ou virgule pour ajouter)"
          />
        </SectionCard>

        {/* LIENS */}
        <SectionCard title="Liens">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base w-5 text-center">\ud83c\udf10</span>
              <Input
                type="url"
                value={form.website_url}
                onChange={(e) => setField("website_url", e.target.value)}
                placeholder="https://techci.ci"
              />
            </div>
            <div className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-blue-400 shrink-0" />
              <Input
                type="url"
                value={form.social_links.linkedin ?? ""}
                onChange={(e) => setSocial("linkedin", e.target.value)}
                placeholder="https://linkedin.com/company/techci"
              />
            </div>
            <div className="flex items-center gap-2">
              <Twitter className="h-4 w-4 text-sky-400 shrink-0" />
              <Input
                type="url"
                value={form.social_links.twitter ?? ""}
                onChange={(e) => setSocial("twitter", e.target.value)}
                placeholder="https://x.com/techci"
              />
            </div>
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 shrink-0" />
              <Input
                type="url"
                value={form.social_links.github ?? ""}
                onChange={(e) => setSocial("github", e.target.value)}
                placeholder="https://github.com/techci"
              />
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-gray-400 shrink-0" />
              <Input
                type="url"
                value={form.social_links.app_store ?? ""}
                onChange={(e) => setSocial("app_store", e.target.value)}
                placeholder="App Store \u2014 https://apps.apple.com/..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-green-400 shrink-0" />
              <Input
                type="url"
                value={form.social_links.play_store ?? ""}
                onChange={(e) => setSocial("play_store", e.target.value)}
                placeholder="Play Store \u2014 https://play.google.com/..."
              />
            </div>
          </div>
        </SectionCard>

        {/* RECHERCHE EN COURS */}
        <SectionCard title="Recherche en cours">
          <p className="text-sm text-muted-foreground -mt-1">
            De quoi avez-vous besoin actuellement ?
          </p>
          <div className="space-y-3">
            {LOOKING_FOR_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => toggleLookingFor(opt.value)}
              >
                <div
                  className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                    form.looking_for.includes(opt.value)
                      ? "border-orange-400 bg-orange-500"
                      : "border-border bg-background"
                  }`}
                >
                  {form.looking_for.includes(opt.value) && (
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </SectionCard>

        {/* ACTIONS */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="submit"
            disabled={saving}
            style={{ background: "var(--color-orange)", color: "white" }}
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {startup ? "\ud83d\udcbe Enregistrer les modifications" : "\ud83d\ude80 Soumettre ma startup"}
          </Button>
          {startup && (
            <Button
              type="button"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Supprimer la fiche
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
