"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDynamicFields } from "@/hooks/use-dynamic-fields";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  DollarSign,
  Eye,
  FileText,
  Loader2,
  Plus,
  Rocket,
  Send,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Startup {
  name: string;
  slug: string;
  logo_url?: string;
}

interface DevRequest {
  id: string;
  title: string;
  description: string;
  required_roles: SuggestedRole[];
  budget_min?: number;
  budget_max?: number;
  timeline?: string;
  payment_type?: string;
  status: string;
  admin_notes?: string;
  startup_id: string;
  startup?: Startup;
  created_at: string;
}

interface SuggestedRole {
  role: string;
  justification: string;
  seniority: string;
  estimated_days: number;
}

interface DevQuote {
  id: string;
  dev_request_id: string;
  amount: number;
  timeline?: string;
  scope?: string;
  tech_stack: string[];
  team_composition: TeamMember[];
  payment_schedule: PaymentStep[];
  discount_applied?: number;
  notes?: string;
  status: string;
  created_at: string;
}

interface TeamMember {
  role: string;
  seniority: string;
  count: number;
}

interface PaymentStep {
  label: string;
  percentage: number;
  amount: number;
}

interface DevProject {
  id: string;
  title: string;
  total_amount: number;
  paid_amount: number;
  progress: number;
  status: string;
  milestones: Milestone[];
  startup?: Startup;
  created_at: string;
}

interface Milestone {
  title: string;
  status: string;
  due_date?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: {
    label: "Brouillon",
    color: "text-gray-400 border-gray-500/30 bg-gray-500/10",
  },
  submitted: {
    label: "Soumise",
    color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
  reviewing: {
    label: "En analyse",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  },
  quoted: {
    label: "Devis envoye",
    color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  },
  accepted: {
    label: "Accepte",
    color: "text-green-400 border-green-500/30 bg-green-500/10",
  },
  in_progress: {
    label: "En cours",
    color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
  completed: {
    label: "Termine",
    color: "text-green-400 border-green-500/30 bg-green-500/10",
  },
  cancelled: {
    label: "Annule",
    color: "text-red-400 border-red-500/30 bg-red-500/10",
  },
};

const PROJECT_STATUS_CONFIG: Record<string, { label: string; color: string }> =
{
  planning: {
    label: "Planification",
    color: "text-gray-400 border-gray-500/30 bg-gray-500/10",
  },
  in_progress: {
    label: "En cours",
    color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
  review: {
    label: "En revue",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  },
  completed: {
    label: "Termine",
    color: "text-green-400 border-green-500/30 bg-green-500/10",
  },
  paused: {
    label: "En pause",
    color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  },
  cancelled: {
    label: "Annule",
    color: "text-red-400 border-red-500/30 bg-red-500/10",
  },
};

const ROLE_LABELS_FALLBACK: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Fullstack",
  mobile: "Mobile",
  devops: "DevOps",
  design: "Design",
  data: "Data",
  project_manager: "Chef de projet",
};

const SENIORITY_LABELS_FALLBACK: Record<string, string> = {
  junior: "Junior",
  mid: "Intermediaire",
  senior: "Senior",
};

const TECH_STACK_OPTIONS_FALLBACK = [
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Django",
  "FastAPI",
  "Go",
  "Rust",
  "React Native",
  "Flutter",
  "Swift",
  "Kotlin",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Supabase",
  "Firebase",
  "Tailwind CSS",
  "TypeScript",
];

const PAGE_SIZE = 20;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function AdminDevPipelineTab() {
  const { options: roleOpts } = useDynamicFields("role");
  const { options: seniorityOpts } = useDynamicFields("seniority");
  const { options: skillOpts } = useDynamicFields("skill");
  const ROLE_LABELS: Record<string, string> = roleOpts.length > 0
    ? Object.fromEntries(roleOpts.map((r) => [r.value, r.label]))
    : ROLE_LABELS_FALLBACK;
  const SENIORITY_LABELS: Record<string, string> = seniorityOpts.length > 0
    ? Object.fromEntries(seniorityOpts.map((s) => [s.value, s.label]))
    : SENIORITY_LABELS_FALLBACK;
  const TECH_STACK_OPTIONS = skillOpts.length > 0
    ? skillOpts.map((s) => s.label)
    : TECH_STACK_OPTIONS_FALLBACK;

  // Requests
  const [requests, setRequests] = useState<DevRequest[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Projects
  const [projects, setProjects] = useState<DevProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Detail view
  const [selectedRequest, setSelectedRequest] = useState<DevRequest | null>(
    null
  );
  const [requestQuotes, setRequestQuotes] = useState<DevQuote[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Quote form
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteTimeline, setQuoteTimeline] = useState("");
  const [quoteScope, setQuoteScope] = useState("");
  const [quoteTechStack, setQuoteTechStack] = useState<string[]>([]);
  const [quoteTeam, setQuoteTeam] = useState<TeamMember[]>([]);
  const [quotePaymentSchedule, setQuotePaymentSchedule] = useState<
    PaymentStep[]
  >([]);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoteDiscount, setQuoteDiscount] = useState("");
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Admin notes
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    quoted: 0,
    in_progress: 0,
    completed: 0,
  });

