"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  BadgeCheck,
  Ban,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Mail,
  Pencil,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AdminUsersTabProps {
  filterType?: string;
  showJobsMode?: boolean;
}

interface UserRow {
  id: string;
  avatar_url: string | null;
  full_name: string;
  slug: string;
  email: string;
  type: string;
  plan: string;
  is_suspended: boolean;
  verified_badge: boolean;
  is_admin: boolean;
  created_at: string;
}

const MOCK_USERS: UserRow[] = [
  { id: "1", avatar_url: null, full_name: "Ulrich Kouamé", slug: "ulrich", email: "ul@mail.ci", type: "developer", plan: "free", is_suspended: false, verified_badge: true, is_admin: true, created_at: "2026-03-14" },
  { id: "2", avatar_url: null, full_name: "TechCI", slug: "techci", email: "t@ci.com", type: "startup", plan: "free", is_suspended: false, verified_badge: false, is_admin: false, created_at: "2026-02-10" },
  { id: "3", avatar_url: null, full_name: "Acme Corp", slug: "acme", email: "h@acme.ci", type: "enterprise", plan: "enterprise", is_suspended: false, verified_badge: true, is_admin: false, created_at: "2026-01-15" },
  { id: "4", avatar_url: null, full_name: "Fatou Diallo", slug: "fatou", email: "f@mail.ci", type: "developer", plan: "premium", is_suspended: false, verified_badge: false, is_admin: false, created_at: "2026-03-10" },
  { id: "5", avatar_url: null, full_name: "Spammer", slug: "spammer", email: "sp@sp.biz", type: "other", plan: "free", is_suspended: true, verified_badge: false, is_admin: false, created_at: "2026-03-12" },
  { id: "6", avatar_url: null, full_name: "Marie Koné", slug: "marie", email: "m@test.ci", type: "developer", plan: "free", is_suspended: false, verified_badge: false, is_admin: false, created_at: "2026-03-08" },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  developer: { label: "Dev", color: "#3b82f6" },
  startup: { label: "Startup", color: "#8b5cf6" },
  enterprise: { label: "Entreprise", color: "#10b981" },
  other: { label: "Autre", color: "#a0a0a0" },
};

const PLAN_LABELS: Record<string, { label: string; icon: string }> = {
  free: { label: "Gratuit", icon: "🆓" },
  premium: { label: "Premium", icon: "⭐" },
  enterprise: { label: "Enterprise", icon: "🏢" },
};

