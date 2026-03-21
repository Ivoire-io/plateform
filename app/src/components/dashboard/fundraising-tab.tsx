"use client";

import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

export function FundraisingTab() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" style={{ color: "var(--color-orange)" }} />
          Levée de fonds
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Suivez votre levée de fonds et gérez vos relations investisseurs.
        </p>
      </div>

      <div
        className="rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-16 gap-4 text-center"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <TrendingUp className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold">Tracker de levée de fonds — Bientôt disponible</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Vous pourrez suivre votre levée en cours, gérer vos investisseurs, uploader votre pitch deck et afficher une barre de progression sur votre vitrine.
          </p>
        </div>
        <Button variant="outline" disabled className="opacity-50">
          Configurer ma levée
        </Button>
      </div>

      <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-sm text-orange-400">
        💰 Fonctionnalité disponible sur le plan <strong>Premium</strong> — 5 000 FCFA/mois.
      </div>
    </div>
  );
}
