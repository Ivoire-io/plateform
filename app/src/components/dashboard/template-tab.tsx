"use client";

import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types";
import { Check, ExternalLink, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string;
  plan: "free" | "premium";
  colors: string[];
}

const FREE_TEMPLATES: Template[] = [
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    description: "Épuré, sombre et professionnel",
    plan: "free",
    colors: ["#0f0f0f", "#1a1a1a", "#ff6b35"],
  },
  {
    id: "classic-light",
    name: "Classic Light",
    description: "Classique, clair et lisible",
    plan: "free",
    colors: ["#ffffff", "#f5f5f5", "#2563eb"],
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Style terminal pour les devs",
    plan: "free",
    colors: ["#0d1117", "#161b22", "#39d353"],
  },
];

const PREMIUM_TEMPLATES: Template[] = [
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    description: "Effets de verre modernes",
    plan: "premium",
    colors: ["#6366f1", "#8b5cf6", "rgba(255,255,255,0.15)"],
  },
  {
    id: "bento-grid",
    name: "Bento Grid",
    description: "Disposition en grille bento",
    plan: "premium",
    colors: ["#18181b", "#27272a", "#f59e0b"],
  },
  {
    id: "gradient",
    name: "Gradient",
    description: "Dégradés colorés dynamiques",
    plan: "premium",
    colors: ["#7c3aed", "#2563eb", "#06b6d4"],
  },
  {
    id: "spotlight",
    name: "Spotlight",
    description: "Effet spotlight cinématique",
    plan: "premium",
    colors: ["#09090b", "#1c1c1e", "#e2e8f0"],
  },
  {
    id: "neon-cyber",
    name: "Neon Cyber",
    description: "Cyberpunk néon futuriste",
    plan: "premium",
    colors: ["#0a0a0f", "#0f1117", "#00ffff"],
  },
  {
    id: "brutalist",
    name: "Brutalist",
    description: "Design brut et impactant",
    plan: "premium",
    colors: ["#ffffff", "#f0f0f0", "#000000"],
  },
  {
    id: "ivoirien",
    name: "Ivoirien 🇨🇮",
    description: "Inspiré des couleurs de Côte d'Ivoire",
    plan: "premium",
    colors: ["#f77f00", "#009a44", "#ffffff"],
  },
];

