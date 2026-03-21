"use client";

import { Badge } from "@/components/ui/badge";
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Pencil,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SubscriptionProfile {
  full_name: string;
  slug: string;
  email: string;
  avatar_url: string | null;
  type: string;
}

interface Subscription {
  id: string;
  profile_id: string;
  plan: string;
  status: string;
  payment_method: string | null;
  amount: number | null;
  currency: string | null;
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string | null;
  profile: SubscriptionProfile | null;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 20;

const PLAN_OPTIONS = ["free", "starter", "student", "pro", "enterprise"] as const;
const STATUS_OPTIONS = ["active", "pending", "expired", "cancelled"] as const;

const PLAN_BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  free: { bg: "rgba(160,160,160,0.15)", text: "#a0a0a0", border: "rgba(160,160,160,0.30)" },
  starter: { bg: "rgba(59,130,246,0.15)", text: "#3b82f6", border: "rgba(59,130,246,0.30)" },
  student: { bg: "rgba(139,92,246,0.15)", text: "#8b5cf6", border: "rgba(139,92,246,0.30)" },
  pro: { bg: "rgba(249,115,22,0.15)", text: "#f97316", border: "rgba(249,115,22,0.30)" },
  enterprise: { bg: "rgba(234,179,8,0.15)", text: "#eab308", border: "rgba(234,179,8,0.30)" },
};

const STATUS_BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  active: { bg: "rgba(34,197,94,0.15)", text: "#22c55e", border: "rgba(34,197,94,0.30)" },
  pending: { bg: "rgba(234,179,8,0.15)", text: "#eab308", border: "rgba(234,179,8,0.30)" },
  expired: { bg: "rgba(239,68,68,0.15)", text: "#ef4444", border: "rgba(239,68,68,0.30)" },
  cancelled: { bg: "rgba(160,160,160,0.15)", text: "#a0a0a0", border: "rgba(160,160,160,0.30)" },
};

const PLAN_LABELS: Record<string, string> = {
  free: "Gratuit",
  starter: "Starter",
  student: "Etudiant",
  pro: "Pro",
  enterprise: "Enterprise",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  pending: "En attente",
  expired: "Expiré",
  cancelled: "Annulé",
};

