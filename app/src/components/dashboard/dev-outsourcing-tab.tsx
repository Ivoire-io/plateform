"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDynamicFields } from "@/hooks/use-dynamic-fields";
import {
  ArrowLeft,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Clock,
  Code2,
  DollarSign,
  FileText,
  Loader2,
  Plus,
  Rocket,
  Send,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DevRequest {
  id: string;
  title: string;
  description: string;
  cahier_charges_ref?: string;
  required_roles: SuggestedRole[];
  budget_min?: number;
  budget_max?: number;
  timeline?: string;
  payment_type?: string;
  status: string;
  created_at: string;
}

interface DevProject {
  id: string;
  title: string;
  total_amount: number;
  paid_amount: number;
  progress: number;
  status: string;
  milestones: Milestone[];
  created_at: string;
}

interface Milestone {
  title: string;
  status: string;
  due_date?: string;
}

interface SuggestedRole {
  role: string;
  justification: string;
  seniority: string;
  estimated_days: number;
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
    label: "En cours d'analyse",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  },
  quoted: {
    label: "Devis recu",
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

const TIMELINE_OPTIONS = [
  { value: "1-2_mois", label: "1-2 mois" },
  { value: "3-6_mois", label: "3-6 mois" },
  { value: "6-12_mois", label: "6-12 mois" },
];

const PAYMENT_OPTIONS = [
  { value: "unique", label: "Paiement unique" },
  { value: "echeancier", label: "Echeancier" },
  { value: "partenariat", label: "Partenariat" },
];

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

/* ------------------------------------------------------------------ */
/*  Helper components                                                  */
/* ------------------------------------------------------------------ */

function SectionCard({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            {title}
          </CardTitle>
          {action}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

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

export function DevOutsourcingTab({ startupId, onNavigate }: { startupId: string; onNavigate?: (tab: string) => void }) {
  const { options: roleOpts } = useDynamicFields("role");
  const { options: seniorityOpts } = useDynamicFields("seniority");
  const ROLE_LABELS: Record<string, string> = roleOpts.length > 0
    ? Object.fromEntries(roleOpts.map((r) => [r.value, r.label]))
    : ROLE_LABELS_FALLBACK;
  const SENIORITY_LABELS: Record<string, string> = seniorityOpts.length > 0
    ? Object.fromEntries(seniorityOpts.map((s) => [s.value, s.label]))
    : SENIORITY_LABELS_FALLBACK;

  const [requests, setRequests] = useState<DevRequest[]>([]);
  const [projects, setProjects] = useState<DevProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasStartup, setHasStartup] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analyzingRoles, setAnalyzingRoles] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formBudgetMin, setFormBudgetMin] = useState("");
  const [formBudgetMax, setFormBudgetMax] = useState("");
  const [formTimeline, setFormTimeline] = useState("");
  const [formPaymentType, setFormPaymentType] = useState("");
  const [suggestedRoles, setSuggestedRoles] = useState<SuggestedRole[]>([]);

  // Detail view
  const [selectedRequest, setSelectedRequest] = useState<DevRequest | null>(
    null
  );

  /* ---- Fetch data ---- */

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/dev-requests");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRequests(data.requests || []);
      // If requests came back empty and we get an empty array, check if startup exists
      // The API returns { requests: [] } when no startup exists (no error)
    } catch {
      // non-blocking
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/dev-projects");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProjects(data.projects || []);
    } catch {
      toast.error("Impossible de charger les projets.");
    }
  }, []);

  useEffect(() => {
    void startupId;
    Promise.all([
      fetch("/api/dashboard/dev-requests")
        .then((res) => res.json())
        .then((data) => {
          setRequests(data.requests || []);
          if (data.startup_exists === false) setHasStartup(false);
        })
        .catch(() => { }),
      fetchProjects(),
    ]).finally(() => setLoading(false));
  }, [fetchProjects, startupId]);

  /* ---- AI Role Analysis ---- */

  async function handleAnalyzeRoles() {
    if (!formDescription.trim()) {
      toast.error(
        "Renseignez une description ou un cahier des charges pour analyser les roles."
      );
      return;
    }

    setAnalyzingRoles(true);
    try {
      const res = await fetch(
        "/api/dashboard/dev-requests/new/suggest-roles",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cahier_charges: formDescription }),
        }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSuggestedRoles(data.roles || []);
      toast.success("Roles analyses avec succes !");
    } catch {
      toast.error("Erreur lors de l'analyse IA.");
    } finally {
      setAnalyzingRoles(false);
    }
  }

  function removeRole(index: number) {
    setSuggestedRoles((prev) => prev.filter((_, i) => i !== index));
  }

  /* ---- Submit request ---- */

  async function handleSubmitRequest() {
    if (!formTitle.trim() || !formDescription.trim()) {
      toast.error("Le titre et la description sont requis.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create as draft
      const createRes = await fetch("/api/dashboard/dev-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          required_roles: suggestedRoles,
          budget_min: formBudgetMin ? Number(formBudgetMin) : null,
          budget_max: formBudgetMax ? Number(formBudgetMax) : null,
          timeline: formTimeline || null,
          payment_type: formPaymentType || null,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        if (err.error?.includes("startup")) {
          setHasStartup(false);
        }
        throw new Error(err.error || "Erreur lors de la creation de la demande");
      }
      const createData = await createRes.json();

      // 2. Submit (draft -> submitted)
      const submitRes = await fetch(
        `/api/dashboard/dev-requests/${createData.request.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "submitted" }),
        }
      );

      if (!submitRes.ok) throw new Error();

      toast.success("Votre demande a ete soumise avec succes !");
      resetForm();
      setShowForm(false);
      await fetchRequests();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de la soumission de la demande.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setFormTitle("");
    setFormDescription("");
    setFormBudgetMin("");
    setFormBudgetMax("");
    setFormTimeline("");
    setFormPaymentType("");
    setSuggestedRoles([]);
  }

  /* ---- Cancel request ---- */

  async function handleCancelRequest(requestId: string) {
    try {
      const res = await fetch(`/api/dashboard/dev-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Demande annulee.");
      await fetchRequests();
      setSelectedRequest(null);
    } catch {
      toast.error("Impossible d'annuler cette demande.");
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No startup — tell user to create one first
  if (!hasStartup) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ background: "var(--color-orange)", color: "#fff" }}
        >
          <Rocket className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold">Creez votre startup d&apos;abord</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Pour demander un service de developpement, vous devez d&apos;abord renseigner les informations de votre startup.
        </p>
        <Button
          onClick={() => onNavigate?.("startup")}
          style={{ background: "var(--color-orange)", color: "#fff" }}
        >
          <Rocket className="w-4 h-4 mr-2" />
          Creer ma startup
        </Button>
      </div>
    );
  }

  // Detail view for a selected request
  if (selectedRequest) {
    const statusCfg =
      STATUS_CONFIG[selectedRequest.status] || STATUS_CONFIG.draft;
    return (
      <div className="space-y-6 w-full">
        <button
          onClick={() => setSelectedRequest(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux demandes
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold">{selectedRequest.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Soumise le{" "}
              {new Date(selectedRequest.created_at).toLocaleDateString(
                "fr-FR",
                { day: "2-digit", month: "long", year: "numeric" }
              )}
            </p>
          </div>
          <Badge className={`text-xs border ${statusCfg.color}`}>
            {statusCfg.label}
          </Badge>
        </div>

        <SectionCard title="Description" icon={FileText}>
          <p className="text-sm whitespace-pre-wrap">
            {selectedRequest.description}
          </p>
        </SectionCard>

        {selectedRequest.required_roles &&
          selectedRequest.required_roles.length > 0 && (
            <SectionCard title="Roles techniques" icon={Users}>
              <div className="space-y-2">
                {selectedRequest.required_roles.map(
                  (role: SuggestedRole, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                      style={{ background: "var(--color-background)" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                          style={{
                            background: "var(--color-orange)",
                            color: "white",
                          }}
                        >
                          {(ROLE_LABELS[role.role] || role.role)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {ROLE_LABELS[role.role] || role.role}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {role.justification}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className="text-xs border border-border bg-background">
                          {SENIORITY_LABELS[role.seniority] || role.seniority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          ~{role.estimated_days}j
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </SectionCard>
          )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(selectedRequest.budget_min || selectedRequest.budget_max) && (
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-sm font-bold mt-1">
                {selectedRequest.budget_min
                  ? formatCurrency(selectedRequest.budget_min)
                  : "?"}{" "}
                -{" "}
                {selectedRequest.budget_max
                  ? formatCurrency(selectedRequest.budget_max)
                  : "?"}
              </p>
            </div>
          )}
          {selectedRequest.timeline && (
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground">Delai</p>
              <p className="text-sm font-bold mt-1">
                {
                  TIMELINE_OPTIONS.find(
                    (t) => t.value === selectedRequest.timeline
                  )?.label || selectedRequest.timeline
                }
              </p>
            </div>
          )}
          {selectedRequest.payment_type && (
            <div className="rounded-lg border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground">Paiement</p>
              <p className="text-sm font-bold mt-1">
                {
                  PAYMENT_OPTIONS.find(
                    (p) => p.value === selectedRequest.payment_type
                  )?.label || selectedRequest.payment_type
                }
              </p>
            </div>
          )}
        </div>

        {selectedRequest.status === "submitted" && (
          <Button
            variant="outline"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
            onClick={() => handleCancelRequest(selectedRequest.id)}
          >
            <X className="h-4 w-4 mr-1" />
            Annuler cette demande
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Code2
            className="h-5 w-5"
            style={{ color: "var(--color-orange)" }}
          />
          Services de developpement
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Faites developper votre projet par l&apos;equipe ivoire.io ou recrutez
          des devs
        </p>
      </div>

      {/* Action cards */}
      {!showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="group rounded-xl border border-border p-6 text-left transition-all hover:border-orange-400/50 hover:shadow-lg"
            style={{ background: "var(--color-surface)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-orange), #f97316)",
                }}
              >
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold group-hover:text-orange-400 transition-colors">
                  Demander un devis a ivoire.io
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Notre equipe analyse votre projet et vous envoie un devis
                  detaille
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-orange-400 transition-colors" />
            </div>
          </button>

          <a
            href="/devs"
            className="group rounded-xl border border-border p-6 text-left transition-all hover:border-blue-400/50 hover:shadow-lg block"
            style={{ background: "var(--color-surface)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-500/15">
                <BriefcaseBusiness className="h-6 w-6 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold group-hover:text-blue-400 transition-colors">
                  Recruter un dev
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Parcourez les profils de developpeurs disponibles
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-blue-400 transition-colors" />
            </div>
          </a>
        </div>
      )}

      {/* ============================================================ */}
      {/*  Request form                                                 */}
      {/* ============================================================ */}
      {showForm && (
        <SectionCard
          title="Nouvelle demande de devis"
          icon={FileText}
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Fermer
            </Button>
          }
        >
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="req-title">Titre du projet</Label>
            <Input
              id="req-title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Ex: Application mobile de livraison"
            />
          </div>

          {/* Description / Cahier des charges */}
          <div className="space-y-1.5">
            <Label htmlFor="req-desc">
              Description / Cahier des charges
            </Label>
            <Textarea
              id="req-desc"
              value={formDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormDescription(e.target.value)
              }
              placeholder="Decrivez votre projet en detail : fonctionnalites, contraintes techniques, public cible..."
              className="min-h-[120px]"
              style={{
                background: "var(--color-background)",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>

          {/* AI Role Analysis */}
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyzeRoles}
              disabled={analyzingRoles || !formDescription.trim()}
              className="gap-1"
            >
              {analyzingRoles ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
              Analyser les roles necessaires
            </Button>

            {suggestedRoles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Roles suggeres par l&apos;IA
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedRoles.map((role, idx) => (
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
                      <button
                        onClick={() => removeRole(idx)}
                        className="text-muted-foreground hover:text-red-400 transition-colors ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Budget range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="budget-min">
                <DollarSign className="h-3.5 w-3.5 inline mr-1" />
                Budget minimum (FCFA)
              </Label>
              <Input
                id="budget-min"
                type="number"
                min={0}
                value={formBudgetMin}
                onChange={(e) => setFormBudgetMin(e.target.value)}
                placeholder="500 000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget-max">
                <DollarSign className="h-3.5 w-3.5 inline mr-1" />
                Budget maximum (FCFA)
              </Label>
              <Input
                id="budget-max"
                type="number"
                min={0}
                value={formBudgetMax}
                onChange={(e) => setFormBudgetMax(e.target.value)}
                placeholder="2 000 000"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-1.5">
            <Label htmlFor="timeline">
              <Clock className="h-3.5 w-3.5 inline mr-1" />
              Delai souhaite
            </Label>
            <select
              id="timeline"
              value={formTimeline}
              onChange={(e) => setFormTimeline(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-orange-400 focus:outline-none"
            >
              <option value="">Selectionnez un delai</option>
              {TIMELINE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment type */}
          <div className="space-y-1.5">
            <Label htmlFor="payment-type">
              <Wallet className="h-3.5 w-3.5 inline mr-1" />
              Mode de paiement prefere
            </Label>
            <select
              id="payment-type"
              value={formPaymentType}
              onChange={(e) => setFormPaymentType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-orange-400 focus:outline-none"
            >
              <option value="">Selectionnez un mode</option>
              {PAYMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSubmitRequest}
              disabled={submitting}
              style={{ background: "var(--color-orange)", color: "white" }}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Soumettre la demande
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Annuler
            </Button>
          </div>
        </SectionCard>
      )}

      {/* ============================================================ */}
      {/*  My requests                                                  */}
      {/* ============================================================ */}
      <SectionCard
        title="Mes demandes"
        icon={FileText}
        action={
          !showForm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nouvelle demande
            </Button>
          ) : undefined
        }
      >
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucune demande pour le moment.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Cliquez sur &quot;Demander un devis&quot; pour commencer.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => {
              const statusCfg =
                STATUS_CONFIG[req.status] || STATUS_CONFIG.draft;
              return (
                <button
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="w-full flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:border-orange-400/30 text-left"
                  style={{ background: "var(--color-background)" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                      style={{
                        background: "var(--color-orange)",
                        color: "white",
                      }}
                    >
                      {req.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {req.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {new Date(req.created_at).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                        {(req.budget_min || req.budget_max) && (
                          <span className="text-xs text-muted-foreground">
                            {req.budget_min
                              ? formatCurrency(req.budget_min)
                              : "?"}{" "}
                            -{" "}
                            {req.budget_max
                              ? formatCurrency(req.budget_max)
                              : "?"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`text-xs border ${statusCfg.color}`}>
                      {statusCfg.label}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ============================================================ */}
      {/*  My projects                                                  */}
      {/* ============================================================ */}
      {projects.length > 0 && (
        <SectionCard title="Mes projets en cours" icon={Rocket}>
          <div className="space-y-3">
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
                      <p className="text-sm font-semibold truncate">
                        {project.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
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

                  {/* Milestones */}
                  {project.milestones && project.milestones.length > 0 && (
                    <div className="space-y-1">
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
        </SectionCard>
      )}
    </div>
  );
}