function TemplatePreview({ template, active }: { template: Template; active: boolean }) {
  return (
    <div
      className="rounded-lg overflow-hidden border-2 transition-all"
      style={{
        borderColor: active
          ? "var(--color-orange)"
          : "var(--color-border)",
        background: template.colors[0],
      }}
    >
      {/* Mock preview */}
      <div
        className="h-24 relative flex flex-col gap-1.5 p-3"
        style={{ background: template.colors[0] }}
      >
        {/* Header bar */}
        <div
          className="w-16 h-2 rounded-full"
          style={{ background: template.colors[2], opacity: 0.9 }}
        />
        {/* Avatar mock */}
        <div className="flex items-center gap-1.5 mt-1">
          <div
            className="w-5 h-5 rounded-full shrink-0"
            style={{ background: template.colors[1] }}
          />
          <div className="flex flex-col gap-0.5">
            <div
              className="w-10 h-1 rounded-full"
              style={{ background: template.colors[2], opacity: 0.8 }}
            />
            <div
              className="w-7 h-1 rounded-full"
              style={{ background: template.colors[2], opacity: 0.4 }}
            />
          </div>
        </div>
        {/* Content bars */}
        <div className="flex flex-col gap-0.5 mt-auto">
          <div
            className="w-full h-1 rounded-full"
            style={{ background: template.colors[2], opacity: 0.25 }}
          />
          <div
            className="w-4/5 h-1 rounded-full"
            style={{ background: template.colors[2], opacity: 0.15 }}
          />
        </div>
        {/* Active indicator */}
        {active && (
          <div
            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: "var(--color-orange)" }}
          >
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
        {/* Color dots */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {template.colors.map((c, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full border border-white/20"
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TemplateTabProps {
  profile: Profile;
}

export function TemplateTab({ profile }: TemplateTabProps) {
  const [activeTemplate, setActiveTemplate] = useState<string>(
    (profile as Profile & { template_id?: string }).template_id ?? "minimal-dark"
  );
  const [saving, setSaving] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<string | null>(null);
  const isPremium = profile.plan !== "free";

  async function applyTemplate(templateId: string, plan: "free" | "premium") {
    if (plan === "premium" && !isPremium) return;
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: templateId }),
      });
      if (!res.ok) throw new Error();
      setActiveTemplate(templateId);
      setPendingTemplate(null);
      toast.success("Template appliqué !");
    } catch {
      toast.error("Erreur lors du changement de template");
    } finally {
      setSaving(false);
    }
  }

  const previewTemplate = pendingTemplate ?? activeTemplate;
  const allTemplates = [...FREE_TEMPLATES, ...PREMIUM_TEMPLATES];
  const previewTpl = allTemplates.find((t) => t.id === previewTemplate) ?? FREE_TEMPLATES[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Template</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Actuel :{" "}
            <span className="font-medium" style={{ color: "var(--color-orange)" }}>
              {allTemplates.find((t) => t.id === activeTemplate)?.name ?? "Minimal Dark"}
            </span>
          </p>
        </div>
        <a
          href={`https://${profile.slug}.ivoire.io`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm"
          style={{ color: "var(--color-orange)" }}
        >
          <ExternalLink className="w-4 h-4" />
          Aperçu en direct
        </a>
      </div>

      <p className="text-sm text-muted-foreground">
        Choisis le design de ta page portfolio publique. Les modifications sont appliquées immédiatement.
      </p>

      {/* Free templates */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Templates gratuits</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {FREE_TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="flex flex-col gap-2">
              <div
                className="cursor-pointer"
                onClick={() => setPendingTemplate(tpl.id === pendingTemplate ? null : tpl.id)}
              >
                <TemplatePreview
                  template={tpl}
                  active={activeTemplate === tpl.id}
                />
              </div>
              <div>
                <p className="text-sm font-medium">{tpl.name}</p>
                <p className="text-xs text-muted-foreground">{tpl.description}</p>
              </div>
              {activeTemplate === tpl.id ? (
                <Button size="sm" variant="outline" disabled className="text-xs">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Actuel
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  disabled={saving}
                  onClick={() => applyTemplate(tpl.id, "free")}
                >
                  Activer
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Premium templates */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          Templates Premium ⭐
          {!isPremium && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {PREMIUM_TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="flex flex-col gap-2">
              <div
                className={`relative ${!isPremium ? "opacity-60" : "cursor-pointer"}`}
                onClick={() =>
                  isPremium && setPendingTemplate(tpl.id === pendingTemplate ? null : tpl.id)
                }
              >
                <TemplatePreview
                  template={tpl}
                  active={activeTemplate === tpl.id}
                />
                {!isPremium && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{tpl.name}</p>
                <p className="text-xs text-muted-foreground">{tpl.description}</p>
              </div>
              {isPremium ? (
                activeTemplate === tpl.id ? (
                  <Button size="sm" variant="outline" disabled className="text-xs">
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Actuel
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={saving}
                    onClick={() => applyTemplate(tpl.id, "premium")}
                  >
                    Activer
                  </Button>
                )
              ) : (
                <Button size="sm" variant="outline" disabled className="text-xs opacity-60">
                  🔒 Premium
                </Button>
              )}
            </div>
          ))}
        </div>

        {!isPremium && (
          <div
            className="mt-6 rounded-xl p-6 flex flex-col items-center gap-4 text-center border-2"
            style={{
              borderColor: "color-mix(in srgb, var(--color-orange) 40%, transparent)",
              background: "color-mix(in srgb, var(--color-orange) 5%, transparent)",
            }}
          >
            <p className="font-semibold">
              ⭐ Débloquer tous les templates
            </p>
            <p className="text-sm text-muted-foreground">
              Accède aux 7 templates premium et personnalise ton portfolio à 100%.
            </p>
            <Button style={{ background: "var(--color-orange)", color: "#fff" }}>
              Voir les plans disponibles
            </Button>
          </div>
        )}
      </div>

      {/* Live preview section */}
      {pendingTemplate && pendingTemplate !== activeTemplate && (
        <div
          className="rounded-xl border p-4 flex flex-col gap-3"
          style={{ borderColor: "color-mix(in srgb, var(--color-orange) 40%, transparent)" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">
              Aperçu sélectionné :{" "}
              <span style={{ color: "var(--color-orange)" }}>
                {allTemplates.find((t) => t.id === pendingTemplate)?.name}
              </span>
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPendingTemplate(null)}>
                Annuler
              </Button>
              <Button
                size="sm"
                disabled={saving}
                style={{ background: "var(--color-orange)", color: "#fff" }}
                onClick={() => {
                  const tpl = allTemplates.find((t) => t.id === pendingTemplate);
                  if (tpl) applyTemplate(tpl.id, tpl.plan);
                }}
              >
                {saving ? "Application..." : "✅ Appliquer"}
              </Button>
            </div>
          </div>
          <div
            className="rounded-lg overflow-hidden h-10 flex items-center px-3 gap-2 text-xs"
            style={{
              background: previewTpl.colors[0],
              color: previewTpl.colors[2],
            }}
          >
            <span style={{ opacity: 0.6 }}>🔴🟡🟢</span>
            <span style={{ opacity: 0.8 }}>{profile.slug}.ivoire.io</span>
          </div>
        </div>
      )}
    </div>
  );
}
