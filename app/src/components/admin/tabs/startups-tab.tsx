"use client";

import type { Startup } from "@/lib/types";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Loader2,
  Rocket,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type StatusFilter = "" | "pending" | "approved" | "rejected" | "suspended";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  suspended: "bg-orange/10 text-orange border-orange/20",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Rejetée",
  suspended: "Suspendue",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status] || ""}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function AdminStartupsTab() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStartups = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/startups?${params}`);
      const json = await res.json();
      setStartups(json.startups || []);
      setTotal(json.total || 0);
    } catch {
      toast.error("Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchStartups(); }, [fetchStartups]);

  async function updateStatus(id: string, status: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/startups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Statut mis à jour : ${STATUS_LABELS[status]}`);
      fetchStartups();
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteStartup(id: string) {
    if (!confirm("Supprimer cette startup ?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/startups/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Startup supprimée.");
      fetchStartups();
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = search
    ? startups.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.tagline.toLowerCase().includes(search.toLowerCase()))
    : startups;

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Startups</h2>
        <p className="text-muted text-sm mt-1">Gérer les startups de la plateforme</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-white placeholder:text-muted focus:border-orange focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
            className="pl-8 pr-6 py-2 bg-surface border border-border rounded-lg text-sm text-white appearance-none focus:border-orange focus:outline-none"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Rejetées</option>
            <option value="suspended">Suspendues</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Rocket size={48} className="mx-auto text-border mb-4" />
          <p className="text-muted">Aucune startup trouvée.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted border-b border-border">
              <tr>
                <th className="py-3 px-4 font-medium">Startup</th>
                <th className="py-3 px-4 font-medium">Secteur</th>
                <th className="py-3 px-4 font-medium">Étape</th>
                <th className="py-3 px-4 font-medium">Votes</th>
                <th className="py-3 px-4 font-medium">Statut</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-muted text-xs truncate max-w-[200px]">{s.tagline}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted">{s.sector}</td>
                  <td className="py-3 px-4 text-muted">{s.stage}</td>
                  <td className="py-3 px-4 font-mono">{s.upvotes_count}</td>
                  <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      {actionLoading === s.id ? (
                        <Loader2 size={14} className="animate-spin text-muted" />
                      ) : (
                        <>
                          {s.status !== "approved" && (
                            <button onClick={() => updateStatus(s.id, "approved")} className="p-1.5 rounded hover:bg-green-500/10 text-muted hover:text-green-400 transition-colors" title="Approuver">
                              <Check size={14} />
                            </button>
                          )}
                          {s.status !== "rejected" && (
                            <button onClick={() => updateStatus(s.id, "rejected")} className="p-1.5 rounded hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors" title="Rejeter">
                              <X size={14} />
                            </button>
                          )}
                          {s.website_url && (
                            <a href={s.website_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-surface text-muted hover:text-white transition-colors" title="Visiter">
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button onClick={() => deleteStartup(s.id)} className="p-1.5 rounded hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors" title="Supprimer">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted">{total} startup{total > 1 ? "s" : ""}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded border border-border hover:bg-surface disabled:opacity-30 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-muted">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded border border-border hover:bg-surface disabled:opacity-30 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
