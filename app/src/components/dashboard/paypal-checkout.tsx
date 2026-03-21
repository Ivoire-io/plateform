"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ExternalLink,
  Loader2,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PayPalCheckoutProps {
  plan: string;
  amount: number;
  onSuccess: () => void;
}

const PAYPAL_ORDER_KEY = "ivoire_paypal_order_id";
const PAYPAL_PLAN_KEY = "ivoire_paypal_plan";

export function PayPalCheckout({ plan, amount, onSuccess }: PayPalCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [amountEur, setAmountEur] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // On mount, check if we're returning from PayPal
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isPaypalSuccess = params.get("paypal") === "success";

    if (isPaypalSuccess) {
      const storedOrderId = localStorage.getItem(PAYPAL_ORDER_KEY);
      if (storedOrderId) {
        captureOrder(storedOrderId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createOrder() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/payments/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de la creation de la commande PayPal");
      }

      const data = await res.json();
      const { order_id, approve_url, amount_eur } = data;

      setAmountEur(amount_eur);

      // Save order_id and plan to localStorage before redirect
      localStorage.setItem(PAYPAL_ORDER_KEY, order_id);
      localStorage.setItem(PAYPAL_PLAN_KEY, plan);

      // Redirect to PayPal for approval
      window.location.href = approve_url;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Erreur lors de la connexion a PayPal",
      );
      toast.error("Impossible de creer la commande PayPal");
    } finally {
      setLoading(false);
    }
  }

  async function captureOrder(orderId: string) {
    setCapturing(true);
    setError(null);

    try {
      const res = await fetch("/api/dashboard/payments/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de la capture du paiement");
      }

      // Clean up localStorage
      localStorage.removeItem(PAYPAL_ORDER_KEY);
      localStorage.removeItem(PAYPAL_PLAN_KEY);

      // Clean up URL params
      const url = new URL(window.location.href);
      url.searchParams.delete("paypal");
      url.searchParams.delete("token");
      url.searchParams.delete("PayerID");
      window.history.replaceState({}, "", url.toString());

      toast.success("Paiement PayPal confirme ! Votre abonnement est actif.");
      onSuccess();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Erreur lors de la confirmation du paiement",
      );
      toast.error("Echec de la confirmation du paiement PayPal");
      // Clean up localStorage on failure too
      localStorage.removeItem(PAYPAL_ORDER_KEY);
      localStorage.removeItem(PAYPAL_PLAN_KEY);
    } finally {
      setCapturing(false);
    }
  }

  if (capturing) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-orange)" }} />
          <p className="text-sm font-medium">Confirmation du paiement en cours...</p>
          <p className="text-xs text-muted-foreground">
            Veuillez patienter pendant que nous validons votre paiement PayPal.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Wallet className="w-4 h-4" style={{ color: "#0070ba" }} />
          Paiement via PayPal
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div
          className="rounded-lg p-4 flex flex-col gap-2"
          style={{ background: "var(--color-surface)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Montant (FCFA)</span>
            <span className="text-sm font-bold">
              {amount.toLocaleString("fr-FR")} FCFA
            </span>
          </div>
          {amountEur && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Montant (EUR)</span>
              <span className="text-sm font-bold">
                {amountEur.toFixed(2)} EUR
              </span>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Vous allez etre redirige vers PayPal pour completer votre paiement en
          toute securite. Le montant sera converti en euros au taux en vigueur.
        </p>

        {error && (
          <div className="rounded-lg p-3 bg-red-500/10 text-red-500 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={createOrder}
          disabled={loading}
          className="w-full"
          style={{ background: "#0070ba", color: "#fff" }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connexion a PayPal...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4 mr-2" />
              Payer avec PayPal
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Paiement securise par PayPal. Votre abonnement sera active immediatement
          apres confirmation.
        </p>
      </CardContent>
    </Card>
  );
}
