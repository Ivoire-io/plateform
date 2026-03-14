"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const TOGGLE_CONFIG = [
  { key: "email_welcome", label: "Email de bienvenue" },
  { key: "email_contact", label: "Email de contact" },
  { key: "email_weekly_admin", label: "Rapport hebdo admin" },
  { key: "email_waitlist_reminder", label: "Rappel waitlist (7j)" },
];

const RESERVED_SLUGS = [
  "www", "mail", "api", "admin", "app", "devs", "startups",
  "jobs", "learn", "health", "data", "events", "invest",
  "blog", "docs", "status", "support", "help", "about",
  "contact", "pricing", "terms", "privacy",
];

export function AdminConfigTab() {
  const [registrationMode, setRegistrationMode] = useState<"waitlist" | "open">("waitlist");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailToggles, setEmailToggles] = useState<Record<string, boolean>>({
    email_welcome: true,
    email_contact: true,
    email_weekly_admin: true,
    email_waitlist_reminder: true,
  });
  const [newSlug, setNewSlug] = useState("");
  const [slugs, setSlugs] = useState(RESERVED_SLUGS);
  const [prices, setPrices] = useState({ dev: "3000", startup: "5000", enterprise: "20000" });
  const [seoTitle, setSeoTitle] = useState("ivoire.io — L'OS Digital de la CI");
  const [seoDesc, setSeoDesc] = useState("Le hub central des développeurs, startups et entreprises de Côte d'Ivoire");
  const [twitter, setTwitter] = useState("@ivoire_io");

  function addSlug() {
    if (!newSlug.trim() || slugs.includes(newSlug.trim())) return;
    setSlugs([...slugs, newSlug.trim()]);
    setNewSlug("");
    toast.success(`Slug "${newSlug}" ajouté aux réservés`);
  }

  function saveConfig() {
    toast.success("Configuration enregistrée");
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Configuration Plateforme</h2>

      {/* Inscriptions */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Inscriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { value: "waitlist", label: "Sur invitation (waitlist)" },
            { value: "open", label: "Ouvert à tous" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value={opt.value}
                checked={registrationMode === opt.value}
                onChange={() => setRegistrationMode(opt.value as "waitlist" | "open")}
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
                  <input type="radio" checked={emailToggles[cfg.key]} onChange={() => setEmailToggles({ ...emailToggles, [cfg.key]: true })} className="accent-orange-500" />
                  Activé
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input type="radio" checked={!emailToggles[cfg.key]} onChange={() => setEmailToggles({ ...emailToggles, [cfg.key]: false })} className="accent-orange-500" />
                  Désactivé
                </label>
              </div>
            </div>
          ))}
          <div className="text-xs text-muted-foreground pt-1">
            Expéditeur : noreply@ivoire.io · Provider : Resend
          </div>
        </CardContent>
      </Card>

      {/* Slugs réservés */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Slugs Réservés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {slugs.map((s) => (
              <span key={s} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono" style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}>
                {s}
              </span>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Input
              placeholder="Nouveau slug réservé"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className="flex-1 h-8 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addSlug()}
            />
            <Button size="sm" className="h-8" style={{ background: "var(--color-green)", color: "white" }} onClick={addSlug}>
              ✅ Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tarification */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Tarification</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: "dev", label: "Dev Premium", sub: "~$5" },
            { key: "startup", label: "Startup Premium", sub: "~$8" },
            { key: "enterprise", label: "Enterprise", sub: "~$33" },
          ].map((p) => (
            <div key={p.key}>
              <Label className="text-xs text-muted-foreground">{p.label}</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={prices[p.key as keyof typeof prices]}
                  onChange={(e) => setPrices({ ...prices, [p.key]: e.target.value })}
                  className="h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">FCFA/mois {p.sub}</span>
              </div>
            </div>
          ))}
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
            <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="mt-1 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Input value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} className="mt-1 h-8 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Twitter handle</Label>
            <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} className="mt-1 h-8 text-sm" />
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
              <input type="radio" checked={maintenanceMode} onChange={() => setMaintenanceMode(true)} className="accent-orange-500" />
              Activé (affiche &quot;Maintenance en cours&quot;)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" checked={!maintenanceMode} onChange={() => setMaintenanceMode(false)} className="accent-orange-500" />
              Désactivé
            </label>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => toast.success("Cache CDN purgé")}>🔄 Purger le cache CDN</Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("Backup en cours...")}>🗄️ Backup base de données</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveConfig} style={{ background: "var(--color-orange)" }}>
          💾 Enregistrer la configuration
        </Button>
      </div>
    </div>
  );
}
