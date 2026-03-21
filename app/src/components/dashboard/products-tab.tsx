"use client";

import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

export function ProductsTab() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Lightbulb className="h-5 w-5" style={{ color: "var(--color-orange)" }} />
          Produits
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Listez vos produits sur le portail startups.ivoire.io — le Product Hunt ivoirien.
        </p>
      </div>

      <div
        className="rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-16 gap-4 text-center"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <Lightbulb className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold">Gestion de produits — Bientôt disponible</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Vous pourrez publier vos produits sur startups.ivoire.io, recevoir des votes et être mis en avant dans le classement.
          </p>
        </div>
        <Button variant="outline" disabled className="opacity-50">
          + Ajouter un produit
        </Button>
      </div>
    </div>
  );
}