  /* ---- Fetch requests ---- */

  const fetchRequests = useCallback(
    async (p: number, status: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          limit: String(PAGE_SIZE),
        });
        if (status !== "all") params.set("status", status);
        const res = await fetch(`/api/admin/dev-requests?${params}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRequests(data.requests || []);
        setTotalRequests(data.total || 0);

        // Compute stats from all requests (fetch without filter for stats)
        if (status === "all") {
          const allReqs = data.requests || [];
          setStats({
            total: data.total || 0,
            submitted: allReqs.filter(
              (r: DevRequest) => r.status === "submitted"
            ).length,
            quoted: allReqs.filter((r: DevRequest) => r.status === "quoted")
              .length,
            in_progress: allReqs.filter(
              (r: DevRequest) => r.status === "in_progress"
            ).length,
            completed: allReqs.filter(
              (r: DevRequest) => r.status === "completed"
            ).length,
          });
        }
      } catch {
        toast.error("Erreur lors du chargement des demandes");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch("/api/admin/dev-projects");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      toast.error("Erreur lors du chargement des projets");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(page, statusFilter);
    fetchProjects();
  }, [fetchRequests, fetchProjects, page, statusFilter]);

  /* ---- Select request detail ---- */

  async function handleSelectRequest(req: DevRequest) {
    setSelectedRequest(req);
    setAdminNotes(req.admin_notes || "");
    setLoadingDetail(true);
    setShowQuoteForm(false);
    resetQuoteForm();

    try {
      // Fetch quotes for this request
      const res = await fetch(`/api/admin/dev-quotes?dev_request_id=${req.id}`);
      if (res.ok) {
        const data = await res.json();
        setRequestQuotes(data.quotes || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingDetail(false);
    }
  }

  /* ---- Status change ---- */

  async function handleStatusChange(requestId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/dev-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Statut mis a jour : ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
      fetchRequests(page, statusFilter);

      if (selectedRequest?.id === requestId) {
        setSelectedRequest((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch {
      toast.error("Erreur lors du changement de statut");
    }
  }

  /* ---- Save admin notes ---- */

  async function handleSaveNotes() {
    if (!selectedRequest) return;
    setSavingNotes(true);
    try {
      const res = await fetch(
        `/api/admin/dev-requests/${selectedRequest.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ admin_notes: adminNotes }),
        }
      );
      if (!res.ok) throw new Error();
      toast.success("Notes sauvegardees");
    } catch {
      toast.error("Erreur lors de la sauvegarde des notes");
    } finally {
      setSavingNotes(false);
    }
  }

  /* ---- Quote form ---- */

  function resetQuoteForm() {
    setQuoteAmount("");
    setQuoteTimeline("");
    setQuoteScope("");
    setQuoteTechStack([]);
    setQuoteTeam([]);
    setQuotePaymentSchedule([]);
    setQuoteNotes("");
    setQuoteDiscount("");
  }

  function toggleTechStack(tech: string) {
    setQuoteTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  }

  function addTeamMember() {
    setQuoteTeam((prev) => [
      ...prev,
      { role: "fullstack", seniority: "mid", count: 1 },
    ]);
  }

  function updateTeamMember(
    idx: number,
    field: keyof TeamMember,
    value: string | number
  ) {
    setQuoteTeam((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
  }

  function removeTeamMember(idx: number) {
    setQuoteTeam((prev) => prev.filter((_, i) => i !== idx));
  }

  function addPaymentStep() {
    setQuotePaymentSchedule((prev) => [
      ...prev,
      { label: "", percentage: 0, amount: 0 },
    ]);
  }

  function updatePaymentStep(
    idx: number,
    field: keyof PaymentStep,
    value: string | number
  ) {
    setQuotePaymentSchedule((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  }

  function removePaymentStep(idx: number) {
    setQuotePaymentSchedule((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmitQuote() {
    if (!selectedRequest || !quoteAmount) {
      toast.error("Le montant est requis");
      return;
    }

    setSubmittingQuote(true);
    try {
      const res = await fetch("/api/admin/dev-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dev_request_id: selectedRequest.id,
          amount: Number(quoteAmount),
          timeline: quoteTimeline || null,
          scope: quoteScope || null,
          tech_stack: quoteTechStack,
          team_composition: quoteTeam,
          payment_schedule: quotePaymentSchedule,
          discount_applied: quoteDiscount ? Number(quoteDiscount) : null,
          notes: quoteNotes || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Devis cree avec succes !");
      resetQuoteForm();
      setShowQuoteForm(false);

      // Refresh
      handleSelectRequest(selectedRequest);
      fetchRequests(page, statusFilter);
    } catch {
      toast.error("Erreur lors de la creation du devis");
    } finally {
      setSubmittingQuote(false);
    }
  }

  /* ---- Send / accept quote ---- */

  async function handleQuoteStatusChange(quoteId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/dev-quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        newStatus === "sent"
          ? "Devis envoye au client"
          : newStatus === "accepted"
            ? "Devis accepte — projet cree"
            : "Statut du devis mis a jour"
      );
      if (selectedRequest) {
        handleSelectRequest(selectedRequest);
      }
      fetchRequests(page, statusFilter);
      fetchProjects();
    } catch {
      toast.error("Erreur lors de la mise a jour du devis");
    }
  }

  /* ---- Render ---- */

  const totalPages = Math.max(1, Math.ceil(totalRequests / PAGE_SIZE));

  // Detail view
  if (selectedRequest) {
    const statusCfg =
      STATUS_CONFIG[selectedRequest.status] || STATUS_CONFIG.draft;

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedRequest(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au pipeline
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold">{selectedRequest.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              {selectedRequest.startup && (
                <span className="text-sm text-muted-foreground">
                  {selectedRequest.startup.name}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(selectedRequest.created_at).toLocaleDateString(
                  "fr-FR",
                  { day: "2-digit", month: "long", year: "numeric" }
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs border ${statusCfg.color}`}>
              {statusCfg.label}
            </Badge>
            <NativeSelect
              value={selectedRequest.status}
              onValueChange={(v) =>
                handleStatusChange(selectedRequest.id, v)
              }
              className="w-40"
            >
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <NativeSelectOption key={key} value={key}>
                  {cfg.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        </div>

        {/* Description */}
        <Card
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {selectedRequest.description}
            </p>
          </CardContent>
        </Card>

        {/* Request info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(selectedRequest.budget_min || selectedRequest.budget_max) && (
            <Card
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign
                    className="h-4 w-4"
                    style={{ color: "var(--color-orange)" }}
                  />
                  <span className="text-xs text-muted-foreground">
                    Budget
                  </span>
                </div>
                <p className="text-sm font-bold">
                  {selectedRequest.budget_min
                    ? formatCurrency(selectedRequest.budget_min)
                    : "?"}{" "}
                  -{" "}
                  {selectedRequest.budget_max
                    ? formatCurrency(selectedRequest.budget_max)
                    : "?"}
                </p>
              </CardContent>
            </Card>
          )}
          {selectedRequest.timeline && (
            <Card
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-muted-foreground">
                    Delai
                  </span>
                </div>
                <p className="text-sm font-bold">
                  {selectedRequest.timeline}
                </p>
              </CardContent>
            </Card>
          )}
          {selectedRequest.payment_type && (
            <Card
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-muted-foreground">
                    Paiement
                  </span>
                </div>
                <p className="text-sm font-bold">
                  {selectedRequest.payment_type}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Required roles */}
        {selectedRequest.required_roles &&
          selectedRequest.required_roles.length > 0 && (
            <Card
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Roles techniques demandes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.required_roles.map(
                    (role: SuggestedRole, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                        style={{ background: "var(--color-background)" }}
                      >
                        <span className="font-medium">
                          {ROLE_LABELS[role.role] || role.role}
                        </span>
                        <Badge className="text-[10px] border border-border bg-transparent">
                          {SENIORITY_LABELS[role.seniority] || role.seniority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ~{role.estimated_days}j
                        </span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Admin notes */}
        <Card
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={adminNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setAdminNotes(e.target.value)
              }
              placeholder="Ajouter des notes internes..."
              className="min-h-[80px]"
              style={{
                background: "var(--color-background)",
                border: "1px solid var(--color-border)",
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveNotes}
              disabled={savingNotes}
            >
              {savingNotes && (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              )}
              Sauvegarder les notes
            </Button>
          </CardContent>
        </Card>

        {/* Existing quotes */}
        <Card
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Devis
              </CardTitle>
              {!showQuoteForm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuoteForm(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Creer un devis
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingDetail ? (
              <div className="py-6 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : requestQuotes.length === 0 && !showQuoteForm ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucun devis pour cette demande.
              </div>
            ) : (
              <div className="space-y-3">
                {requestQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="rounded-lg border border-border p-4 space-y-3"
                    style={{ background: "var(--color-background)" }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold" style={{ color: "var(--color-orange)" }}>
                          {formatCurrency(quote.amount)}
                        </p>
                        {quote.timeline && (
                          <p className="text-xs text-muted-foreground">
                            Delai : {quote.timeline}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-xs border ${quote.status === "draft"
                            ? "text-gray-400 border-gray-500/30 bg-gray-500/10"
                            : quote.status === "sent"
                              ? "text-blue-400 border-blue-500/30 bg-blue-500/10"
                              : quote.status === "accepted"
                                ? "text-green-400 border-green-500/30 bg-green-500/10"
                                : "text-red-400 border-red-500/30 bg-red-500/10"
                            }`}
                        >
                          {quote.status === "draft"
                            ? "Brouillon"
                            : quote.status === "sent"
                              ? "Envoye"
                              : quote.status === "accepted"
                                ? "Accepte"
                                : quote.status === "rejected"
                                  ? "Refuse"
                                  : quote.status}
                        </Badge>
                        {quote.status === "draft" && (
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() =>
                              handleQuoteStatusChange(quote.id, "sent")
                            }
                          >
                            <Send className="h-3 w-3" />
                            Envoyer
                          </Button>
                        )}
                        {quote.status === "sent" && (
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() =>
                              handleQuoteStatusChange(quote.id, "accepted")
                            }
                          >
                            <Check className="h-3 w-3" />
                            Marquer accepte
                          </Button>
                        )}
                      </div>
                    </div>

                    {quote.scope && (
                      <p className="text-sm text-muted-foreground">
                        {quote.scope}
                      </p>
                    )}

                    {quote.tech_stack && quote.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {quote.tech_stack.map((tech) => (
                          <Badge
                            key={tech}
                            className="text-[10px] border border-border bg-transparent"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {quote.team_composition &&
                      quote.team_composition.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Equipe :{" "}
                          {quote.team_composition
                            .map(
                              (m: TeamMember) =>
                                `${m.count}x ${ROLE_LABELS[m.role] || m.role} (${SENIORITY_LABELS[m.seniority] || m.seniority})`
                            )
                            .join(", ")}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}

            {/* Quote creation form */}
            {showQuoteForm && (
              <div
                className="rounded-xl border border-orange-400/30 p-4 space-y-4"
                style={{ background: "var(--color-background)" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Nouveau devis</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      resetQuoteForm();
                      setShowQuoteForm(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="q-amount">Montant (FCFA)</Label>
                  <Input
                    id="q-amount"
                    type="number"
                    min={0}
                    value={quoteAmount}
                    onChange={(e) => setQuoteAmount(e.target.value)}
                    placeholder="1 500 000"
                  />
                </div>

                {/* Timeline */}
                <div className="space-y-1.5">
                  <Label htmlFor="q-timeline">Delai</Label>
                  <Input
                    id="q-timeline"
                    value={quoteTimeline}
                    onChange={(e) => setQuoteTimeline(e.target.value)}
                    placeholder="Ex: 3 mois"
                  />
                </div>

                {/* Scope */}
                <div className="space-y-1.5">
                  <Label htmlFor="q-scope">Perimetre</Label>
                  <Textarea
                    id="q-scope"
                    value={quoteScope}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setQuoteScope(e.target.value)
                    }
                    placeholder="Decrivez le perimetre du projet..."
                    className="min-h-[80px]"
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                </div>

                {/* Tech stack */}
                <div className="space-y-1.5">
                  <Label>Stack technique</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {TECH_STACK_OPTIONS.map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleTechStack(tech)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${quoteTechStack.includes(tech)
                          ? "border-orange-400 bg-orange-500/15 text-orange-400"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team composition */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Composition de l&apos;equipe</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addTeamMember}
                      className="h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  {quoteTeam.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg border border-border p-2"
                      style={{ background: "var(--color-surface)" }}
                    >
                      <select
                        value={member.role}
                        onChange={(e) =>
                          updateTeamMember(idx, "role", e.target.value)
                        }
                        className="flex-1 px-2 py-1 rounded bg-background border border-border text-xs focus:outline-none"
                      >
                        {Object.entries(ROLE_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={member.seniority}
                        onChange={(e) =>
                          updateTeamMember(idx, "seniority", e.target.value)
                        }
                        className="w-28 px-2 py-1 rounded bg-background border border-border text-xs focus:outline-none"
                      >
                        {Object.entries(SENIORITY_LABELS).map(
                          ([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                      <Input
                        type="number"
                        min={1}
                        value={member.count}
                        onChange={(e) =>
                          updateTeamMember(
                            idx,
                            "count",
                            Number(e.target.value) || 1
                          )
                        }
                        className="w-16 h-7 text-xs"
                        placeholder="Nb"
                      />
                      <button
                        onClick={() => removeTeamMember(idx)}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Payment schedule */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Echeancier de paiement</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addPaymentStep}
                      className="h-7"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  {quotePaymentSchedule.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg border border-border p-2"
                      style={{ background: "var(--color-surface)" }}
                    >
                      <Input
                        value={step.label}
                        onChange={(e) =>
                          updatePaymentStep(idx, "label", e.target.value)
                        }
                        className="flex-1 h-7 text-xs"
                        placeholder="Ex: Acompte"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={step.percentage}
                        onChange={(e) =>
                          updatePaymentStep(
                            idx,
                            "percentage",
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-16 h-7 text-xs"
                        placeholder="%"
                      />
                      <Input
                        type="number"
                        min={0}
                        value={step.amount}
                        onChange={(e) =>
                          updatePaymentStep(
                            idx,
                            "amount",
                            Number(e.target.value) || 0
                          )
                        }
                        className="w-28 h-7 text-xs"
                        placeholder="Montant"
                      />
                      <button
                        onClick={() => removePaymentStep(idx)}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Discount */}
                <div className="space-y-1.5">
                  <Label htmlFor="q-discount">Remise (%)</Label>
                  <Input
                    id="q-discount"
                    type="number"
                    min={0}
                    max={100}
                    value={quoteDiscount}
                    onChange={(e) => setQuoteDiscount(e.target.value)}
                    placeholder="0"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="q-notes">Notes</Label>
                  <Textarea
                    id="q-notes"
                    value={quoteNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setQuoteNotes(e.target.value)
                    }
                    placeholder="Notes internes..."
                    className="min-h-[60px]"
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    onClick={handleSubmitQuote}
                    disabled={submittingQuote}
                    style={{
                      background: "var(--color-orange)",
                      color: "white",
                    }}
                  >
                    {submittingQuote ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Creer le devis
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetQuoteForm();
                      setShowQuoteForm(false);
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pipeline view
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Code2
          className="h-5 w-5"
          style={{ color: "var(--color-orange)" }}
        />
        Pipeline Dev Outsourcing
      </h2>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {
            icon: FileText,
            label: "Total demandes",
            value: stats.total,
            color: "#3b82f6",
          },
          {
            icon: Clock,
            label: "En attente",
            value: stats.submitted,
            color: "#eab308",
          },
          {
            icon: DollarSign,
            label: "Devis envoyes",
            value: stats.quoted,
            color: "#f97316",
          },
          {
            icon: Rocket,
            label: "En cours",
            value: stats.in_progress,
            color: "#3b82f6",
          },
          {
            icon: CheckCircle2,
            label: "Termines",
            value: stats.completed,
            color: "#10b981",
          },
        ].map((m) => (
          <Card
            key={m.label}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <m.icon className="h-4 w-4" style={{ color: m.color }} />
                <span className="text-xs text-muted-foreground">
                  {m.label}
                </span>
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: m.color }}
              >
                {m.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <NativeSelect
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          className="w-48"
        >
          <NativeSelectOption value="all">Tous les statuts</NativeSelectOption>
          <NativeSelectOption value="submitted">Soumises</NativeSelectOption>
          <NativeSelectOption value="reviewing">En analyse</NativeSelectOption>
          <NativeSelectOption value="quoted">
            Devis envoye
          </NativeSelectOption>
          <NativeSelectOption value="accepted">Acceptees</NativeSelectOption>
          <NativeSelectOption value="in_progress">
            En cours
          </NativeSelectOption>
          <NativeSelectOption value="completed">
            Terminees
          </NativeSelectOption>
          <NativeSelectOption value="cancelled">
            Annulees
          </NativeSelectOption>
        </NativeSelect>
      </div>

      {/* Requests table */}
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
                  <th className="text-left p-3 pl-4">Startup</th>
                  <th className="text-left p-3">Titre</th>
                  <th className="text-left p-3">Budget</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      Chargement...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      Aucune demande trouvee
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => {
                    const statusCfg =
                      STATUS_CONFIG[req.status] || STATUS_CONFIG.draft;
                    return (
                      <tr
                        key={req.id}
                        className="border-b border-border/50 hover:bg-white/2 transition-colors"
                      >
                        <td className="p-3 pl-4">
                          <div className="flex items-center gap-2">
                            {req.startup?.logo_url ? (
                              <img
                                src={req.startup.logo_url}
                                alt=""
                                className="w-7 h-7 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{
                                  background: "var(--color-orange)",
                                  color: "white",
                                }}
                              >
                                {(req.startup?.name || "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm font-medium truncate max-w-[120px]">
                              {req.startup?.name || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-sm truncate max-w-[200px] block">
                            {req.title}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-xs">
                          {req.budget_min || req.budget_max ? (
                            <span style={{ color: "var(--color-orange)" }}>
                              {req.budget_min
                                ? formatCurrency(req.budget_min)
                                : "?"}{" "}
                              -{" "}
                              {req.budget_max
                                ? formatCurrency(req.budget_max)
                                : "?"}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Non defini
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge
                            className={`text-xs border ${statusCfg.color}`}
                          >
                            {statusCfg.label}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {new Date(req.created_at).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td className="p-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleSelectRequest(req)}
                          >
                            <Eye className="h-3 w-3" />
                            Voir
                          </Button>
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
        <span>
          Page {page} / {totalPages} — {totalRequests} resultat
          {totalRequests > 1 ? "s" : ""}
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

      {/* ============================================================ */}
      {/*  Projects overview                                            */}
      {/* ============================================================ */}
      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Projets en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingProjects ? (
            <div className="py-6 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Aucun projet en cours
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const statusCfg =
                  PROJECT_STATUS_CONFIG[project.status] ||
                  PROJECT_STATUS_CONFIG.planning;
                return (
                  <div
                    key={project.id}
                    className="rounded-xl border border-border p-4 space-y-3"
                    style={{ background: "var(--color-background)" }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">
                            {project.title}
                          </p>
                          {project.startup && (
                            <span className="text-xs text-muted-foreground">
                              ({project.startup.name})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge
                            className={`text-xs border ${statusCfg.color}`}
                          >
                            {statusCfg.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(project.paid_amount)} /{" "}
                            {formatCurrency(project.total_amount)}
                          </span>
                        </div>
                      </div>
                      <span
                        className="text-lg font-bold tabular-nums"
                        style={{ color: "var(--color-orange)" }}
                      >
                        {project.progress}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${project.progress}%`,
                          background:
                            "linear-gradient(90deg, var(--color-orange), #f97316)",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>

                    {/* Payment progress */}
                    {project.total_amount > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3 w-3 text-green-400" />
                        <span className="text-muted-foreground">
                          Paye :{" "}
                          {(
                            (project.paid_amount / project.total_amount) *
                            100
                          ).toFixed(0)}
                          % du total
                        </span>
                      </div>
                    )}

                    {/* Milestones */}
                    {project.milestones && project.milestones.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Jalons
                        </p>
                        {project.milestones.map(
                          (milestone: Milestone, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-xs"
                            >
                              <div
                                className={`w-2 h-2 rounded-full shrink-0 ${milestone.status === "completed"
                                  ? "bg-green-400"
                                  : milestone.status === "in_progress"
                                    ? "bg-blue-400"
                                    : "bg-gray-500"
                                  }`}
                              />
                              <span className="truncate">
                                {milestone.title}
                              </span>
                              {milestone.due_date && (
                                <span className="text-muted-foreground ml-auto shrink-0">
                                  <CalendarDays className="h-3 w-3 inline mr-0.5" />
                                  {new Date(
                                    milestone.due_date
                                  ).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "short",
                                  })}
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
