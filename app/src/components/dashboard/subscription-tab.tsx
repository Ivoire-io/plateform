"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Payment,
  PaymentProviderConfig,
  PlanLimits,
  PlanTier,
  Subscription,
} from "@/lib/types";
import {
  Check,
  CreditCard,
  Crown,
  GraduationCap,
  Loader2,
  Rocket,
  Shield,
  Sparkles,
  Star,
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
  description: string;
  icon: React.ReactNode;
  features: string[];
  highlight?: boolean;
}

interface SubscriptionData {
  subscription: Subscription | null;
  credit_balance: number;
  pricing: Record<string, { amount: number; currency: string; period: string }>;
  payment_providers: PaymentProviderConfig;
  payments: Payment[];
  plan_limits: Record<string, PlanLimits>;
}

const PLANS: PricingPlan[] = [
  {
    tier: "free",
    name: "Gratuit",
    price: 0,
    period: "",
    description: "Les bases pour demarrer",
    icon: <Zap className="w-5 h-5" />,
    features: [
      "3 templates gratuits",
      "5 projets max",
      "Stats 30 jours",
      "Portfolio public",
    ],
  },
  {
    tier: "student",
    name: "Student",
    price: 2000,
    period: "/mois",
    description: "Pour les etudiants et apprenants",
    icon: <GraduationCap className="w-5 h-5" />,
    features: [
      "Tous les templates gratuits + 1 premium",
      "10 projets max",
      "Stats 90 jours",
      "Badge etudiant",
      "Export PDF",
    ],
  },
  {
    tier: "starter",
    name: "Starter",
    price: 5000,
    period: "/mois",
    description: "Ideal pour les freelances",
    icon: <Rocket className="w-5 h-5" />,
    features: [
      "Tous les templates",
      "Projets illimites",
      "Stats avancees",
      "Badge verifie",
      "Export PDF",
      "Priorite annuaire",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    price: 35000,
    period: "/an",
    description: "Pour les startups et equipes",
    icon: <Crown className="w-5 h-5" />,
    highlight: true,
    features: [
      "Tout Starter inclus",
      "Pitch Deck IA",
      "Cahier des charges IA",
      "Business Plan IA",
      "Levee de fonds",
      "Dev outsourcing",
      "Equipe illimitee",
    ],
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: 150000,
    period: "/an",
    description: "Solutions sur mesure",
    icon: <Shield className="w-5 h-5" />,
    features: [
      "Tout Pro inclus",
      "Templates corporate",
      "Support prioritaire",
      "Page d'accueil mise en avant",
      "Analyse concurrents",
      "Verification OAPI",
      "Accompagnement personnalise",
    ],
  },
];

export function SubscriptionTab() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [creditLoading, setCreditLoading] = useState(false);

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

  function getStatusBadge(status: string) {
    switch (status) {
      case "active":
        return (
          <Badge className="text-xs" style={{ background: "#22c55e", color: "#fff" }}>
            Actif
          </Badge>
        );
      case "pending":
        return (
          <Badge className="text-xs" style={{ background: "#eab308", color: "#fff" }}>
            En attente
          </Badge>
        );
      case "expired":
        return (
          <Badge className="text-xs" style={{ background: "#6b7280", color: "#fff" }}>
            Expire
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="text-xs" style={{ background: "#ef4444", color: "#fff" }}>
            Annule
          </Badge>
        );
      default:
        return (
          <Badge className="text-xs" variant="outline">
            {status}
          </Badge>
        );
    }
  }

  function getPaymentStatusBadge(status: string) {
    switch (status) {
      case "completed":
        return (
          <Badge className="text-xs" style={{ background: "#22c55e", color: "#fff" }}>
            Termine
          </Badge>
        );
      case "pending":
        return (
          <Badge className="text-xs" style={{ background: "#eab308", color: "#fff" }}>
            En attente
          </Badge>
        );
      case "failed":
        return (
          <Badge className="text-xs" style={{ background: "#ef4444", color: "#fff" }}>
            Echoue
          </Badge>
        );
      case "refunded":
        return (
          <Badge className="text-xs" style={{ background: "#3b82f6", color: "#fff" }}>
            Rembourse
          </Badge>
        );
      default:
        return (
          <Badge className="text-xs" variant="outline">
            {status}
          </Badge>
        );
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Abonnement</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Gerez votre plan et vos paiements
        </p>
      </div>

      {/* Current plan status */}
      {data.subscription && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Star className="w-4 h-4" style={{ color: "var(--color-orange)" }} />
              Plan actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--color-orange)", color: "#fff" }}
                >
                  {PLANS.find((p) => p.tier === currentPlan)?.icon ?? (
                    <Star className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {PLANS.find((p) => p.tier === currentPlan)?.name ?? currentPlan}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.subscription.expires_at
                      ? `Expire le ${new Date(data.subscription.expires_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
                      : "Abonnement actif"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(data.subscription.status)}
                <span className="text-sm font-medium">
                  {data.subscription.amount.toLocaleString("fr-FR")}{" "}
                  {data.subscription.currency}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credit balance */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "#22c55e20", color: "#22c55e" }}
              >
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Solde credits</p>
                <p className="text-xl font-bold">
                  {data.credit_balance.toLocaleString("fr-FR")} FCFA
                </p>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Plan selection */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Choisir un plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.tier && isActive;
            const isFree = plan.tier === "free";

            return (
              <Card
                key={plan.tier}
                className={`relative overflow-hidden transition-all ${plan.highlight && !isCurrent
                    ? "border-2"
                    : isCurrent
                      ? "border-2"
                      : ""
                  }`}
                style={
                  plan.highlight && !isCurrent
                    ? { borderColor: "var(--color-orange)" }
                    : isCurrent
                      ? { borderColor: "#22c55e" }
                      : {}
                }
              >
                {plan.highlight && !isCurrent && (
                  <div
                    className="absolute top-0 right-0 text-[10px] font-bold text-white px-2 py-0.5 rounded-bl"
                    style={{ background: "var(--color-orange)" }}
                  >
                    POPULAIRE
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-0 right-0 text-[10px] font-bold text-white px-2 py-0.5 rounded-bl bg-green-500">
                    ACTUEL
                  </div>
                )}
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={
                        isCurrent
                          ? { background: "#22c55e20", color: "#22c55e" }
                          : { background: "var(--color-orange)", color: "#fff" }
                      }
                    >
                      {plan.icon}
                    </div>
                    <div>
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      {plan.price === 0
                        ? "Gratuit"
                        : `${plan.price.toLocaleString("fr-FR")} F`}
                    </span>
                    {plan.period && (
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    )}
                  </div>

                  <ul className="flex flex-col gap-1.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "#22c55e" }} />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full mt-auto"
                    variant={isFree || isCurrent ? "outline" : "default"}
                    disabled={isFree || isCurrent}
                    onClick={() => handlePlanSelect(plan.tier)}
                    style={
                      !isFree && !isCurrent
                        ? { background: "var(--color-orange)", color: "#fff" }
                        : {}
                    }
                  >
                    {isCurrent
                      ? "Plan actuel"
                      : isFree
                        ? "Inclus"
                        : "Choisir ce plan"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment method selector */}
      {selectedPlan && selectedPlanInfo && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4" style={{ color: "var(--color-orange)" }} />
              Paiement pour le plan {selectedPlanInfo.name} —{" "}
              {selectedPlanInfo.price.toLocaleString("fr-FR")} FCFA
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Choisissez votre methode de paiement :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.payment_providers.manual.enabled && (
                <button
                  onClick={() => setPaymentMethod("manual")}
                  className={`flex flex-col items-center gap-2 rounded-lg p-4 border transition-colors ${paymentMethod === "manual" ? "border-2" : "border-border"
                    }`}
                  style={
                    paymentMethod === "manual"
                      ? { borderColor: "var(--color-orange)" }
                      : {}
                  }
                >
                  <CreditCard className="w-6 h-6" style={{ color: "var(--color-orange)" }} />
                  <span className="text-sm font-medium">Virement bancaire</span>
                </button>
              )}

              {data.payment_providers.paypal.enabled && (
                <button
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex flex-col items-center gap-2 rounded-lg p-4 border transition-colors ${paymentMethod === "paypal" ? "border-2" : "border-border"
                    }`}
                  style={
                    paymentMethod === "paypal"
                      ? { borderColor: "var(--color-orange)" }
                      : {}
                  }
                >
                  <Wallet className="w-6 h-6" style={{ color: "#0070ba" }} />
                  <span className="text-sm font-medium">PayPal</span>
                </button>
              )}

              {data.credit_balance >= selectedPlanInfo.price && (
                <button
                  onClick={() => setPaymentMethod("credit")}
                  className={`flex flex-col items-center gap-2 rounded-lg p-4 border transition-colors ${paymentMethod === "credit" ? "border-2" : "border-border"
                    }`}
                  style={
                    paymentMethod === "credit"
                      ? { borderColor: "var(--color-orange)" }
                      : {}
                  }
                >
                  <Sparkles className="w-6 h-6" style={{ color: "#22c55e" }} />
                  <span className="text-sm font-medium">Credits</span>
                  <span className="text-xs text-muted-foreground">
                    Solde : {data.credit_balance.toLocaleString("fr-FR")} F
                  </span>
                </button>
              )}
            </div>

            {/* Manual payment form */}
            {paymentMethod === "manual" && (
              <ManualPaymentForm
                plan={selectedPlan}
                amount={selectedPlanInfo.price}
                bankInfo={data.payment_providers.manual}
                onSuccess={handlePaymentSuccess}
              />
            )}

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
                  Vous allez utiliser{" "}
                  <span className="font-bold">
                    {selectedPlanInfo.price.toLocaleString("fr-FR")} FCFA
                  </span>{" "}
                  de vos credits pour souscrire au plan{" "}
                  <span className="font-bold">{selectedPlanInfo.name}</span>.
                </p>
                <p className="text-xs text-muted-foreground">
                  Solde apres paiement :{" "}
                  {(data.credit_balance - selectedPlanInfo.price).toLocaleString("fr-FR")} FCFA
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

      {/* Payment history */}
      {data.payments && data.payments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Historique des paiements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {data.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: "var(--color-surface)" }}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {payment.amount.toLocaleString("fr-FR")} {payment.currency}
                      </span>
                      {getPaymentStatusBadge(payment.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {payment.payment_method === "manual"
                        ? "Virement bancaire"
                        : payment.payment_method === "paypal"
                          ? "PayPal"
                          : payment.payment_method === "credit"
                            ? "Credits"
                            : payment.payment_method}{" "}
                      —{" "}
                      {new Date(payment.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    {payment.description && (
                      <span className="text-xs text-muted-foreground">
                        {payment.description}
                      </span>
                    )}
                  </div>
                  {payment.proof_url && (
                    <a
                      href={payment.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs hover:underline"
                      style={{ color: "var(--color-orange)" }}
                    >
                      Voir preuve
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
