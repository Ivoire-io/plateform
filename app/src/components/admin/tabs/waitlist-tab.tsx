"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/select";
import { Download, Mail, Search, Trash2, UserCheck } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);

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
      const matchSearch =
        !s ||
        (w.full_name ?? "").toLowerCase().includes(s) ||
        w.email.toLowerCase().includes(s) ||
        (w.desired_slug ?? "").toLowerCase().includes(s);
      const matchType = typeFilter === "all" || w.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [entries, search, typeFilter]);

  const total = entries.length;
  const invited = entries.filter((e) => e.invited).length;
  const pending = total - invited;
  const conversionRate = total > 0 ? Math.round((invited / total) * 100) : 0;

  async function handleInvite(entry: WaitlistEntry) {
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
    }
  }

  function handleDelete(entry: WaitlistEntry) {
    toast.error(`${entry.full_name ?? entry.email} retiré de la waitlist`);
  }

  async function handleInviteAll() {
    try {
      const res = await fetch("/api/admin/waitlist/invite-all", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "invite_all_failed");
      toast.success(`Conversions: ${data?.data?.converted ?? 0} / ${data?.data?.requested ?? 0}`);
      if (data?.data?.note) toast.info(data.data.note);
      loadWaitlist();
    } catch {
      toast.error("Erreur lors de l’invitation en masse");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">
          Waitlist ({loading ? "…" : pending} en attente)
        </h2>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" className="gap-2" style={{ background: "var(--color-green)", color: "white" }} onClick={handleInviteAll}>
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
                ) : filtered.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                    <td className="p-3 pl-4 font-medium">{entry.full_name ?? "—"}</td>
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
                        <Button size="sm" className="h-7 w-7 p-0" style={{ background: "var(--color-green)", color: "white" }} onClick={() => handleInvite(entry)}>
                          <UserCheck className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => handleDelete(entry)}>
                          <Trash2 className="h-3 w-3" />
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
    </div>
  );
}
