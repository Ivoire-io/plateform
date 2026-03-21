"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  Eye,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Payment {
  id: string;
  created_at: string;
  user_name: string;
  user_email: string;
  payment_method: string;
  amount: number;
  status: string;
  proof_url?: string | null;
}

interface PaymentsResponse {
  payments: Payment[];
  total: number;
  stats: {
    total_payments: number;
    pending_count: number;
    total_revenue: number;
    failed_count: number;
  };
}

const PAGE_SIZE = 15;

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30", label: "En attente" },
  completed: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30", label: "Termine" },
  failed: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Echoue" },
  refunded: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", label: "Rembourse" },
};

const METHOD_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  manual: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", label: "Manuel" },
  paypal: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", label: "PayPal" },
};

export function AdminPaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total_payments: 0, pending_count: 0, total_revenue: 0, failed_count: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Review state
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchPayments = useCallback(async (p: number, status: string, method: string, search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
      if (status !== "all") params.set("status", status);
      if (method !== "all") params.set("payment_method", method);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/payments?${params}`);
      if (!res.ok) throw new Error();
      const data: PaymentsResponse = await res.json();
      setPayments(data.payments ?? []);
      setTotal(data.total ?? 0);
      setStats(data.stats ?? { total_payments: 0, pending_count: 0, total_revenue: 0, failed_count: 0 });
    } catch {
      toast.error("Erreur lors du chargement des paiements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments(page, statusFilter, methodFilter, searchQuery);
  }, [fetchPayments, page, statusFilter, methodFilter, searchQuery]);

  async function handleReview(paymentId: string, action: "approve" | "reject") {
    setReviewLoading(true);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: reviewNotes }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(action === "approve" ? "Paiement approuve avec succes" : "Paiement refuse");
      setReviewingId(null);
      setReviewAction(null);
      setReviewNotes("");
      fetchPayments(page, statusFilter, methodFilter, searchQuery);
    } catch {
      toast.error("Erreur lors du traitement du paiement");
    } finally {
      setReviewLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Gestion des Paiements</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: CreditCard, label: "Total paiements", value: stats.total_payments.toLocaleString("fr-FR"), color: "#3b82f6" },
          { icon: Loader2, label: "En attente de revue", value: stats.pending_count.toLocaleString("fr-FR"), color: "#eab308" },
          { icon: DollarSign, label: "Revenu total", value: `${stats.total_revenue.toLocaleString("fr-FR")} FCFA`, color: "#10b981" },
          { icon: X, label: "Echoues", value: stats.failed_count.toLocaleString("fr-FR"), color: "#ef4444" },
        ].map((m) => (
          <Card key={m.label} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <m.icon className="h-4 w-4" style={{ color: m.color }} />
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <NativeSelect value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }} className="w-40">
          <NativeSelectOption value="all">Tous les statuts</NativeSelectOption>
          <NativeSelectOption value="pending">En attente</NativeSelectOption>
          <NativeSelectOption value="completed">Termine</NativeSelectOption>
          <NativeSelectOption value="failed">Echoue</NativeSelectOption>
        </NativeSelect>
        <NativeSelect value={methodFilter} onValueChange={(v) => { setMethodFilter(v); setPage(1); }} className="w-40">
          <NativeSelectOption value="all">Toutes methodes</NativeSelectOption>
          <NativeSelectOption value="manual">Manuel</NativeSelectOption>
          <NativeSelectOption value="paypal">PayPal</NativeSelectOption>
        </NativeSelect>
      </div>

      {/* Table des paiements */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left p-3 pl-4">Date</th>
                  <th className="text-left p-3">Utilisateur</th>
                  <th className="text-left p-3">Methode</th>
                  <th className="text-left p-3">Montant</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      Chargement...
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">Aucun paiement trouve</td>
                  </tr>
                ) : (
                  payments.map((payment) => {
                    const statusStyle = STATUS_STYLES[payment.status] ?? STATUS_STYLES.pending;
                    const methodStyle = METHOD_STYLES[payment.payment_method] ?? METHOD_STYLES.manual;
                    const isReviewing = reviewingId === payment.id;

                    return (
                      <tr key={payment.id} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                        <td className="p-3 pl-4 text-xs text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </td>
                        <td className="p-3">
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{payment.user_name}</div>
                            <div className="text-xs text-muted-foreground">{payment.user_email}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={`text-xs ${methodStyle.bg} ${methodStyle.text} ${methodStyle.border}`}>
                            {methodStyle.label}
                          </Badge>
                        </td>
                        <td className="p-3 font-semibold" style={{ color: "var(--color-orange)" }}>
                          {payment.amount.toLocaleString("fr-FR")} FCFA
                        </td>
                        <td className="p-3">
                          <Badge className={`text-xs ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            {statusStyle.label}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {payment.status === "pending" && payment.payment_method === "manual" ? (
                            <div className="space-y-2">
                              <div className="flex gap-1">
                                {payment.proof_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs gap-1"
                                    onClick={() => window.open(payment.proof_url!, "_blank")}
                                  >
                                    <Eye className="h-3 w-3" /> Voir preuve
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => { setReviewingId(payment.id); setReviewAction("approve"); setReviewNotes(""); }}
                                >
                                  <Check className="h-3 w-3" /> Approuver
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 text-xs gap-1 bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => { setReviewingId(payment.id); setReviewAction("reject"); setReviewNotes(""); }}
                                >
                                  <X className="h-3 w-3" /> Refuser
                                </Button>
                              </div>

                              {isReviewing && reviewAction && (
                                <div className="space-y-2 p-2 rounded-lg" style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}>
                                  <Label className="text-xs text-muted-foreground">
                                    {reviewAction === "approve" ? "Notes d'approbation" : "Raison du refus"}
                                  </Label>
                                  <Textarea
                                    className="text-xs resize-none min-h-[60px]"
                                    placeholder="Ajouter des notes (optionnel)..."
                                    rows={2}
                                    value={reviewNotes}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewNotes(e.target.value)}
                                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                                  />
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs flex-1"
                                      disabled={reviewLoading}
                                      style={{ background: reviewAction === "approve" ? "#16a34a" : "#dc2626" }}
                                      onClick={() => handleReview(payment.id, reviewAction)}
                                    >
                                      {reviewLoading && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                                      Confirmer
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs"
                                      onClick={() => { setReviewingId(null); setReviewAction(null); setReviewNotes(""); }}
                                    >
                                      Annuler
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Page {page} / {totalPages} — {total} resultat{total > 1 ? "s" : ""}</span>
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
    </div>
  );
}
