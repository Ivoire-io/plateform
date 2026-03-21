"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface PlatformConfigMap {
  registration_mode: "waitlist" | "open";
  maintenance_mode: boolean;
  email_welcome: boolean;
  email_contact: boolean;
  email_weekly_admin: boolean;
  email_waitlist_reminder: boolean;
  seo_title: string;
  seo_description: string;
  twitter_handle: string;
  reserved_slugs: string[];
}

const TOGGLE_CONFIG = [
  { key: "email_welcome", label: "Email de bienvenue" },
  { key: "email_contact", label: "Email de contact" },
  { key: "email_weekly_admin", label: "Rapport hebdo admin" },
  { key: "email_waitlist_reminder", label: "Rappel waitlist (7j)" },
];

const DEFAULT_CONFIG: PlatformConfigMap = {
  registration_mode: "waitlist",
  maintenance_mode: false,
  email_welcome: true,
  email_contact: true,
  email_weekly_admin: true,
  email_waitlist_reminder: true,
  seo_title: "ivoire.io — L'OS Digital de la CI",
  seo_description: "Le hub central des developpeurs, startups et entreprises de Cote d'Ivoire",
  twitter_handle: "@ivoire_io",
  reserved_slugs: [
    "www", "mail", "api", "admin", "app", "devs", "startups",
    "jobs", "learn", "health", "data", "events", "invest",
    "blog", "docs", "status", "support", "help", "about",
    "contact", "pricing", "terms", "privacy",
  ],
};

export function AdminConfigTab() {
  const [config, setConfig] = useState<PlatformConfigMap>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSlug, setNewSlug] = useState("");

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/config");
      if (!res.ok) throw new Error();
      const data = await res.json();

      // Merge DB values into config
      const entries = data.config ?? [];
      const merged = { ...DEFAULT_CONFIG };

      for (const entry of entries) {
        const key = entry.key as keyof PlatformConfigMap;
        if (key in merged) {
          (merged as Record<string, unknown>)[key] = entry.value;
        }
      }

      setConfig(merged);
    } catch {
      toast.error("Erreur lors du chargement de la configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  async function saveConfig() {
    setSaving(true);
    try {
      // Save each config key individually
      const entries: { key: string; value: unknown }[] = [
        { key: "registration_mode", value: config.registration_mode },
        { key: "maintenance_mode", value: config.maintenance_mode },
        { key: "email_welcome", value: config.email_welcome },
        { key: "email_contact", value: config.email_contact },
        { key: "email_weekly_admin", value: config.email_weekly_admin },
        { key: "email_waitlist_reminder", value: config.email_waitlist_reminder },
        { key: "seo_title", value: config.seo_title },
        { key: "seo_description", value: config.seo_description },
        { key: "twitter_handle", value: config.twitter_handle },
        { key: "reserved_slugs", value: config.reserved_slugs },
      ];

      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur serveur");
      }

      toast.success("Configuration enregistree");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  function addSlug() {
    const slug = newSlug.trim().toLowerCase();
    if (!slug || config.reserved_slugs.includes(slug)) return;
    setConfig({ ...config, reserved_slugs: [...config.reserved_slugs, slug] });
    setNewSlug("");
  }

  function removeSlug(slug: string) {
    setConfig({
      ...config,
      reserved_slugs: config.reserved_slugs.filter((s) => s !== slug),
    });
  }

  function setEmailToggle(key: string, value: boolean) {
    setConfig({ ...config, [key]: value });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Configuration Plateforme</h2>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchConfig}>
          <RefreshCw className="h-4 w-4" />
          Recharger
        </Button>
      </div>

      {/* Inscriptions */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Inscriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { value: "waitlist", label: "Sur invitation (waitlist)" },
            { value: "open", label: "Ouvert a tous" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value={opt.value}
                checked={config.registration_mode === opt.value}
                onChange={() => setConfig({ ...config, registration_mode: opt.value as "waitlist" | "open" })}
                className="accent-orange-500"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Emails */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Emails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {TOGGLE_CONFIG.map((cfg) => (
            <div key={cfg.key} className="flex items-center justify-between">
              <span className="text-sm">{cfg.label}</span>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="radio"
                    checked={config[cfg.key as keyof PlatformConfigMap] === true}
                    onChange={() => setEmailToggle(cfg.key, true)}
                    className="accent-orange-500"
                  />
                  Active
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="radio"
                    checked={config[cfg.key as keyof PlatformConfigMap] !== true}
                    onChange={() => setEmailToggle(cfg.key, false)}
                    className="accent-orange-500"
                  />
                  Desactive
                </label>
              </div>
            </div>
          ))}
          <div className="text-xs text-muted-foreground pt-1">
            Expediteur : noreply@ivoire.io — Provider : Resend
          </div>
        </CardContent>
      </Card>

      {/* Slugs reserves */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Slugs Reserves</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {config.reserved_slugs.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono cursor-pointer hover:line-through"
                style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}
                onClick={() => removeSlug(s)}
                title="Cliquer pour retirer"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Input
              placeholder="Nouveau slug reserve"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className="flex-1 h-8 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addSlug()}
            />
            <Button
              size="sm"
              className="h-8"
              style={{ background: "var(--color-green)", color: "white" }}
              onClick={addSlug}
            >
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SEO & Social */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">SEO & Social</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Titre SEO</Label>
            <Input
              value={config.seo_title}
              onChange={(e) => setConfig({ ...config, seo_title: e.target.value })}
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Input
              value={config.seo_description}
              onChange={(e) => setConfig({ ...config, seo_description: e.target.value })}
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Twitter handle</Label>
            <Input
              value={config.twitter_handle}
              onChange={(e) => setConfig({ ...config, twitter_handle: e.target.value })}
              className="mt-1 h-8 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                checked={config.maintenance_mode === true}
                onChange={() => setConfig({ ...config, maintenance_mode: true })}
                className="accent-orange-500"
              />
              Active (affiche &quot;Maintenance en cours&quot;)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                checked={config.maintenance_mode !== true}
                onChange={() => setConfig({ ...config, maintenance_mode: false })}
                className="accent-orange-500"
              />
              Desactive
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={saveConfig}
          disabled={saving}
          className="gap-2"
          style={{ background: "var(--color-orange)" }}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Enregistrer la configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
