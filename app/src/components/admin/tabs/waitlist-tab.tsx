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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Download, Mail, RefreshCw, Search, Trash2, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface WaitlistEntry {
  id: string;
  full_name: string | null;
  email: string;
  desired_slug: string | null;
  type: string;
  whatsapp: string | null;
  created_at: string;
  invited?: boolean;
  invited_at?: string | null;
  converted_profile_id?: string | null;
  converted_at?: string | null;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  developer: { label: "Dev", color: "#3b82f6" },
  startup: { label: "Startup", color: "#8b5cf6" },
  enterprise: { label: "Entreprise", color: "#10b981" },
  other: { label: "Autre", color: "#a0a0a0" },
};

export function AdminWaitlistTab() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showInvited, setShowInvited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);

  // Layout / Modals
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<WaitlistEntry | null>(null);
  const [confirmInviteAll, setConfirmInviteAll] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  async function loadWaitlist() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      // On charge tout, puis on filtre côté client pour le search (simple et rapide)
      const res = await fetch(`/api/admin/waitlist?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur chargement waitlist");
      setEntries(data.entries ?? []);
    } catch {
      toast.error("Erreur lors du chargement de la waitlist");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWaitlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return entries.filter((w) => {
      if (!showInvited && w.invited) return false;
      const matchSearch =
        !s ||
        (w.full_name ?? "").toLowerCase().includes(s) ||
        w.email.toLowerCase().includes(s) ||
        (w.desired_slug ?? "").toLowerCase().includes(s);
      const matchType = typeFilter === "all" || w.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [entries, search, typeFilter, showInvited]);

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, showInvited]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const total = entries.length;
  const invited = entries.filter((e) => e.invited).length;
  const pending = total - invited;
  const conversionRate = total > 0 ? Math.round((invited / total) * 100) : 0;

  async function handleInvite(entry: WaitlistEntry, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setInvitingId(entry.id);
    try {
      const res = await fetch(`/api/admin/waitlist/${entry.id}/invite`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "invite_failed");
      if (data?.data?.email_sent) {
        toast.success(`Accès envoyés à ${entry.full_name ?? entry.email}`);
      } else {
        toast.success(`Accès créés pour ${entry.full_name ?? entry.email}`);
        if (data?.data?.action_link) {
          toast.info("Resend non configuré: lien d’accès disponible dans la réponse API.");
        }
      }
      loadWaitlist();
    } catch {
      toast.error("Erreur lors de l’invitation");
    } finally {
      setInvitingId(null);
    }
  }

  async function performDelete(entry: WaitlistEntry) {
    setDeletingId(entry.id);
    try {
      const res = await fetch(`/api/admin/waitlist/${entry.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Erreur de suppression");
      }
      toast.success(`${entry.full_name ?? entry.email} retiré de la waitlist`);
      loadWaitlist();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
      setEntryToDelete(null);
    }
  }

  function handleDelete(entry: WaitlistEntry, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setEntryToDelete(entry);
  }

  async function performInviteAll() {
    try {
      setConfirmInviteAll(false);
      const res = await fetch("/api/admin/waitlist/invite-all", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "invite_all_failed");
      toast.success(`Conversions: ${data?.data?.converted ?? 0} / ${data?.data?.requested ?? 0}`);
      if (data?.data?.note) toast.info(data.data.note);
      loadWaitlist();
    } catch (e) {
      toast.error(`Erreur : ${e instanceof Error ? e.message : "Erreur inconnue"}`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">
          Waitlist ({loading ? "…" : pending} en attente)
        </h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-xs"
            onClick={() => setShowInvited((v) => !v)}
          >
            {showInvited ? "Masquer invités" : `Voir invités (${invited})`}
          </Button>
          <Button size="sm" className="gap-2" style={{ background: "var(--color-green)", color: "white" }} onClick={() => setConfirmInviteAll(true)}>
            <UserCheck className="h-4 w-4" /> Inviter tous
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Mail className="h-4 w-4" /> Email de rappel
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <NativeSelect value={typeFilter} onValueChange={setTypeFilter} className="w-36">
          <NativeSelectOption value="all">Tous</NativeSelectOption>
          <NativeSelectOption value="developer">Dev</NativeSelectOption>
          <NativeSelectOption value="startup">Startup</NativeSelectOption>
          <NativeSelectOption value="enterprise">Entreprise</NativeSelectOption>
        </NativeSelect>
      </div>

      {/* Table */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left p-3 pl-4">Nom</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Slug désiré</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">WhatsApp</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">Chargement…</td>
                  </tr>
                ) : paginatedData.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className={`border-b border-border/50 cursor-pointer transition-colors ${entry.invited ? "opacity-50" : "hover:bg-white/2"
                      }`}
                  >
                    <td className="p-3 pl-4 font-medium">
                      <div className="flex items-center gap-2">
                        {entry.full_name ?? "—"}
                        {entry.invited && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{entry.email}</td>
                    <td className="p-3 text-xs font-mono">{entry.desired_slug ? `${entry.desired_slug}.ivoire.io` : "—"}</td>
                    <td className="p-3">
                      <Badge
                        className="text-xs"
                        style={{
                          background: `color-mix(in srgb,${TYPE_LABELS[entry.type]?.color} 15%,transparent)`,
                          color: TYPE_LABELS[entry.type]?.color,
                          border: `1px solid color-mix(in srgb,${TYPE_LABELS[entry.type]?.color} 30%,transparent)`,
                        }}
                      >
                        {TYPE_LABELS[entry.type]?.label}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{entry.whatsapp ?? "—"}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {entry.invited ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 text-muted-foreground"
                            title="Renvoyer le lien d'accès"
                            disabled={invitingId === entry.id}
                            onClick={(e) => handleInvite(entry, e)}
                          >
                            {invitingId === entry.id
                              ? <RefreshCw className="h-3 w-3 animate-spin" />
                              : <RefreshCw className="h-3 w-3" />}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-7 w-7 p-0"
                            style={{ background: "var(--color-green)", color: "white" }}
                            title="Inviter"
                            disabled={invitingId === entry.id}
                            onClick={(e) => handleInvite(entry, e)}
                          >
                            {invitingId === entry.id
                              ? <RefreshCw className="h-3 w-3 animate-spin" />
                              : <UserCheck className="h-3 w-3" />}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                          disabled={deletingId === entry.id}
                          onClick={(e) => handleDelete(entry, e)}
                        >
                          {deletingId === entry.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">Aucun inscrit trouvé</div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
          <span>Page {page} / {totalPages} — {totalFiltered} résultat{totalFiltered > 1 ? "s" : ""}</span>
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
      )}

      {/* Stats waitlist */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Stats Waitlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold">{loading ? "…" : total}</div>
              <div className="text-xs text-muted-foreground">Total inscrits</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-400">{loading ? "…" : invited}</div>
              <div className="text-xs text-muted-foreground">Invités</div>
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: "var(--color-orange)" }}>{loading ? "…" : pending}</div>
              <div className="text-xs text-muted-foreground">En attente</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-400">{loading ? "…" : `${conversionRate}%`}</div>
              <div className="text-xs text-muted-foreground">Taux conversion</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!entryToDelete} onOpenChange={(o) => !o && setEntryToDelete(null)}>
        <AlertDialogContent className="bg-background border-white/10 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{entryToDelete?.full_name || entryToDelete?.email}</strong> de la waitlist ? Cette action est définitive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 hover:bg-white/5">Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                if (entryToDelete) performDelete(entryToDelete);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite All Confirmation */}
      <AlertDialog open={confirmInviteAll} onOpenChange={setConfirmInviteAll}>
        <AlertDialogContent className="bg-background border-white/10 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Inviter tous les utilisateurs ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point d'inviter tous les <strong>{pending}</strong> utilisateurs en attente. Un email leur sera envoyé avec leurs identifiants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 hover:bg-white/5">Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={performInviteAll}
            >
              Oui, tout inviter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sidebar Detail (Sheet) */}
      <Sheet open={!!selectedEntry} onOpenChange={(o) => !o && setSelectedEntry(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-hidden flex flex-col p-0 border-l border-white/10 bg-background sm:w-[480px]">
          {selectedEntry && (
            <>
              <SheetHeader className="px-6 py-5 border-b border-white/5">
                <SheetTitle className="text-xl font-bold">Détails Waitlist</SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Infos */}
                <div className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                  <Avatar className="h-14 w-14 border border-white/10">
                    <AvatarFallback className="bg-blue-500/10 text-blue-500 text-lg">
                      {(selectedEntry.full_name || selectedEntry.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 w-full">
                    <h3 className="font-semibold text-lg leading-tight truncate">
                      {selectedEntry.full_name || "Nom non défini"}
                    </h3>
                    <div className="text-sm text-muted-foreground truncate">{selectedEntry.email}</div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-white/70 ring-1 ring-inset ring-white/10">
                        {TYPE_LABELS[selectedEntry.type]?.label ?? selectedEntry.type}
                      </span>
                      {selectedEntry.invited && (
                        <span className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20">
                          <Check className="w-3 h-3 mr-1" />
                          Invité
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground pt-1">
                      Inscrit le {new Date(selectedEntry.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>

                {/* Additional Data */}
                <div className="space-y-4">
                  <h4 className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Données supplémentaires</h4>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-white/50">WhatsApp</span>
                      <div className="text-sm">{selectedEntry.whatsapp || "Non renseigné"}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-white/50">Slug désiré</span>
                      <div className="text-sm font-mono">{selectedEntry.desired_slug ? `${selectedEntry.desired_slug}.ivoire.io` : "Non spécifié"}</div>
                    </div>

                    {selectedEntry.invited && selectedEntry.invited_at && (
                      <div className="space-y-1">
                        <span className="text-xs text-white/50">Date d'invitation</span>
                        <div className="text-sm">
                          {new Date(selectedEntry.invited_at).toLocaleDateString("fr-FR", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    )}

                    {selectedEntry.converted_at && (
                      <div className="space-y-1">
                        <span className="text-xs text-white/50">Converti le</span>
                        <div className="text-sm text-blue-400">
                          {new Date(selectedEntry.converted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Actions Admin</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs font-normal hover:bg-white/5 transition-colors border-white/10"
                      disabled={invitingId === selectedEntry.id}
                      onClick={(e) => {
                        handleInvite(selectedEntry, e);
                      }}
                    >
                      {invitingId === selectedEntry.id ? <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" /> : <UserCheck className="h-4 w-4 text-muted-foreground" />}
                      {selectedEntry.invited ? 'Renvoyer accès' : 'Créer accès'}
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs font-normal hover:bg-white/5 transition-colors border-white/10" onClick={() => window.location.href = `mailto:${selectedEntry.email}`}>
                      <Mail className="h-4 w-4 text-muted-foreground" /> Contacter
                    </Button>
                    <Button
                      variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs font-normal bg-red-500/5 text-red-400 border-red-500/20 hover:bg-red-500/10 col-span-2"
                      onClick={() => setEntryToDelete(selectedEntry)}
                    >
                      <Trash2 className="h-4 w-4" /> Supprimer de la waitlist
                    </Button>
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
