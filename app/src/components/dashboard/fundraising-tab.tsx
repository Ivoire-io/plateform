"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Check,
  DollarSign,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type RaisingStatus = "yes" | "no" | "hidden";
type InvestorStatus = "confirmed" | "negotiating" | "refused";

interface Investor {
  id: string;
  name: string;
  amount: number;
  status: InvestorStatus;
}

interface DocEntry {
  uploaded: boolean;
  name: string;
}

interface FundraisingState {
  isRaising: RaisingStatus;
  raiseType: string;
  targetAmount: number;
  raisedAmount: number;
  showProgressOnProfile: boolean;
  investors: Investor[];
  documents: {
    pitchDeck: DocEntry;
    businessPlan: DocEntry;
    onePager: DocEntry;
  };
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const RAISE_TYPES = [
  { value: "preseed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "Serie A" },
  { value: "series_b", label: "Serie B+" },
];

const RAISING_OPTIONS: { value: RaisingStatus; label: string }[] = [
  { value: "yes", label: "Oui" },
  { value: "no", label: "Non" },
  { value: "hidden", label: "Ne pas afficher" },
];

const INVESTOR_STATUS_OPTIONS: {
  value: InvestorStatus;
  label: string;
}[] = [
    { value: "confirmed", label: "Confirme" },
    { value: "negotiating", label: "En negociation" },
    { value: "refused", label: "Refuse" },
  ];

const INVESTOR_STATUS_CONFIG: Record<
  InvestorStatus,
  { label: string; color: string }
> = {
  confirmed: {
    label: "Confirme",
    color: "text-green-400 border-green-500/30 bg-green-500/10",
  },
  negotiating: {
    label: "En negociation",
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  },
  refused: {
    label: "Refuse",
    color: "text-red-400 border-red-500/30 bg-red-500/10",
  },
};

const EMPTY_STATE: FundraisingState = {
  isRaising: "no",
  raiseType: "preseed",
  targetAmount: 0,
  raisedAmount: 0,
  showProgressOnProfile: false,
  investors: [],
  documents: {
    pitchDeck: { uploaded: false, name: "" },
    businessPlan: { uploaded: false, name: "" },
    onePager: { uploaded: false, name: "" },
  },
};

const DOC_LABELS: Record<
  keyof FundraisingState["documents"],
  { label: string; icon: typeof FileText }
> = {
  pitchDeck: { label: "Pitch Deck", icon: FileText },
  businessPlan: { label: "Business Plan", icon: FileText },
  onePager: { label: "One Pager", icon: FileText },
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

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-orange-400 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/* ------------------------------------------------------------------ */
/*  Progress bar                                                       */
/* ------------------------------------------------------------------ */

function FundingProgress({
  raised,
  target,
}: {
  raised: number;
  target: number;
}) {
  const pct = target > 0 ? Math.min((raised / target) * 100, 100) : 0;
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPct(pct), 100);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold tracking-tight">
            {formatUSD(raised)}
          </p>
          <p className="text-xs text-muted-foreground">
            leve sur {formatUSD(target)}
          </p>
        </div>
        <span
          className="text-lg font-bold tabular-nums"
          style={{ color: "var(--color-orange)" }}
        >
          {pct.toFixed(0)}%
        </span>
      </div>

      {/* Track */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        {/* Glow behind the bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-full blur-sm"
          style={{
            width: `${animatedPct}%`,
            background:
              "linear-gradient(90deg, var(--color-orange), #f97316)",
            opacity: 0.5,
            transition: "width 1s cubic-bezier(.4,0,.2,1)",
          }}
        />
        {/* Main bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${animatedPct}%`,
            background:
              "linear-gradient(90deg, var(--color-orange), #f97316)",
            transition: "width 1s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function FundraisingTab({ startupId }: { startupId: string }) {
  const [state, setState] = useState<FundraisingState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Investor dialog
  const [investorDialogOpen, setInvestorDialogOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(
    null
  );
  const [investorForm, setInvestorForm] = useState({
    name: "",
    amount: "",
    status: "negotiating" as InvestorStatus,
  });

  // File input refs
  const pitchDeckRef = useRef<HTMLInputElement>(null);
  const businessPlanRef = useRef<HTMLInputElement>(null);
  const onePagerRef = useRef<HTMLInputElement>(null);

  const docRefs: Record<
    keyof FundraisingState["documents"],
    React.RefObject<HTMLInputElement | null>
  > = {
    pitchDeck: pitchDeckRef,
    businessPlan: businessPlanRef,
    onePager: onePagerRef,
  };

  /* ---- Fetch fundraising data ---- */

  const fetchFundraising = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/fundraising");
      if (!res.ok) throw new Error("Erreur chargement");
      const data = await res.json();
      if (data.fundraising) {
        setState(data.fundraising);
      } else {
        setState(EMPTY_STATE);
      }
    } catch {
      toast.error("Impossible de charger les donn\u00e9es de lev\u00e9e.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFundraising();
  }, [fetchFundraising]);

  /* ---- Field helpers ---- */

  function setField<K extends keyof FundraisingState>(
    key: K,
    value: FundraisingState[K]
  ) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  /* ---- Investor CRUD ---- */

  function openAddInvestor() {
    setEditingInvestor(null);
    setInvestorForm({ name: "", amount: "", status: "negotiating" });
    setInvestorDialogOpen(true);
  }

  function openEditInvestor(inv: Investor) {
    setEditingInvestor(inv);
    setInvestorForm({
      name: inv.name,
      amount: String(inv.amount),
      status: inv.status,
    });
    setInvestorDialogOpen(true);
  }

  async function handleInvestorSubmit() {
    const name = investorForm.name.trim();
    const amount = Number(investorForm.amount);
    if (!name) {
      toast.error("Le nom de l'investisseur est requis.");
      return;
    }
    if (!amount || amount <= 0) {
      toast.error("Le montant doit etre superieur a 0.");
      return;
    }

    try {
      if (editingInvestor) {
        const res = await fetch(`/api/dashboard/fundraising/investors/${editingInvestor.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, amount, status: investorForm.status }),
        });
        if (!res.ok) throw new Error("Erreur serveur");
        toast.success("Investisseur mis a jour !");
      } else {
        const res = await fetch("/api/dashboard/fundraising/investors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, amount, status: investorForm.status }),
        });
        if (!res.ok) throw new Error("Erreur serveur");
        toast.success("Investisseur ajoute !");
      }
      setInvestorDialogOpen(false);
      await fetchFundraising();
    } catch {
      toast.error("Une erreur est survenue.");
    }
  }

  async function deleteInvestor(id: string) {
    try {
      const res = await fetch(`/api/dashboard/fundraising/investors/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur suppression");
      toast.success("Investisseur supprime.");
      await fetchFundraising();
    } catch {
      toast.error("Impossible de supprimer cet investisseur.");
    }
  }

  /* ---- Document upload ---- */

  async function handleDocUpload(
    key: keyof FundraisingState["documents"],
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", key);
      const res = await fetch("/api/dashboard/fundraising/documents", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur upload");
      toast.success(`${DOC_LABELS[key].label} uploade : ${file.name}`);
      await fetchFundraising();
    } catch {
      toast.error("Impossible d'uploader le fichier.");
    }
    // Reset input so the same file can be re-selected
    const ref = docRefs[key];
    if (ref.current) ref.current.value = "";
  }

  async function removeDoc(key: keyof FundraisingState["documents"]) {
    try {
      const res = await fetch(`/api/dashboard/fundraising/documents/${key}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur suppression");
      toast.success(`${DOC_LABELS[key].label} supprime.`);
      await fetchFundraising();
    } catch {
      toast.error("Impossible de supprimer le document.");
    }
  }

  /* ---- Save ---- */

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/fundraising", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isRaising: state.isRaising,
          raiseType: state.raiseType,
          targetAmount: state.targetAmount,
          raisedAmount: state.raisedAmount,
          showProgressOnProfile: state.showProgressOnProfile,
        }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      toast.success("Parametres de levee sauvegardes !");
    } catch {
      toast.error("Impossible de sauvegarder.");
    } finally {
      setSaving(false);
    }
  }

  /* ---- Computed ---- */

  const confirmedTotal = state.investors
    .filter((i) => i.status === "confirmed")
    .reduce((sum, i) => sum + i.amount, 0);

  const negotiatingTotal = state.investors
    .filter((i) => i.status === "negotiating")
    .reduce((sum, i) => sum + i.amount, 0);

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

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp
              className="h-5 w-5"
              style={{ color: "var(--color-orange)" }}
            />
            Levee de fonds
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Suivez votre levee de fonds et gerez vos relations investisseurs.
          </p>
        </div>
        {state.isRaising === "yes" && (
          <Badge className="text-xs border text-green-400 border-green-500/30 bg-green-500/10">
            Levee en cours
          </Badge>
        )}
      </div>

      {/* ============================================================ */}
      {/*  SECTION 1 : Statut actuel                                    */}
      {/* ============================================================ */}
      <SectionCard title="Statut actuel" icon={DollarSign}>
        {/* Raising toggle */}
        <div className="space-y-1.5">
          <Label>En cours de levee ?</Label>
          <div className="flex gap-2">
            {RAISING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setField("isRaising", opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${state.isRaising === opt.value
                  ? "border-orange-400 bg-orange-500/15 text-orange-400"
                  : "border-border bg-background text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectField
            id="raiseType"
            label="Type de levee"
            value={state.raiseType}
            onChange={(v) => setField("raiseType", v)}
            options={RAISE_TYPES}
          />
          <div className="space-y-1.5">
            <Label htmlFor="targetAmount">Montant vise (USD)</Label>
            <Input
              id="targetAmount"
              type="number"
              min={0}
              value={state.targetAmount || ""}
              onChange={(e) =>
                setField("targetAmount", Number(e.target.value) || 0)
              }
              placeholder="50 000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="raisedAmount">Montant leve (USD)</Label>
            <Input
              id="raisedAmount"
              type="number"
              min={0}
              value={state.raisedAmount || ""}
              onChange={(e) =>
                setField("raisedAmount", Number(e.target.value) || 0)
              }
              placeholder="12 000"
            />
          </div>
        </div>

        {/* Progress bar */}
        {state.targetAmount > 0 && (
          <div
            className="rounded-xl border border-border p-5"
            style={{ background: "var(--color-background)" }}
          >
            <FundingProgress
              raised={state.raisedAmount}
              target={state.targetAmount}
            />
          </div>
        )}

        {/* Mini summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border p-3 text-center">
            <p className="text-xs text-muted-foreground">Objectif</p>
            <p className="text-sm font-bold mt-1">
              {formatUSD(state.targetAmount)}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3 text-center">
            <p className="text-xs text-muted-foreground">Leve</p>
            <p className="text-sm font-bold mt-1 text-green-400">
              {formatUSD(state.raisedAmount)}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3 text-center">
            <p className="text-xs text-muted-foreground">Confirme</p>
            <p className="text-sm font-bold mt-1 text-green-400">
              {formatUSD(confirmedTotal)}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3 text-center">
            <p className="text-xs text-muted-foreground">En nego.</p>
            <p className="text-sm font-bold mt-1 text-yellow-400">
              {formatUSD(negotiatingTotal)}
            </p>
          </div>
        </div>

        {/* Show on profile toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            onClick={() =>
              setField(
                "showProgressOnProfile",
                !state.showProgressOnProfile
              )
            }
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${state.showProgressOnProfile
              ? "border-orange-400 bg-orange-500"
              : "border-border bg-muted"
              }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${state.showProgressOnProfile
                ? "translate-x-[22px]"
                : "translate-x-1"
                }`}
            />
          </button>
          <span className="text-sm">
            Afficher la barre de progression sur ma vitrine
          </span>
        </label>
      </SectionCard>

      {/* ============================================================ */}
      {/*  SECTION 2 : Investisseurs                                    */}
      {/* ============================================================ */}
      <SectionCard
        title="Investisseurs"
        icon={Users}
        action={
          <Dialog
            open={investorDialogOpen}
            onOpenChange={setInvestorDialogOpen}
          >
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openAddInvestor}
                />
              }
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingInvestor
                    ? "Modifier l'investisseur"
                    : "Ajouter un investisseur"}
                </DialogTitle>
                <DialogDescription>
                  {editingInvestor
                    ? "Modifiez les informations de l'investisseur."
                    : "Renseignez les informations de votre investisseur."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="inv-name">Nom</Label>
                  <Input
                    id="inv-name"
                    value={investorForm.name}
                    onChange={(e) =>
                      setInvestorForm((f) => ({
                        ...f,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Nom de l'investisseur"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-amount">Montant (USD)</Label>
                  <Input
                    id="inv-amount"
                    type="number"
                    min={0}
                    value={investorForm.amount}
                    onChange={(e) =>
                      setInvestorForm((f) => ({
                        ...f,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="10 000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inv-status">Statut</Label>
                  <select
                    id="inv-status"
                    value={investorForm.status}
                    onChange={(e) =>
                      setInvestorForm((f) => ({
                        ...f,
                        status: e.target.value as InvestorStatus,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-orange-400 focus:outline-none"
                  >
                    {INVESTOR_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <DialogFooter>
                <DialogClose
                  render={<Button variant="outline" />}
                >
                  Annuler
                </DialogClose>
                <Button
                  onClick={handleInvestorSubmit}
                  style={{
                    background: "var(--color-orange)",
                    color: "white",
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {editingInvestor ? "Modifier" : "Ajouter"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        {/* Privacy notice */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 shrink-0" />
          Ces donnees sont privees et ne seront jamais affichees publiquement.
        </div>

        {/* Investor list */}
        {state.investors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Users className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucun investisseur ajoute pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {state.investors.map((inv) => {
              const statusCfg = INVESTOR_STATUS_CONFIG[inv.status];
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:border-border"
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
                      {inv.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {inv.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatUSD(inv.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      className={`text-xs border ${statusCfg.color}`}
                    >
                      {statusCfg.label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openEditInvestor(inv)}
                      title="Modifier"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => deleteInvestor(inv.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ============================================================ */}
      {/*  SECTION 3 : Documents                                        */}
      {/* ============================================================ */}
      <SectionCard title="Documents" icon={FileText}>
        {/* Privacy notice */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 shrink-0" />
          Vos documents sont stockes de maniere securisee et ne sont partages
          qu&apos;avec les investisseurs que vous approuvez.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(
            Object.keys(DOC_LABELS) as Array<
              keyof FundraisingState["documents"]
            >
          ).map((key) => {
            const doc = state.documents[key];
            const meta = DOC_LABELS[key];
            const ref = docRefs[key];

            return (
              <div
                key={key}
                className="rounded-xl border border-border p-4 flex flex-col items-center gap-3 text-center"
                style={{ background: "var(--color-background)" }}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${doc.uploaded
                    ? "bg-green-500/15 text-green-400"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  {doc.uploaded ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <meta.icon className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{meta.label}</p>
                  {doc.uploaded ? (
                    <p className="text-xs text-green-400 mt-0.5 truncate max-w-[160px]">
                      {doc.name}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Aucun fichier
                    </p>
                  )}
                </div>
                <input
                  ref={ref}
                  type="file"
                  accept=".pdf,.pptx,.ppt,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleDocUpload(key, e)}
                />
                {doc.uploaded ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => ref.current?.click()}
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Remplacer
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => removeDoc(key)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => ref.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1" />
                    Uploader
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ============================================================ */}
      {/*  Save button                                                  */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          style={{ background: "var(--color-orange)", color: "white" }}
        >
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Sauvegarder les parametres
        </Button>
      </div>
    </div>
  );
}
