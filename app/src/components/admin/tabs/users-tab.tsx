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
  free: { label: "Gratuit", icon: "🆓" },
  premium: { label: "Premium", icon: "⭐" },
  enterprise: { label: "Enterprise", icon: "🏢" },
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
      } else {
        res = await fetch(`/api/admin/profiles/${user.id}/${action}`, { method: "POST" });
      }
      if (!res.ok) throw new Error(await res.text());

      const messages: Record<string, string> = {
        suspend: `Compte ${user.full_name} suspendu`,
        activate: `Compte ${user.full_name} réactivé`,
        badge: `Badge vérifié accordé à ${user.full_name}`,
        promote: `${user.full_name} promu admin`,
        delete: `Compte ${user.full_name} supprimé`,
      };
      toast.success(messages[action] ?? "Action effectuée");

      if (action === "delete") {
        setSelectedUser(null);
      }
      fetchUsers(page, search, typeFilter, statusFilter, planFilter);
    } catch {
      toast.error("Une erreur est survenue");
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
                          onClick={() => { setSelectedUser(user); setAdminNote(""); }}
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
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(page - 1 + i, totalPages - Math.min(3, totalPages) + i + 1));
            return (
              <Button
                key={p}
                variant={p === page ? "outline" : "ghost"}
                size="sm"
                className="h-7 px-3"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            );
          })}
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
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
                      {selectedUser.email} · {TYPE_LABELS[selectedUser.type]?.label ?? selectedUser.type} · {PLAN_LABELS[selectedUser.plan]?.label ?? selectedUser.plan}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Inscrit le {new Date(selectedUser.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <div className="text-xs text-muted-foreground font-semibold mb-2">ACTIONS ADMIN</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" onClick={() => window.open(`/${selectedUser.slug}`, "_blank")}>
                      <ExternalLink className="h-3 w-3" /> Voir portfolio
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" onClick={() => toast.info("Fonctionnalité à venir")}>
                      <Pencil className="h-3 w-3" /> Modifier profil
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" onClick={() => toast.info("Fonctionnalité à venir")}>
                      <Star className="h-3 w-3" /> Forcer Premium
                    </Button>
                    <Button
                      variant="outline" size="sm" className="justify-start gap-2 text-xs"
                      disabled={actionLoading}
                      onClick={() => handleAction("badge", selectedUser)}
                    >
                      <BadgeCheck className="h-3 w-3" /> Badge vérifié
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" onClick={() => toast.info("Fonctionnalité à venir")}>
                      <Mail className="h-3 w-3" /> Envoyer email
                    </Button>
                    <Button
                      variant="outline" size="sm" className="justify-start gap-2 text-xs"
                      disabled={actionLoading}
                      onClick={() => handleAction("promote", selectedUser)}
                    >
                      <ShieldCheck className="h-3 w-3" /> Promouvoir admin
                    </Button>
                    {selectedUser.is_suspended ? (
                      <Button
                        variant="outline" size="sm" className="justify-start gap-2 text-xs text-green-400 border-green-500/30"
                        disabled={actionLoading}
                        onClick={() => handleAction("activate", selectedUser)}
                      >
                        <UserCheck className="h-3 w-3" /> Réactiver
                      </Button>
                    ) : (
                      <Button
                        variant="outline" size="sm" className="justify-start gap-2 text-xs text-yellow-400 border-yellow-500/30"
                        disabled={actionLoading}
                        onClick={() => handleAction("suspend", selectedUser)}
                      >
                        <Ban className="h-3 w-3" /> Suspendre
                      </Button>
                    )}
                    <Button
                      variant="outline" size="sm" className="justify-start gap-2 text-xs text-red-400 border-red-500/30"
                      disabled={actionLoading}
                      onClick={() => handleAction("delete", selectedUser)}
                    >
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
                  <Button
                    size="sm" className="mt-2 w-full text-xs"
                    style={{ background: "var(--color-orange)" }}
                    disabled={actionLoading}
                    onClick={saveAdminNote}
                  >
                    💾 Sauvegarder les notes
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

