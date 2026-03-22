"use client";

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
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PhoneVerification } from "./phone-verification";

function memberSinceText(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(ms / 86400000);
  if (days < 7) return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Il y a ${months} mois`;
  const years = Math.floor(months / 12);
  return `Il y a ${years} an${years > 1 ? "s" : ""}`;
}

interface SettingsTabProps {
  profile: Profile;
  userEmail: string;
  onNavigate?: (tab: string) => void;
}

interface NotifPrefs {
  notif_messages: boolean;
  notif_weekly_report: boolean;
  notif_news: boolean;
  notif_whatsapp: boolean;
  notif_inapp: boolean;
  privacy_visible_in_directory: boolean;
  privacy_show_email: boolean;
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${checked ? "" : "bg-input"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        style={checked ? { background: "var(--color-orange)" } : {}}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${checked ? "translate-x-4" : "translate-x-0"
            }`}
        />
      </button>
    </div>
  );
}

export function SettingsTab({ profile, userEmail, onNavigate }: SettingsTabProps) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<NotifPrefs>({
    notif_messages: true,
    notif_weekly_report: false,
    notif_news: true,
    notif_whatsapp: true,
    notif_inapp: true,
    privacy_visible_in_directory: true,
    privacy_show_email: false,
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Load saved prefs on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) setPrefs(data.settings);
        }
      } catch {
        // not critical
      }
    }
    load();
  }, []);

  async function savePrefs(nextPrefs: NotifPrefs) {
    setPrefs(nextPrefs);
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextPrefs),
      });
      if (!res.ok) throw new Error();
      toast.success("Préférences enregistrées");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  function updatePref<K extends keyof NotifPrefs>(key: K, value: NotifPrefs[K]) {
    const next = { ...prefs, [key]: value };
    savePrefs(next);
  }

  async function handleExport() {
    setExportLoading(true);
    try {
      const res = await fetch("/api/dashboard/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ivoire-io-export-${profile.slug}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export téléchargé !");
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== profile.slug) {
      toast.error(`Tape "${profile.slug}" pour confirmer`);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/dashboard/account", { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Compte supprimé");
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } catch {
      toast.error("Erreur lors de la suppression du compte");
      setDeleting(false);
    }
  }

  const memberSince = memberSinceText(profile.created_at);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Gère ton compte et tes préférences</p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Informations du compte</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Adresse email</p>
            <p className="text-sm font-medium">{userEmail}</p>
            <p className="text-xs text-muted-foreground">Non modifiable — fournie par ton authentification</p>
          </div>
          <div
            className="h-px"
            style={{ background: "var(--color-border)" }}
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Slug (URL du portfolio)</p>
            <p className="text-sm font-medium font-mono">
              {profile.slug}
              <span className="text-muted-foreground">.ivoire.io</span>
            </p>
            <p className="text-xs text-muted-foreground">Définitif — ne peut pas être modifié</p>
          </div>
          <div
            className="h-px"
            style={{ background: "var(--color-border)" }}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Membre depuis</p>
              <p className="text-sm font-medium">{memberSince}</p>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Plan actuel</p>
              <p className="text-sm font-medium capitalize">
                {profile.plan === "free"
                  ? "Gratuit"
                  : profile.plan === "starter"
                    ? "Starter"
                    : profile.plan === "pro"
                      ? "Pro ⭐"
                      : profile.plan === "student"
                        ? "Etudiant"
                        : "Enterprise"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-semibold">📨 Notifications</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <Toggle
            label="Notifications in-app"
            description="Affiche les notifications dans le dashboard"
            checked={prefs.notif_inapp}
            onChange={(v) => updatePref("notif_inapp", v)}
            disabled={saving}
          />
          <Toggle
            label="Notifications WhatsApp"
            description="Recois les alertes importantes sur WhatsApp"
            checked={prefs.notif_whatsapp}
            onChange={(v) => updatePref("notif_whatsapp", v)}
            disabled={saving}
          />
          <Toggle
            label="Nouveau message reçu"
            description="Reçois un email quand un visiteur t'envoie un message"
            checked={prefs.notif_messages}
            onChange={(v) => updatePref("notif_messages", v)}
            disabled={saving}
          />
          <Toggle
            label="Rapport hebdomadaire"
            description="Un résumé de tes stats chaque lundi"
            checked={prefs.notif_weekly_report}
            onChange={(v) => updatePref("notif_weekly_report", v)}
            disabled={saving}
          />
          <Toggle
            label="Nouveautés ivoire.io"
            description="Infos sur les nouvelles fonctionnalités et mises à jour"
            checked={prefs.notif_news}
            onChange={(v) => updatePref("notif_news", v)}
            disabled={saving}
          />
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-semibold">🔒 Confidentialité</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <Toggle
            label="Visible dans l'annuaire devs"
            description="Ton profil apparaît dans devs.ivoire.io"
            checked={prefs.privacy_visible_in_directory}
            onChange={(v) => updatePref("privacy_visible_in_directory", v)}
            disabled={saving}
          />
          <Toggle
            label="Afficher mon email sur le portfolio"
            description="Sinon, un formulaire de contact masque ton adresse"
            checked={prefs.privacy_show_email}
            onChange={(v) => updatePref("privacy_show_email", v)}
            disabled={saving}
          />
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">⭐ Abonnement</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div
            className="rounded-lg p-3 flex items-center justify-between"
            style={{ background: "var(--color-surface)" }}
          >
            <div>
              <p className="text-sm font-medium">
                Plan {profile.plan === "free" ? "Gratuit" : profile.plan === "starter" ? "Starter" : profile.plan === "pro" ? "Pro" : profile.plan === "student" ? "Etudiant" : "Enterprise"}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile.plan === "free" ? "3 templates · Stats 30j · 5 projets max" : "Acces complet a toutes les fonctionnalites"}
              </p>
            </div>
            {profile.plan === "free" && (
              <Button
                size="sm"
                style={{ background: "var(--color-orange)", color: "#fff" }}
                onClick={() => onNavigate?.("subscription")}
              >
                Upgrader
              </Button>
            )}
          </div>
          {profile.plan === "free" && (
            <div className="text-sm">
              <p className="font-medium mb-2">Pourquoi passer en Premium ?</p>
              <ul className="flex flex-col gap-1 text-muted-foreground text-xs">
                <li>✅ 10+ templates premium</li>
                <li>✅ Stats avancées (pays, entreprises, export)</li>
                <li>✅ Projets illimités</li>
                <li>✅ Badge vérifié ⭐</li>
                <li>✅ Priorité dans l&apos;annuaire</li>
                <li>✅ Export PDF du portfolio</li>
              </ul>
              <Button
                className="mt-3 w-full"
                style={{ background: "var(--color-orange)", color: "#fff" }}
                onClick={() => onNavigate?.("subscription")}
              >
                ⭐ Voir les plans disponibles
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Verification */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">📱 Vérification WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <PhoneVerification
            profileId={profile.id}
            verified={profile.phone_verified}
            currentPhone={profile.verified_phone}
          />
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-red-500">⚠️ Zone dangereuse</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            disabled={exportLoading}
            onClick={handleExport}
          >
            📥 {exportLoading ? "Export en cours..." : "Exporter mes données (JSON)"}
          </Button>
          <div
            className="h-px"
            style={{ background: "var(--color-border)" }}
          />
          <div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              🗑️ Supprimer mon compte
            </Button>
            <p className="text-xs text-muted-foreground mt-1.5">
              ⚠️ Cette action est irréversible. Ton slug sera libéré et ton portfolio supprimé.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-500">Supprimer mon compte</DialogTitle>
            <DialogDescription>
              Cette action est{" "}
              <span className="font-semibold text-foreground">irréversible</span>. Ton portfolio,
              tes projets et tes données seront définitivement supprimés.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Tape <span className="font-mono font-semibold text-foreground">{profile.slug}</span>{" "}
              pour confirmer :
            </p>
            <input
              type="text"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder={profile.slug}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setShowDeleteDialog(false); setDeleteConfirm(""); }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleting || deleteConfirm !== profile.slug}
              onClick={handleDeleteAccount}
            >
              {deleting ? "Suppression..." : "Supprimer définitivement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
