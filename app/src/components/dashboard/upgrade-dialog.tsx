"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  Crown,
  Loader2,
  Sparkles,
  Star,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface UpgradeDialogProps {
  currentPlan: string;
  onSelectPlan: (plan: string) => void;
  onClose: () => void;
}

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: "5 000 FCFA",
    priceNote: "paiement unique",
    icon: Zap,
    color: "#3b82f6",
    features: [
      "Logo HD (3 variations)",
      "Pitch deck (10 slides)",
      "One-pager executif",
      "Analyse concurrents",
      "Verification OAPI/RCCM",
      "Timestamp certifie",
      "Export PDF",
      "3 regenerations",
      "1 template premium",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "35 000 FCFA",
    priceNote: "par an",
    icon: Star,
    color: "#f97316",
    popular: true,
    features: [
      "Tout de Starter +",
      "Cahier des charges complet",
      "Business plan complet",
      "CGU (OHADA)",
      "Roadmap 12 mois",
      "Regenerations illimitees",
      "Tous les templates premium",
      "Module fundraising",
      "Module recrutement",
      "Badge Verifie",
      "Visibilite prioritaire",
      "Services dev",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "150 000 FCFA",
    priceNote: "par an",
    icon: Crown,
    color: "#eab308",
    features: [
      "Tout de Pro +",
      "Template Corporate",
      "Logo personnalise",
      "Mise en avant homepage",
      "Support dedie",
      "API Access",
    ],
  },
];

export function UpgradeDialog({
  currentPlan,
  onSelectPlan,
  onClose,
}: UpgradeDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);

  function handleSelect(plan: string) {
    setLoading(plan);
    onSelectPlan(plan);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-8">
          <Sparkles
            className="h-8 w-8 mx-auto mb-2"
            style={{ color: "var(--color-orange)" }}
          />
          <h2 className="text-2xl font-bold">Choisissez votre plan</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Debloquez toutes les fonctionnalites pour votre projet
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.key;
            const isHigher =
              PLANS.findIndex((p) => p.key === plan.key) >
              PLANS.findIndex((p) => p.key === currentPlan);

            return (
              <Card
                key={plan.key}
                className={`relative ${plan.popular ? "border-2" : ""}`}
                style={
                  plan.popular
                    ? { borderColor: "var(--color-orange)" }
                    : undefined
                }
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: "var(--color-orange)" }}
                  >
                    Populaire
                  </div>
                )}
                <CardHeader className="pb-3 text-center">
                  <Icon
                    className="h-8 w-8 mx-auto mb-2"
                    style={{ color: plan.color }}
                  />
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-xs text-muted-foreground block">
                      {plan.priceNote}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check
                          className="h-4 w-4 mt-0.5 shrink-0"
                          style={{ color: plan.color }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent || !isHigher || loading !== null}
                    onClick={() => handleSelect(plan.key)}
                    style={
                      !isCurrent && isHigher
                        ? { background: plan.color, color: "#fff" }
                        : undefined
                    }
                  >
                    {loading === plan.key ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {isCurrent
                      ? "Plan actuel"
                      : isHigher
                        ? "Choisir ce plan"
                        : "Inclus"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Etudiant ? Contactez-nous pour le tarif campus a 2 000 FCFA.
        </p>
      </div>
    </div>
  );
}