export function AdminUsersTab({ filterType, showJobsMode }: AdminUsersTabProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(filterType ?? "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const filtered = MOCK_USERS.filter((u) => {
    const matchSearch =
      !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.slug.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || u.type === typeFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !u.is_suspended) ||
      (statusFilter === "suspended" && u.is_suspended);
    const matchPlan = planFilter === "all" || u.plan === planFilter;
    return matchSearch && matchType && matchStatus && matchPlan;
  });

  async function handleAction(action: string, user: UserRow) {
    const messages: Record<string, string> = {
      suspend: `Compte ${user.full_name} suspendu`,
      activate: `Compte ${user.full_name} réactivé`,
      badge: `Badge vérifié accordé à ${user.full_name}`,
      promote: `${user.full_name} promu admin`,
      delete: `Compte ${user.full_name} supprimé`,
      premium: `Plan premium forcé pour ${user.full_name}`,
    };
    toast.success(messages[action] ?? "Action effectuée");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {showJobsMode ? "Offres d'emploi" : filterType ? `Profils - ${TYPE_LABELS[filterType]?.label}` : `Profils (${MOCK_USERS.length})`}
        </h2>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <NativeSelect value={typeFilter} onValueChange={setTypeFilter} className="w-36">
          <NativeSelectOption value="all">Tous</NativeSelectOption>
          <NativeSelectOption value="developer">Développeur</NativeSelectOption>
          <NativeSelectOption value="startup">Startup</NativeSelectOption>
          <NativeSelectOption value="enterprise">Entreprise</NativeSelectOption>
          <NativeSelectOption value="other">Autre</NativeSelectOption>
        </NativeSelect>
        <NativeSelect value={statusFilter} onValueChange={setStatusFilter} className="w-36">
          <NativeSelectOption value="all">Tous</NativeSelectOption>
          <NativeSelectOption value="active">Actif</NativeSelectOption>
          <NativeSelectOption value="suspended">Suspendu</NativeSelectOption>
        </NativeSelect>
        <NativeSelect value={planFilter} onValueChange={setPlanFilter} className="w-36">
          <NativeSelectOption value="all">Tous</NativeSelectOption>
          <NativeSelectOption value="free">Gratuit</NativeSelectOption>
          <NativeSelectOption value="premium">Premium</NativeSelectOption>
          <NativeSelectOption value="enterprise">Enterprise</NativeSelectOption>
        </NativeSelect>
      </div>

      {/* Table */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left p-3 pl-4">Utilisateur</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Inscrit</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/50 hover:bg-white/2 transition-colors"
                  >
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                          <AvatarFallback className="text-xs" style={{ background: "var(--color-border)", color: "var(--color-orange)" }}>
                            {user.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate flex items-center gap-1">
                            {user.full_name}
                            {user.verified_badge && <BadgeCheck className="h-3 w-3 text-blue-400 shrink-0" />}
                            {user.is_admin && <ShieldCheck className="h-3 w-3 text-orange-400 shrink-0" />}
                          </div>
                          <div className="text-xs text-muted-foreground">{user.slug}.ivoire.io</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{user.email}</td>
                    <td className="p-3">
                      <Badge
                        className="text-xs"
                        style={{
                          background: `color-mix(in srgb,${TYPE_LABELS[user.type]?.color} 15%,transparent)`,
                          color: TYPE_LABELS[user.type]?.color,
                          border: `1px solid color-mix(in srgb,${TYPE_LABELS[user.type]?.color} 30%,transparent)`,
                        }}
                      >
                        {TYPE_LABELS[user.type]?.label}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">{PLAN_LABELS[user.plan]?.icon}</td>
                    <td className="p-3">
                      {user.is_suspended ? (
                        <Badge className="text-xs bg-red-500/15 text-red-400 border-red-500/30">🚫 Suspendu</Badge>
                      ) : (
                        <Badge className="text-xs bg-green-500/15 text-green-400 border-green-500/30">✅ Actif</Badge>
                      )}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => { setSelectedUser(user); setAdminNote(""); }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">Aucun utilisateur trouvé</div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Page 1 / 52 — {filtered.length} résultats</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-7 w-7 p-0"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" className="h-7 px-3">1</Button>
          <Button variant="ghost" size="sm" className="h-7 px-3">2</Button>
          <Button variant="ghost" size="sm" className="h-7 px-3">3</Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Sheet détail profil */}
      <Sheet open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <SheetContent className="w-[480px] overflow-y-auto" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          {selectedUser && (
            <>
              <SheetHeader>
                <SheetTitle>Profil : {selectedUser.full_name}</SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-5">
                {/* Infos */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    {selectedUser.avatar_url && <AvatarImage src={selectedUser.avatar_url} />}
                    <AvatarFallback style={{ background: "var(--color-border)", color: "var(--color-orange)" }}>
                      {selectedUser.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{selectedUser.slug}.ivoire.io</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedUser.email} · {TYPE_LABELS[selectedUser.type]?.label} · {PLAN_LABELS[selectedUser.plan]?.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Inscrit le {new Date(selectedUser.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="rounded-lg px-3 py-2 space-y-1 text-sm" style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}>
                  <div className="text-xs text-muted-foreground font-semibold mb-1">QUICK STATS</div>
                  <div className="text-xs text-muted-foreground">Projets : 6 · Expériences : 4 · Messages reçus : 12</div>
                  <div className="text-xs text-muted-foreground">Visites portfolio : 342 ce mois</div>
                </div>

                {/* Actions */}
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-2">ACTIONS ADMIN</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="justify-start gap-2 text-xs">
                      <a href={`https://${selectedUser.slug}.ivoire.io`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <ExternalLink className="h-3 w-3" /> Voir portfolio
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" onClick={() => toast.info("Édition profil")}>
                      <Pencil className="h-3 w-3" /> Modifier profil
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" onClick={() => handleAction("premium", selectedUser)}>
                      <Star className="h-3 w-3" /> Forcer Premium
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" onClick={() => handleAction("badge", selectedUser)}>
                      <BadgeCheck className="h-3 w-3" /> Badge vérifié
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" onClick={() => toast.info("Email envoyé")}>
                      <Mail className="h-3 w-3" /> Envoyer email
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" onClick={() => handleAction("promote", selectedUser)}>
                      <ShieldCheck className="h-3 w-3" /> Promouvoir admin
                    </Button>
                    {selectedUser.is_suspended ? (
                      <Button variant="outline" size="sm" className="justify-start gap-2 text-xs text-green-400 border-green-500/30" onClick={() => handleAction("activate", selectedUser)}>
                        <UserCheck className="h-3 w-3" /> Réactiver
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="justify-start gap-2 text-xs text-yellow-400 border-yellow-500/30" onClick={() => handleAction("suspend", selectedUser)}>
                        <Ban className="h-3 w-3" /> Suspendre
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="justify-start gap-2 text-xs text-red-400 border-red-500/30" onClick={() => handleAction("delete", selectedUser)}>
                      <Trash2 className="h-3 w-3" /> Supprimer
                    </Button>
                  </div>
                </div>

                {/* Notes admin */}
                <div>
                  <Label className="text-xs text-muted-foreground font-semibold">NOTES ADMIN</Label>
                  <Textarea
                    className="mt-2 text-sm resize-none"
                    placeholder="Notes internes, non visibles par l'utilisateur..."
                    rows={3}
                    value={adminNote}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNote(e.target.value)}
                    style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}
                  />
                  <Button size="sm" className="mt-2 w-full text-xs" style={{ background: "var(--color-orange)" }} onClick={() => toast.success("Notes sauvegardées")}>
                    💾 Sauvegarder les notes
                  </Button>
                </div>

                {/* Historique */}
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-2">HISTORIQUE</div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>14/03 10:00 — Profil créé</div>
                    <div>14/03 10:15 — Avatar uploadé</div>
                    <div>14/03 11:00 — 6 projets ajoutés</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