/** Monthly recurring contribution per plan (FCFA) */
const MRR_PER_PLAN: Record<string, number> = {
  pro: Math.round(35000 / 12),       // 2917
  enterprise: Math.round(150000 / 12), // 12500
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatFCFA(value: number): string {
  return value.toLocaleString("fr-FR") + " FCFA";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function planBadge(plan: string) {
  const style = PLAN_BADGE_STYLES[plan] ?? PLAN_BADGE_STYLES.free;
  return (
    <Badge
      className="text-xs"
      style={{
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {PLAN_LABELS[plan] ?? plan}
    </Badge>
  );
}

function statusBadge(status: string) {
  const style = STATUS_BADGE_STYLES[status] ?? STATUS_BADGE_STYLES.cancelled;
  return (
    <Badge
      className="text-xs"
      style={{
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AdminSubscriptionsTab() {
  /* ---- state ---- */
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  /* edit dialog */
  const [editSub, setEditSub] = useState<Subscription | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

  /* ---- fetch ---- */
  const fetchSubscriptions = useCallback(
    async (p: number, plan: string, status: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          limit: String(PAGE_SIZE),
        });
        if (plan !== "all") params.set("plan", plan);
        if (status !== "all") params.set("status", status);

        const res = await fetch(`/api/admin/subscriptions?${params}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSubscriptions(data.subscriptions ?? []);
        setTotal(data.total ?? 0);
      } catch {
        toast.error("Erreur lors du chargement des abonnements");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSubscriptions(page, planFilter, statusFilter);
  }, [fetchSubscriptions, page, planFilter, statusFilter]);

  /* ---- derived stats ---- */
  const stats = useMemo(() => {
    const activeList = subscriptions.filter((s) => s.status === "active");
    const activeCount = activeList.length;

    const mrr = activeList.reduce((sum, s) => {
      return sum + (MRR_PER_PLAN[s.plan] ?? 0);
    }, 0);

    const arr = mrr * 12;

    const totalRevenue = subscriptions.reduce((sum, s) => {
      return sum + (s.amount ?? 0);
    }, 0);

    return { mrr, arr, activeCount, totalRevenue };
  }, [subscriptions]);

  /* plan breakdown */
  const planBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of subscriptions) {
      counts[s.plan] = (counts[s.plan] ?? 0) + 1;
    }
    const maxCount = Math.max(1, ...Object.values(counts));
    return PLAN_OPTIONS.map((plan) => ({
      plan,
      label: PLAN_LABELS[plan] ?? plan,
      count: counts[plan] ?? 0,
      pct: Math.round(((counts[plan] ?? 0) / maxCount) * 100),
    }));
  }, [subscriptions]);

  /* ---- actions ---- */
  function openEdit(sub: Subscription) {
    setEditSub(sub);
    setEditPlan(sub.plan);
    setEditStatus(sub.status);
  }

  async function saveEdit() {
    if (!editSub) return;
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (editPlan !== editSub.plan) body.plan = editPlan;
      if (editStatus !== editSub.status) body.status = editStatus;

      if (Object.keys(body).length === 0) {
        toast.info("Aucune modification detectee");
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/admin/subscriptions/${editSub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error ?? "Erreur serveur");
      }

      toast.success("Abonnement mis a jour");
      setEditSub(null);
      fetchSubscriptions(page, planFilter, statusFilter);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur lors de la mise a jour";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /* ---- render ---- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Abonnements & Revenus</h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => fetchSubscriptions(page, planFilter, statusFilter)}
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* ---- Stats cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "MRR",
            value: formatFCFA(stats.mrr),
            icon: TrendingUp,
            color: "var(--color-orange)",
          },
          {
            label: "ARR projete",
            value: formatFCFA(stats.arr),
            icon: Wallet,
            color: "#10b981",
          },
          {
            label: "Abonnes actifs",
            value: String(stats.activeCount),
            icon: Users,
            color: "#3b82f6",
          },
          {
            label: "Revenus total",
            value: formatFCFA(stats.totalRevenue),
            icon: CreditCard,
            color: "#8b5cf6",
          },
        ].map((card) => (
          <Card
            key={card.label}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <card.icon
                className="h-5 w-5 shrink-0"
                style={{ color: card.color }}
              />
              <div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: card.color }}
                >
                  {loading ? "..." : card.value}
                </div>
                <div className="text-xs text-muted-foreground">{card.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---- Plan breakdown ---- */}
      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Repartition par plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              Chargement...
            </div>
          ) : (
            planBreakdown.map((item) => {
              const style = PLAN_BADGE_STYLES[item.plan] ?? PLAN_BADGE_STYLES.free;
              return (
                <div key={item.plan} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {item.count} abonne{item.count > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.pct}%`,
                        background: style.text,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* ---- Filters ---- */}
      <div className="flex flex-wrap gap-3">
        <NativeSelect
          value={planFilter}
          onValueChange={(v) => {
            setPlanFilter(v);
            setPage(1);
          }}
          className="w-40"
        >
          <NativeSelectOption value="all">Tous les plans</NativeSelectOption>
          {PLAN_OPTIONS.map((p) => (
            <NativeSelectOption key={p} value={p}>
              {PLAN_LABELS[p] ?? p}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          className="w-40"
        >
          <NativeSelectOption value="all">Tous les statuts</NativeSelectOption>
          {STATUS_OPTIONS.map((s) => (
            <NativeSelectOption key={s} value={s}>
              {STATUS_LABELS[s] ?? s}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {/* ---- Table ---- */}
      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left p-3 pl-4">Utilisateur</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Methode</th>
                  <th className="text-left p-3">Montant</th>
                  <th className="text-left p-3">Debut</th>
                  <th className="text-left p-3">Expiration</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      Chargement...
                    </td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      Aucun abonnement trouve
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-border/50 hover:bg-white/2 transition-colors"
                    >
                      {/* User */}
                      <td className="p-3 pl-4">
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {sub.profile?.full_name ?? "—"}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {sub.profile?.email ?? sub.profile_id}
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="p-3">{planBadge(sub.plan)}</td>

                      {/* Status */}
                      <td className="p-3">{statusBadge(sub.status)}</td>

                      {/* Payment method */}
                      <td className="p-3 text-xs text-muted-foreground">
                        {sub.payment_method ?? "—"}
                      </td>

                      {/* Amount */}
                      <td
                        className="p-3 text-sm font-medium"
                        style={{ color: "var(--color-orange)" }}
                      >
                        {sub.amount != null
                          ? sub.amount.toLocaleString("fr-FR") +
                          " " +
                          (sub.currency ?? "FCFA")
                          : "—"}
                      </td>

                      {/* Start date */}
                      <td className="p-3 text-xs text-muted-foreground">
                        {formatDate(sub.started_at)}
                      </td>

                      {/* Expiration */}
                      <td className="p-3 text-xs text-muted-foreground">
                        {formatDate(sub.expires_at)}
                      </td>

                      {/* Actions */}
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => openEdit(sub)}
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

      {/* ---- Pagination ---- */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Page {page} / {totalPages} — {total} resultat
          {total > 1 ? "s" : ""}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
            const p = Math.max(
              1,
              Math.min(
                page - 1 + i,
                totalPages - Math.min(3, totalPages) + i + 1
              )
            );
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
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ---- Edit dialog ---- */}
      <Dialog open={!!editSub} onOpenChange={(o) => !o && setEditSub(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;abonnement</DialogTitle>
            <DialogDescription>
              {editSub?.profile?.full_name ?? "Utilisateur"} —{" "}
              {editSub?.profile?.email ?? ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Plan select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                PLAN
              </label>
              <NativeSelect
                value={editPlan}
                onValueChange={setEditPlan}
                className="w-full"
              >
                {PLAN_OPTIONS.map((p) => (
                  <NativeSelectOption key={p} value={p}>
                    {PLAN_LABELS[p] ?? p}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            {/* Status select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                STATUT
              </label>
              <NativeSelect
                value={editStatus}
                onValueChange={setEditStatus}
                className="w-full"
              >
                {STATUS_OPTIONS.map((s) => (
                  <NativeSelectOption key={s} value={s}>
                    {STATUS_LABELS[s] ?? s}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditSub(null)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              style={{ background: "var(--color-orange)" }}
              onClick={saveEdit}
              disabled={saving}
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
