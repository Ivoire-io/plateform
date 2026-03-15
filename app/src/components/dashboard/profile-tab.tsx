"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/lib/types";
import { Camera, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ProfileTabProps {
  profile: Profile;
  userId: string;
}

export function ProfileTab({ profile: initialProfile }: ProfileTabProps) {
  const [profile, setProfile] = useState(initialProfile);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [newSkill, setNewSkill] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Seules les images sont acceptées (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2 Mo.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  async function uploadAvatar() {
    if (!avatarFile) return;
    setAvatarUploading(true);
    const toastId = toast.loading("Upload en cours…");
    const form = new FormData();
    form.append("avatar", avatarFile);
    const res = await fetch("/api/dashboard/avatar", { method: "POST", body: form });
    const json = await res.json();
    setAvatarUploading(false);
    if (json.success) {
      setProfile((p) => ({ ...p, avatar_url: json.url }));
      setAvatarFile(null);
      if (avatarPreview) { URL.revokeObjectURL(avatarPreview); setAvatarPreview(null); }
      toast.success("Photo mise à jour !", { id: toastId });
    } else {
      toast.error(json.error ?? "Erreur lors de l'upload.", { id: toastId });
    }
  }

  function cancelAvatarPreview() {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setAvatarFile(null);
  }

  function addSkill() {
    const s = newSkill.trim().slice(0, 50);
    if (!s || profile.skills.includes(s)) { setNewSkill(""); return; }
    setProfile((p) => ({ ...p, skills: [...p.skills, s] }));
    setNewSkill("");
  }

  function removeSkill(skill: string) {
    setProfile((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));
  }

  async function handleSave() {
    setIsSaving(true);
    const toastId = toast.loading("Sauvegarde…");
    const res = await fetch("/api/dashboard/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: profile.full_name,
        title: profile.title,
        city: profile.city,
        bio: profile.bio,
        github_url: profile.github_url,
        linkedin_url: profile.linkedin_url,
        twitter_url: profile.twitter_url,
        website_url: profile.website_url,
        skills: profile.skills,
        is_available: profile.is_available,
      }),
    });
    const json = await res.json();
    setIsSaving(false);
    if (json.success) {
      const saved: Profile = json.data;
      setProfile(saved);
      router.refresh(); // re-sync les données serveur
      toast.success("Profil enregistré !", { id: toastId });
    } else {
      toast.error(json.error ?? "Erreur lors de la sauvegarde.", { id: toastId });
    }
  }

  // Nettoyer l'URL stockée en DB si elle contient un ?t= stale
  const cleanAvatarUrl = profile.avatar_url
    ? profile.avatar_url.split("?")[0]
    : null;
  const displayAvatar = avatarPreview ?? cleanAvatarUrl;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ─── Carte Avatar ─── */}
      <Card className="flex flex-col items-center">
        <CardContent className="flex flex-col items-center gap-5 pt-6 w-full">

          {/* Avatar avec bouton caméra */}
          <div className="relative">
            <Avatar className="size-24 ring-2 ring-orange/30 ring-offset-2 ring-offset-background">
              {displayAvatar && <AvatarImage src={displayAvatar} alt="Photo de profil" />}
              <AvatarFallback
                className="text-2xl font-bold"
                style={{ background: "var(--color-surface)", color: "var(--color-orange)" }}
              >
                {profile.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 size-8 rounded-full text-white flex items-center justify-center shadow-md transition-colors"
              style={{ background: "var(--color-orange)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-orange-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-orange)")}
              aria-label="Changer la photo"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              className="hidden"
              aria-hidden
            />
          </div>

          <p className="text-muted-foreground text-xs text-center">JPG, PNG, WebP · max 2 Mo</p>

          {avatarFile && (
            <div className="flex flex-col gap-2 w-full max-w-[180px]">
              <Button
                onClick={uploadAvatar}
                size="sm"
                className="w-full gap-2 text-white"
                style={{ background: "var(--color-orange)" }}
                disabled={avatarUploading}
              >
                {avatarUploading
                  ? <><Loader2 size={13} className="animate-spin" /> Upload…</>
                  : "Enregistrer la photo"}
              </Button>
              <button
                onClick={cancelAvatarPreview}
                className="text-muted-foreground text-xs text-center hover:text-foreground transition-colors"
              >
                Annuler
              </button>
            </div>
          )}

          {/* Toggle disponibilité */}
          <div className="w-full max-w-[200px]">
            <button
              onClick={() => setProfile((p) => ({ ...p, is_available: !p.is_available }))}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${profile.is_available
                ? "border-green-500/30 text-green-500"
                : "border-border text-muted-foreground"
                }`}
              style={{ background: profile.is_available ? "color-mix(in srgb, #00A651 10%, transparent)" : "var(--color-card)" }}
              aria-pressed={profile.is_available}
            >
              <span>{profile.is_available ? "Disponible" : "Non disponible"}</span>
              <div className={`relative w-9 h-5 rounded-full transition-colors ${profile.is_available ? "bg-green-500" : "bg-border"}`}>
                <span
                  className="absolute top-1/2 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                  style={{ transform: `translateY(-50%) translateX(${profile.is_available ? "0px" : "-14px"})` }}
                />
              </div>
            </button>
          </div>

          <p className="text-muted-foreground/50 text-xs font-mono">{profile.slug}.ivoire.io</p>
        </CardContent>
      </Card>

      {/* ─── Carte Formulaire ─── */}
      <Card className="lg:col-span-2">
        <CardHeader className="border-b border-border/50">
          <CardTitle>Informations du profil</CardTitle>
        </CardHeader>
        <CardContent className="pt-5 flex flex-col gap-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Nom complet <span style={{ color: "var(--color-orange)" }}>*</span></Label>
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Ulrich Kouamé"
                maxLength={100}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Titre / Poste</Label>
              <Input
                value={profile.title ?? ""}
                onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))}
                placeholder="Lead Developer"
                maxLength={100}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Ville</Label>
            <Input
              value={profile.city ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
              placeholder="Abidjan"
              maxLength={50}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label>Bio</Label>
              <span className="text-muted-foreground/40 text-xs">{(profile.bio ?? "").length}/300</span>
            </div>
            <textarea
              value={profile.bio ?? ""}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Décrivez-vous en 1-3 phrases…"
              rows={3}
              maxLength={300}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60 transition-all resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { key: "github_url", label: "GitHub", placeholder: "https://github.com/username" },
              { key: "linkedin_url", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
              { key: "twitter_url", label: "Twitter / X", placeholder: "https://x.com/username" },
              { key: "website_url", label: "Site web", placeholder: "https://monsite.dev" },
            ] as const).map(({ key, label, placeholder }) => (
              <div key={key} className="flex flex-col gap-2">
                <Label>{label}</Label>
                <Input
                  value={(profile[key] as string | null) ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  type="url"
                />
              </div>
            ))}
          </div>

          {/* Compétences */}
          <div className="flex flex-col gap-3">
            <Label>Compétences</Label>
            {profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1.5 pl-3 pr-2 py-1 font-mono text-xs">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-muted-foreground/50 hover:text-destructive transition-colors"
                      aria-label={`Supprimer ${skill}`}
                    >
                      <X size={11} />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                placeholder="ex: Flutter, React, Go…"
                maxLength={50}
                className="flex-1"
              />
              <Button onClick={addSkill} variant="outline" size="sm" className="gap-1.5 shrink-0">
                <Plus size={14} /> Ajouter
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 w-fit text-white"
            style={{ background: "var(--color-orange)" }}
          >
            {isSaving
              ? <><Loader2 size={15} className="animate-spin" /> Sauvegarde…</>
              : "Enregistrer le profil"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


