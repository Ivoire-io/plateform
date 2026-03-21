"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Image, Loader2, Save, Search, TestTube, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Types ───
interface ProviderSection {
  provider: string;
  model: string;
  fallback: string | null;
  budget_max_usd?: number;
  max_searches_per_day?: number;
}

interface AIConfig {
  text_short: ProviderSection;
  text_long: ProviderSection;
  image: ProviderSection;
  web_search: ProviderSection;
}

// ─── Provider / model options ───
const PROVIDER_OPTIONS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "crunai", label: "crun.ai" },
  { value: "none", label: "Aucun" },
];

const MODELS_BY_PROVIDER: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4o-mini", label: "gpt-4o-mini" },
    { value: "gpt-4o", label: "gpt-4o" },
    { value: "gpt-5-4-mini", label: "gpt-5-4-mini" },
  ],
  anthropic: [
    { value: "claude-sonnet-4-6", label: "claude-sonnet-4-6" },
    { value: "claude-haiku-4-5", label: "claude-haiku-4-5" },
  ],
  crunai: [
    { value: "nanobanana-pro", label: "nanobanana-pro" },
  ],
  none: [],
};

const FALLBACK_OPTIONS = [
  { value: "", label: "Aucun" },
  { value: "gpt-4o-mini", label: "gpt-4o-mini (OpenAI)" },
  { value: "gpt-4o", label: "gpt-4o (OpenAI)" },
  { value: "claude-sonnet-4-6", label: "claude-sonnet-4-6 (Anthropic)" },
  { value: "claude-haiku-4-5", label: "claude-haiku-4-5 (Anthropic)" },
  { value: "nanobanana-pro", label: "nanobanana-pro (crun.ai)" },
];

// ─── Select helper ───
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

// ─── Section card ───
function ProviderCard({
  title,
  icon: Icon,
  section,
  sectionKey,
  onUpdate,
  isBudget,
}: {
  title: string;
  icon: React.ElementType;
  section: ProviderSection;
  sectionKey: string;
  onUpdate: (key: string, field: string, value: string | number | null) => void;
  isBudget: boolean;
}) {
  const [testing, setTesting] = useState(false);

  async function handleTestKey() {
    setTesting(true);
    // Simulated test -- in production this would call a real test endpoint
    await new Promise((r) => setTimeout(r, 1200));
    setTesting(false);
    toast.success(`Connexion ${section.provider} OK (test simulé)`);
  }

  const modelOptions = MODELS_BY_PROVIDER[section.provider] ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5" style={{ color: "var(--color-orange)" }} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            id={`${sectionKey}-provider`}
            label="Provider actif"
            value={section.provider}
            onChange={(v) => {
              onUpdate(sectionKey, "provider", v);
              // Auto-select first model for that provider
              const models = MODELS_BY_PROVIDER[v];
              if (models && models.length > 0) {
                onUpdate(sectionKey, "model", models[0].value);
              }
            }}
            options={PROVIDER_OPTIONS}
          />

          {modelOptions.length > 0 ? (
            <SelectField
              id={`${sectionKey}-model`}
              label="Modèle"
              value={section.model}
              onChange={(v) => onUpdate(sectionKey, "model", v)}
              options={modelOptions}
            />
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor={`${sectionKey}-model`}>Modèle</Label>
              <Input
                id={`${sectionKey}-model`}
                value={section.model}
                onChange={(e) => onUpdate(sectionKey, "model", e.target.value)}
                placeholder="Nom du modèle"
              />
            </div>
          )}

          <SelectField
            id={`${sectionKey}-fallback`}
            label="Fallback"
            value={section.fallback ?? ""}
            onChange={(v) => onUpdate(sectionKey, "fallback", v || null)}
            options={FALLBACK_OPTIONS}
          />

          {isBudget && section.budget_max_usd !== undefined && (
            <div className="space-y-1.5">
              <Label htmlFor={`${sectionKey}-budget`}>Budget max/mois (USD)</Label>
              <Input
                id={`${sectionKey}-budget`}
                type="number"
                min={0}
                value={section.budget_max_usd}
                onChange={(e) =>
                  onUpdate(sectionKey, "budget_max_usd", Number(e.target.value))
                }
              />
            </div>
          )}

          {section.max_searches_per_day !== undefined && (
            <div className="space-y-1.5">
              <Label htmlFor={`${sectionKey}-searches`}>Max recherches/jour</Label>
              <Input
                id={`${sectionKey}-searches`}
                type="number"
                min={0}
                value={section.max_searches_per_day}
                onChange={(e) =>
                  onUpdate(sectionKey, "max_searches_per_day", Number(e.target.value))
                }
              />
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleTestKey}
          disabled={testing || section.provider === "none"}
          className="mt-2"
        >
          {testing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <TestTube className="h-4 w-4 mr-2" />
          )}
          Tester la clé API
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───
export function AIProvidersTab() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai-providers");
      if (!res.ok) throw new Error("Erreur chargement config");
      const data = await res.json();
      setConfig(data);
    } catch {
      toast.error("Impossible de charger la configuration IA.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  function handleUpdate(sectionKey: string, field: string, value: string | number | null) {
    if (!config) return;
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey as keyof AIConfig],
          [field]: value,
        },
      };
    });
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ai-providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur sauvegarde");
      }
      toast.success("Configuration IA sauvegardée.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Impossible de charger la configuration.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Fournisseurs IA</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configurez les modèles, fallbacks et budgets pour chaque type de tâche IA.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          style={{ background: "var(--color-orange)", color: "#fff" }}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Sauvegarder
        </Button>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProviderCard
          title="Texte court"
          icon={Zap}
          section={config.text_short}
          sectionKey="text_short"
          onUpdate={handleUpdate}
          isBudget
        />
        <ProviderCard
          title="Texte long / Documents"
          icon={FileText}
          section={config.text_long}
          sectionKey="text_long"
          onUpdate={handleUpdate}
          isBudget
        />
        <ProviderCard
          title="Images / Logos"
          icon={Image}
          section={config.image}
          sectionKey="image"
          onUpdate={handleUpdate}
          isBudget
        />
        <ProviderCard
          title="Recherche web"
          icon={Search}
          section={config.web_search}
          sectionKey="web_search"
          onUpdate={handleUpdate}
          isBudget={false}
        />
      </div>

      {/* Logs & Costs placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logs & Couts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Requêtes aujourd&apos;hui</p>
              <p className="text-2xl font-bold">--</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cout ce mois (USD)</p>
              <p className="text-2xl font-bold">--</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Erreurs (7j)</p>
              <p className="text-2xl font-bold">--</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">
            Ces donnees viendront plus tard lorsque le tracking des appels IA sera en place.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
