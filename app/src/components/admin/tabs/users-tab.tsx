"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCallback, useEffect, useRef, useState } from "react";
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

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  developer: { label: "Dev", color: "#3b82f6" },
  startup: { label: "Startup", color: "#8b5cf6" },
  enterprise: { label: "Entreprise", color: "#10b981" },
  other: { label: "Autre", color: "#a0a0a0" },
};

const PLAN_LABELS: Record<string, { label: string; icon: string }> = {
  free:       { label: "Gratuit",    icon: "⚡" },
  builder:    { label: "Builder",    icon: "🎓" },
  startup:    { label: "Startup",    icon: "🚀" },
  pro:        { label: "Pro",        icon: "👑" },
  growth:     { label: "Growth",     icon: "🛡️" },
};

const PAGE_SIZE = 20;

export function AdminUsersTab({ filterType, showJobsMode }: AdminUsersTabProps) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(filterType ?? "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  // Edit Profile Mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserRow>>({});

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = useCallback(async (p: number, s: string, t: string, st: string, pl: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
      if (s) params.set("search", s);
      if (t !== "all") params.set("type", t);
      if (st !== "all") params.set("status", st);
      if (pl !== "all") params.set("plan", pl);
      const res = await fetch(`/api/admin/profiles?${params}`);
      const data = await res.json();
      setUsers(data.profiles ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error("Erreur lors du chargement des profils");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page, search, typeFilter, statusFilter, planFilter);
  }, [fetchUsers, page, typeFilter, statusFilter, planFilter]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, value, typeFilter, statusFilter, planFilter);
    }, 400);
  }

  async function handleAction(action: string, user: UserRow) {
    setActionLoading(true);
    try {
      let res: Response;
      if (action === "delete") {
        res = await fetch(`/api/admin/profiles/${user.id}`, { method: "DELETE" });
      } else if (action === "remove-badge") {
        res = await fetch(`/api/admin/profiles/${user.id}/badge`, { method: "DELETE" });
      } else {
        res = await fetch(`/api/admin/profiles/${user.id}/${action}`, { method: "POST" });
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Erreur serveur");
      }

      const messages: Record<string, string> = {
        suspend: `Compte ${user.full_name} suspendu`,
        activate: `Compte ${user.full_name} réactivé`,
        badge: `Badge vérifié accordé à ${user.full_name}`,
        "remove-badge": `Badge vérifié retiré de ${user.full_name}`,
        promote: `${user.full_name} promu admin`,
        delete: `Compte ${user.full_name} supprimé`,
      };
      toast.success(messages[action] ?? "Action effectuée");

      if (action === "delete") {
        setSelectedUser(null);
        setDeleteTarget(null);
      } else if (selectedUser?.id === user.id) {
        // Update local selectedUser to reflect the change immediately
        const updates: Partial<UserRow> = {};
        if (action === "suspend") updates.is_suspended = true;
        if (action === "activate") updates.is_suspended = false;
        if (action === "badge") updates.verified_badge = true;
        if (action === "remove-badge") updates.verified_badge = false;
        if (action === "promote") updates.is_admin = true;
        setSelectedUser({ ...selectedUser, ...updates });
      }
      fetchUsers(page, search, typeFilter, statusFilter, planFilter);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setActionLoading(false);
    }
  }

  async function saveAdminNote() {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/profiles/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_notes: adminNote }),
      });
      if (!res.ok) throw new Error();
      toast.success("Notes sauvegardées");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSaveProfile() {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/profiles/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      toast.success("Profil modifié avec succès");
      setIsEditingProfile(false);
      setSelectedUser({ ...selectedUser, ...editForm } as UserRow);
      fetchUsers(page, search, typeFilter, statusFilter, planFilter);
    } catch {
      toast.error("Erreur lors de la modification");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleForcePremium() {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/profiles/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Plan Pro appliqué");
      setSelectedUser({ ...selectedUser, plan: "pro" });
      fetchUsers(page, search, typeFilter, statusFilter, planFilter);
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setActionLoading(false);
    }
  }

  async function openUserSheet(user: UserRow) {
    setSelectedUser(user);
    setAdminNote("");
    // Fetch admin_notes from the full profile
    try {
      const res = await fetch(`/api/admin/profiles/${user.id}`);
      if (res.ok) {
        const profile = await res.json();
        setAdminNote(profile.admin_notes ?? "");
      }
    } catch {
      // Non-blocking — the sheet still opens
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {showJobsMode
            ? "Offres d'emploi"
            : filterType
              ? `Profils — ${TYPE_LABELS[filterType]?.label}`
              : `Profils (${total})`}
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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <NativeSelect value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }} className="w-36">
          <NativeSelectOption value="all">Tous</NativeSelectOption>
          <NativeSelectOption value="developer">Développeur</NativeSelectOption>
          <NativeSelectOption value="startup">Startup</NativeSelectOption>
          <NativeSelectOption value="enterprise">Entreprise</NativeSelectOption>
          <NativeSelectOption value="other">Autre</NativeSelectOption>
        </NativeSelect>
        <NativeSelect value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }} className="w-36">
          <NativeSelectOption value="all">Tous</NativeSelectOption>
          <NativeSelectOption value="active">Actif</NativeSelectOption>
          <NativeSelectOption value="suspended">Suspendu</NativeSelectOption>
        </NativeSelect>
        <NativeSelect value={planFilter} onValueChange={(v) => { setPlanFilter(v); setPage(1); }} className="w-36">
          <NativeSelectOption value="all">Tous</NativeSelectOption>
          <NativeSelectOption value="free">Gratuit</NativeSelectOption>
          <NativeSelectOption value="builder">Builder</NativeSelectOption>
          <NativeSelectOption value="startup">Startup</NativeSelectOption>
          <NativeSelectOption value="pro">Pro</NativeSelectOption>
          <NativeSelectOption value="growth">Growth</NativeSelectOption>
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">Chargement…</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">Aucun utilisateur trouvé</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/50 hover:bg-white/2 transition-colors cursor-pointer"
                      onClick={() => openUserSheet(user)}
                    >
                      <td className="p-3 pl-4">
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                            <AvatarFallback className="text-xs" style={{ background: "var(--color-border)", color: "var(--color-orange)" }}>
                              {user.full_name?.charAt(0) || user.email?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium truncate flex items-center gap-1">
                              {user.full_name || "Nom non défini"}
                              {user.verified_badge && <BadgeCheck className="h-3 w-3 text-blue-400 shrink-0" />}
                              {user.is_admin && <ShieldCheck className="h-3 w-3 text-orange-400 shrink-0" />}
                            </div>
                            <div className="text-xs text-muted-foreground">{user.slug ? `${user.slug}.ivoire.io` : '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{user.email}</td>
                      <td className="p-3">
                        <Badge
                          className="text-xs"
                          style={{
                            background: `color-mix(in srgb,${TYPE_LABELS[user.type]?.color ?? "#a0a0a0"} 15%,transparent)`,
                            color: TYPE_LABELS[user.type]?.color ?? "#a0a0a0",
                            border: `1px solid color-mix(in srgb,${TYPE_LABELS[user.type]?.color ?? "#a0a0a0"} 30%,transparent)`,
                          }}
                        >
                          {TYPE_LABELS[user.type]?.label ?? user.type}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{PLAN_LABELS[user.plan]?.icon ?? "🆓"}</td>
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
                          onClick={(e) => { e.stopPropagation(); openUserSheet(user); }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Page {page} / {totalPages} — {total} résultat{total > 1 ? "s" : ""}</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {(() => {
            const maxVisible = Math.min(3, totalPages);
            let start = Math.max(1, page - Math.floor(maxVisible / 2));
            const end = Math.min(totalPages, start + maxVisible - 1);
            start = Math.max(1, end - maxVisible + 1);
            return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
              <Button
                key={p}
                variant={p === page ? "outline" : "ghost"}
                size="sm"
                className="h-7 px-3"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ));
          })()}
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sheet détail profil */}
      <Sheet open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-hidden flex flex-col p-0 border-l border-white/10 bg-background sm:w-[480px]">
          {selectedUser && (
            <>
              <SheetHeader className="px-6 py-5 border-b border-white/5">
                <SheetTitle className="text-xl font-bold">Profil utilisateur</SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Infos */}
                <div className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <Avatar className="h-14 w-14 border border-white/10">
                    {selectedUser.avatar_url && <AvatarImage src={selectedUser.avatar_url} />}
                    <AvatarFallback className="bg-orange-500/10 text-orange-500 text-lg">
                      {selectedUser.full_name?.charAt(0) || selectedUser.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg leading-tight">{selectedUser.full_name || "Nom non défini"}</h3>
                    <div className="text-sm text-muted-foreground">{selectedUser.slug ? `${selectedUser.slug}.ivoire.io` : '-'}</div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-white/70 ring-1 ring-inset ring-white/10">
                        {TYPE_LABELS[selectedUser.type]?.label ?? selectedUser.type}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-white/70 ring-1 ring-inset ring-white/10">
                        {PLAN_LABELS[selectedUser.plan]?.label ?? selectedUser.plan}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground pt-1">
                      Inscrit le {new Date(selectedUser.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Actions Admin</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs font-normal hover:bg-white/5 transition-colors border-white/10" onClick={() => {
                      const host = window.location.host.replace(/^www\./, '');
                      window.open(`${window.location.protocol}//${selectedUser.slug}.${host}`, "_blank");
                    }}>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" /> Voir portfolio
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs font-normal hover:bg-white/5 transition-colors border-white/10" onClick={() => {
                      setEditForm({ full_name: selectedUser.full_name, type: selectedUser.type, plan: selectedUser.plan });
                      setIsEditingProfile(true);
                    }}>
                      <Pencil className="h-4 w-4 text-muted-foreground" /> Modifier profil
                    </Button>
                    <Button
                      variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs font-normal hover:bg-white/5 transition-colors border-white/10"
                      disabled={actionLoading || selectedUser.plan === "pro"}
                      onClick={handleForcePremium}
                    >
                      <Star className="h-4 w-4 text-muted-foreground" /> Forcer Pro
                    </Button>
                    <Button
                      variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs font-normal hover:bg-white/5 transition-colors border-white/10"
                      disabled={actionLoading}
                      onClick={() => handleAction(selectedUser.verified_badge ? "remove-badge" : "badge", selectedUser)}
                    >
                      <BadgeCheck className="h-4 w-4 text-muted-foreground" /> {selectedUser.verified_badge ? "Retirer badge" : "Badge vérifié"}
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs font-normal hover:bg-white/5 transition-colors border-white/10" onClick={() => window.location.href = `mailto:${selectedUser.email}`}>
                      <Mail className="h-4 w-4 text-muted-foreground" /> Envoyer email
                    </Button>
                    <Button
                      variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs font-normal hover:bg-white/5 transition-colors border-white/10"
                      disabled={actionLoading || selectedUser.is_admin}
                      onClick={() => handleAction("promote", selectedUser)}
                    >
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Promouvoir admin
                    </Button>
                    {selectedUser.is_suspended ? (
                      <Button
                        variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs font-normal bg-green-500/5 text-green-400 border-green-500/20 hover:bg-green-500/10"
                        disabled={actionLoading}
                        onClick={() => handleAction("activate", selectedUser)}
                      >
                        <UserCheck className="h-4 w-4" /> Réactiver
                      </Button>
                    ) : (
                      <Button
                        variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs font-normal bg-yellow-500/5 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/10"
                        disabled={actionLoading}
                        onClick={() => handleAction("suspend", selectedUser)}
                      >
                        <Ban className="h-4 w-4" /> Suspendre
                      </Button>
                    )}
                    <Button
                      variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs font-normal bg-red-500/5 text-red-400 border-red-500/20 hover:bg-red-500/10"
                      disabled={actionLoading}
                      onClick={() => setDeleteTarget(selectedUser)}
                    >
                      <Trash2 className="h-4 w-4" /> Supprimer
                    </Button>
                  </div>
                </div>

                {/* Notes admin */}
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Notes Admin</h4>
                  <div className="space-y-2">
                    <Textarea
                      className="min-h-[120px] text-sm resize-none bg-black/20 border-white/10 focus-visible:ring-1 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50"
                      placeholder="Notes internes, non visibles par l'utilisateur..."
                      value={adminNote}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNote(e.target.value)}
                    />
                    <Button
                      size="sm"
                      className="w-full h-9 bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
                      disabled={actionLoading}
                      onClick={saveAdminNote}
                    >
                      Sauvegarder les notes
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="sm:max-w-[425px] bg-background border-white/10">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                value={editForm.full_name || ""}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="bg-black/20 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Type d'utilisateur</Label>
              <NativeSelect
                value={editForm.type || "developer"}
                onValueChange={(v) => setEditForm({ ...editForm, type: v })}
                className="w-full"
              >
                <NativeSelectOption value="developer">Développeur</NativeSelectOption>
                <NativeSelectOption value="startup">Startup</NativeSelectOption>
                <NativeSelectOption value="enterprise">Entreprise</NativeSelectOption>
                <NativeSelectOption value="other">Autre</NativeSelectOption>
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label>Forfait (Plan)</Label>
              <NativeSelect
                value={editForm.plan || "free"}
                onValueChange={(v) => setEditForm({ ...editForm, plan: v })}
                className="w-full"
              >
                <NativeSelectOption value="free">Gratuit</NativeSelectOption>
                <NativeSelectOption value="builder">Builder</NativeSelectOption>
                <NativeSelectOption value="startup">Startup</NativeSelectOption>
                <NativeSelectOption value="pro">Pro</NativeSelectOption>
                <NativeSelectOption value="growth">Growth</NativeSelectOption>
              </NativeSelect>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingProfile(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button onClick={handleSaveProfile} disabled={actionLoading} style={{ background: "var(--color-orange)", color: "white" }}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le compte de <strong>{deleteTarget?.full_name}</strong> ({deleteTarget?.email}) sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={actionLoading}
              onClick={() => deleteTarget && handleAction("delete", deleteTarget)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

