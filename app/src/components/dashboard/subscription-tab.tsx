"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  Payment,
  PaymentProviderConfig,
  PlanLimits,
  PlanTier,
  Subscription,
} from "@/lib/types";
import {
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Crown,
  GraduationCap,
  Loader2,
  Rocket,
  Shield,
  Smartphone,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ManualPaymentForm } from "./manual-payment-form";
import { PayPalCheckout } from "./paypal-checkout";

interface PricingPlan {
  tier: PlanTier;
  name: string;
  price: number;
  period: string;
  periodLabel: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  highlight?: boolean;
  color?: string;
}

interface SubscriptionData {
  subscription: Subscription | null;
  credit_balance: number;
  pricing: Record<string, { amount: number; currency: string; period: string }>;
  payment_providers: PaymentProviderConfig;
  payments: Payment[];
  plan_limits: Record<string, PlanLimits>;
}

interface PricingPlan {
  tier: PlanTier;
  name: string;
  price: number;
  period: string;
  periodLabel: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  highlight?: boolean;
  color?: string;
}

const PLANS: PricingPlan[] = [
  {
    tier: "free",
    name: "Gratuit",
    price: 0,
    period: "",
    periodLabel: "",
    tagline: "Pour explorer la plateforme",
    description: "Decouvrez ivoire.io sans engagement. Creez vos premiers projets et testez nos outils IA.",
    icon: <Zap className="w-5 h-5" />,
    color: "#6b7280",
    features: [
      "5 projets maximum",
      "3 templates gratuits",
      "1 variation de logo",
      "5 generations IA / jour",
      "Stats basiques",
    ],
  },
  {
    tier: "student",
    name: "Student",
    price: 2000,
    period: "/mois",
    periodLabel: "par mois",
    tagline: "Pour les etudiants entrepreneurs",
    description: "Construisez votre premier projet serieusement. Acces aux outils essentiels a prix reduit.",
    icon: <GraduationCap className="w-5 h-5" />,
    color: "#8b5cf6",
    features: [
      "10 projets maximum",
      "Templates gratuits + 1 premium",
      "2 variations de logo",
      "10 generations IA / jour",
      "Acces a la communaute",
      "Support par email",
    ],
  },
  {
    tier: "starter",
    name: "Starter",
    price: 5000,
    period: "",
    periodLabel: "paiement unique",
    tagline: "Pour lancer serieusement votre startup",
    description: "Tout ce qu'il faut pour valider votre idee et demarcher vos premiers clients. Paiement une seule fois.",
    icon: <Rocket className="w-5 h-5" />,
    color: "#0ea5e9",
    features: [
      "15 projets maximum",
      "Templates gratuits + 1 premium",
      "Pitch Deck genere par IA",
      "One Pager professionnel",
      "Analyse de la concurrence",
      "Verification OAPI (marque)",
      "3 variations de logo",
      "20 generations IA / jour",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    price: 35000,
    period: "/an",
    periodLabel: "par an",
    tagline: "Pour scaler votre startup",
    description: "La puissance complete de la plateforme : IA, investisseurs, dev outsourcing. Tout pour passer a l'echelle.",
    icon: <Crown className="w-5 h-5" />,
    highlight: true,
    color: "#f97316",
    features: [
      "Projets illimites",
      "Tous les templates",
      "Pitch Deck, Business Plan, Cahier des charges",
      "CGU, Roadmap produit generes par IA",
      "Stats avancees + Export PDF",
      "Badge startup verifie",
      "Dev outsourcing (mise en relation)",
      "Acces levee de fonds",
      "5 variations de logo",
      "50 generations IA / jour",
      "Support prioritaire",
    ],
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: 150000,
    period: "/an",
    periodLabel: "par an",
    tagline: "Pour les grandes ambitions",
    description: "Accompagnement personnalise, templates corporate exclusifs et ressources illimitees pour les structures etablies.",
    icon: <Shield className="w-5 h-5" />,
    color: "#eab308",
    features: [
      "Projets illimites",
      "Tous les templates + corporate exclusifs",
      "Toutes les fonctionnalites Pro",
      "Generations IA illimitees",
      "10 variations de logo",
      "Account manager dedie",
      "Accompagnement personnalise",
      "Rapports sur mesure",
      "SLA garanti",
      "Facturation entreprise",
    ],
  },
];

// Mobile money providers with their phone numbers
const MOBILE_MONEY_PROVIDERS = [
  { id: "orange_money", name: "Orange Money", color: "#FF6600", number: "" },
  { id: "wave", name: "Wave", color: "#1DC3E2", number: "" },
  { id: "moov", name: "Moov Money", color: "#003DA5", number: "" },
];

export function SubscriptionTab() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [creditLoading, setCreditLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  async function fetchData() {
    try {
      const res = await fetch("/api/dashboard/subscription");
      if (!res.ok) throw new Error("Erreur chargement");
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Impossible de charger les informations d'abonnement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handlePlanSelect(tier: PlanTier) {
    if (tier === "free") return;
    if (data?.subscription?.plan === tier && data.subscription.status === "active") return;
    setSelectedPlan(tier);
    setPaymentMethod(null);
  }

  function handlePaymentSuccess() {
    setSelectedPlan(null);
    setPaymentMethod(null);
    setLoading(true);
    fetchData();
    toast.success("Paiement enregistre avec succes !");
  }

  async function handleCreditPayment() {
    if (!selectedPlan || !data) return;
    const plan = PLANS.find((p) => p.tier === selectedPlan);
    if (!plan) return;

    if (data.credit_balance < plan.price) {
      toast.error("Solde de credits insuffisant");
      return;
    }

    setCreditLoading(true);
    try {
      const res = await fetch("/api/dashboard/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          payment_method: "credit",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors du paiement");
      }
      handlePaymentSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors du paiement par credits");
    } finally {
      setCreditLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Impossible de charger les donnees. Veuillez reessayer.
      </div>
    );
  }

  const currentPlan = data.subscription?.plan ?? "free";
  const isActive = data.subscription?.status === "active";
  const selectedPlanInfo = selectedPlan ? PLANS.find((p) => p.tier === selectedPlan) : null;

  // Get mobile money numbers from payment_providers config
  const mobileProviders = MOBILE_MONEY_PROVIDERS.map((p) => {
    const config = (data.payment_providers as unknown as Record<string, { enabled?: boolean; phone_number?: string }>)[p.id];
    return {
      ...p,
      enabled: config?.enabled ?? false,
      number: config?.phone_number ?? "",
    };
  }).filter((p) => p.enabled);

  return (
    <div className="flex flex-col gap-6">
      {/* Header + current plan inline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Abonnement</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Plan actuel :{" "}
            <span className="font-semibold" style={{ color: "var(--color-orange)" }}>
              {PLANS.find((p) => p.tier === currentPlan)?.name ?? currentPlan}
            </span>
            {data.subscription && (
              <>
                {" "}{getStatusBadge(data.subscription.status)}
                {data.subscription.expires_at && (
                  <span className="text-xs ml-2">
                    (expire le{" "}
                    {new Date(data.subscription.expires_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    )
                  </span>
                )}
              </>
            )}
          </p>
        </div>
        {data.credit_balance > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "var(--color-surface)" }}>
            <Wallet className="w-4 h-4" style={{ color: "#22c55e" }} />
            <span className="text-sm font-medium">
              {data.credit_balance.toLocaleString("fr-FR")} FCFA credits
            </span>
          </div>
        )}
      </div>

      {/* Pricing cards — responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-5">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.tier && isActive;
          const isSelected = selectedPlan === plan.tier;
          const isFree = plan.tier === "free";
          const accentColor = plan.color ?? "var(--color-orange)";

          return (
            <button
              key={plan.tier}
              disabled={isFree || isCurrent}
              onClick={() => handlePlanSelect(plan.tier)}
              className={`relative flex flex-col gap-3 rounded-2xl p-5 border-2 text-left transition-all duration-200 ${isFree || isCurrent ? "cursor-default" : "cursor-pointer hover:shadow-md"
                }`}
              style={{
                borderColor: isSelected
                  ? accentColor
                  : isCurrent
                    ? "#22c55e"
                    : plan.highlight
                      ? `${accentColor}55`
                      : "var(--color-border, #e5e7eb)",
                background: plan.highlight && !isSelected && !isCurrent
                  ? `${accentColor}08`
                  : "var(--color-card, #fff)",
              }}
            >
              {/* Badge POPULAIRE / ACTUEL */}
              {plan.highlight && !isCurrent && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white px-3 py-0.5 rounded-full whitespace-nowrap shadow-sm"
                  style={{ background: accentColor }}
                >
                  POPULAIRE
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white px-3 py-0.5 rounded-full whitespace-nowrap shadow-sm bg-green-500">
                  PLAN ACTUEL
                </span>
              )}

              {/* Icon + name */}
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isSelected || isCurrent ? accentColor : `${accentColor}20`,
                    color: isSelected || isCurrent ? "#fff" : accentColor,
                  }}
                >
                  {plan.icon}
                </div>
                <div>
                  <p className="font-bold text-sm">{plan.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{plan.tagline}</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-2xl font-extrabold leading-none">
                  {plan.price === 0 ? "0" : plan.price.toLocaleString("fr-FR")}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {plan.price === 0 ? "FCFA" : `FCFA${plan.period || " unique"}`}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {plan.description}
              </p>

              {/* Separator */}
              <div className="w-full h-px" style={{ background: "var(--color-border, #e5e7eb)" }} />

              {/* Features */}
              <ul className="flex flex-col gap-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      style={{ color: isCurrent ? "#22c55e" : accentColor }}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA label */}
              {!isFree && !isCurrent && (
                <div
                  className="mt-auto pt-2 text-center text-xs font-semibold py-1.5 rounded-lg"
                  style={{
                    background: isSelected ? accentColor : `${accentColor}15`,
                    color: isSelected ? "#fff" : accentColor,
                  }}
                >
                  {isSelected ? "Selectionne" : "Choisir ce plan"}
                </div>
              )}
              {isCurrent && (
                <div className="mt-auto pt-2 text-center text-xs font-semibold py-1.5 rounded-lg bg-green-500/15 text-green-600">
                  Plan actif
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected plan details + payment */}
      {selectedPlan && selectedPlanInfo && (
        <Card>
          <CardContent className="p-4 flex flex-col gap-4">
            {/* Plan summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--color-orange)", color: "#fff" }}
                >
                  {selectedPlanInfo.icon}
                </div>
                <div>
                  <p className="font-semibold">{selectedPlanInfo.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedPlanInfo.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {selectedPlanInfo.price.toLocaleString("fr-FR")} FCFA
                </p>
                <p className="text-xs text-muted-foreground">{selectedPlanInfo.periodLabel}</p>
              </div>
            </div>

            {/* Features */}
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {selectedPlanInfo.features.map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 shrink-0" style={{ color: "#22c55e" }} />
                  {f}
                </li>
              ))}
            </ul>

            {/* Payment methods */}
            <div>
              <p className="text-sm font-medium mb-3">Methode de paiement :</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Mobile money providers */}
                {mobileProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => setPaymentMethod(provider.id)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg p-3 border-2 transition-colors ${paymentMethod === provider.id ? "" : "border-border"
                      }`}
                    style={
                      paymentMethod === provider.id
                        ? { borderColor: provider.color }
                        : {}
                    }
                  >
                    <Smartphone className="w-5 h-5" style={{ color: provider.color }} />
                    <span className="text-xs font-medium">{provider.name}</span>
                  </button>
                ))}

                {/* PayPal */}
                {data.payment_providers.paypal?.enabled && (
                  <button
                    onClick={() => setPaymentMethod("paypal")}
                    className={`flex flex-col items-center gap-1.5 rounded-lg p-3 border-2 transition-colors ${paymentMethod === "paypal" ? "" : "border-border"
                      }`}
                    style={
                      paymentMethod === "paypal"
                        ? { borderColor: "#0070ba" }
                        : {}
                    }
                  >
                    <Wallet className="w-5 h-5" style={{ color: "#0070ba" }} />
                    <span className="text-xs font-medium">PayPal</span>
                  </button>
                )}

                {/* Credits */}
                {data.credit_balance >= selectedPlanInfo.price && (
                  <button
                    onClick={() => setPaymentMethod("credit")}
                    className={`flex flex-col items-center gap-1.5 rounded-lg p-3 border-2 transition-colors ${paymentMethod === "credit" ? "" : "border-border"
                      }`}
                    style={
                      paymentMethod === "credit"
                        ? { borderColor: "#22c55e" }
                        : {}
                    }
                  >
                    <Sparkles className="w-5 h-5" style={{ color: "#22c55e" }} />
                    <span className="text-xs font-medium">Credits</span>
                    <span className="text-[10px] text-muted-foreground">
                      {data.credit_balance.toLocaleString("fr-FR")} F
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile money payment section */}
            {paymentMethod && mobileProviders.some((p) => p.id === paymentMethod) && (() => {
              const provider = mobileProviders.find((p) => p.id === paymentMethod)!;
              return (
                <div className="flex flex-col gap-3">
                  <div
                    className="rounded-xl p-4 flex flex-col gap-3"
                    style={{ background: "var(--color-surface)" }}
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5" style={{ color: provider.color }} />
                      <span className="font-semibold">{provider.name}</span>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Numero :</span>
                        <span className="font-mono font-semibold">{provider.number || "Non configure"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Montant :</span>
                        <span className="font-bold" style={{ color: "var(--color-orange)" }}>
                          {selectedPlanInfo.price.toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Envoyez le montant exact au numero ci-dessus, puis uploadez la capture d&apos;ecran de la transaction.
                    </p>
                  </div>
                  <ManualPaymentForm
                    plan={selectedPlan}
                    amount={selectedPlanInfo.price}
                    bankInfo={data.payment_providers.manual}
                    onSuccess={handlePaymentSuccess}
                    mobileMoneyMode
                    providerName={provider.name}
                  />
                </div>
              );
            })()}

            {/* PayPal checkout */}
            {paymentMethod === "paypal" && (
              <PayPalCheckout
                plan={selectedPlan}
                amount={selectedPlanInfo.price}
                onSuccess={handlePaymentSuccess}
              />
            )}

            {/* Credit payment */}
            {paymentMethod === "credit" && (
              <div className="flex flex-col gap-3 p-4 rounded-lg" style={{ background: "var(--color-surface)" }}>
                <p className="text-sm">
                  Utiliser{" "}
                  <span className="font-bold">
                    {selectedPlanInfo.price.toLocaleString("fr-FR")} FCFA
                  </span>{" "}
                  de credits pour le plan{" "}
                  <span className="font-bold">{selectedPlanInfo.name}</span>.
                </p>
                <p className="text-xs text-muted-foreground">
                  Solde apres : {(data.credit_balance - selectedPlanInfo.price).toLocaleString("fr-FR")} FCFA
                </p>
                <Button
                  onClick={handleCreditPayment}
                  disabled={creditLoading}
                  style={{ background: "var(--color-orange)", color: "#fff" }}
                >
                  {creditLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    "Confirmer le paiement par credits"
                  )}
                </Button>
              </div>
            )}

            {/* Cancel */}
            <Button
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => {
                setSelectedPlan(null);
                setPaymentMethod(null);
              }}
            >
              Annuler
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment history — collapsible */}
      {data.payments && data.payments.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>Historique des paiements ({data.payments.length})</span>
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHistory && (
            <div className="flex flex-col gap-2 mt-3">
              {data.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg text-sm"
                  style={{ background: "var(--color-surface)" }}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {payment.amount.toLocaleString("fr-FR")} {payment.currency}
                      </span>
                      {getPaymentStatusBadge(payment.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatPaymentMethod(payment.payment_method)} —{" "}
                      {new Date(payment.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {payment.proof_url && (
                    <a
                      href={payment.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:underline shrink-0"
                      style={{ color: "var(--color-orange)" }}
                    >
                      Voir preuve
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatPaymentMethod(method: string) {
  switch (method) {
    case "manual": return "Mobile Money";
    case "paypal": return "PayPal";
    case "credit": return "Credits";
    case "orange_money": return "Orange Money";
    case "wave": return "Wave";
    case "moov": return "Moov Money";
    default: return method;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="text-[10px] py-0" style={{ background: "#22c55e", color: "#fff" }}>Actif</Badge>;
    case "pending":
      return <Badge className="text-[10px] py-0" style={{ background: "#eab308", color: "#fff" }}>En attente</Badge>;
    case "expired":
      return <Badge className="text-[10px] py-0" style={{ background: "#6b7280", color: "#fff" }}>Expire</Badge>;
    case "cancelled":
      return <Badge className="text-[10px] py-0" style={{ background: "#ef4444", color: "#fff" }}>Annule</Badge>;
    default:
      return <Badge className="text-[10px] py-0" variant="outline">{status}</Badge>;
  }
}

function getPaymentStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="text-[10px] py-0" style={{ background: "#22c55e", color: "#fff" }}>OK</Badge>;
    case "pending":
      return <Badge className="text-[10px] py-0" style={{ background: "#eab308", color: "#fff" }}>En attente</Badge>;
    case "failed":
      return <Badge className="text-[10px] py-0" style={{ background: "#ef4444", color: "#fff" }}>Echoue</Badge>;
    default:
      return <Badge className="text-[10px] py-0" variant="outline">{status}</Badge>;
  }
}
