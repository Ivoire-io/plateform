"use client";

import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export function TeamTab() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5" style={{ color: "var(--color-orange)" }} />
          Équipe
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez les membres de votre équipe et leur présence sur ivoire.io.
        </p>
      </div>

      <div
        className="rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-16 gap-4 text-center"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <Users className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold">Gestion d&apos;équipe — Bientôt disponible</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Vous pourrez ajouter vos membres d&apos;équipe, les lier à leur profil ivoire.io et les afficher sur votre vitrine.
          </p>
        </div>
        <Button variant="outline" disabled className="opacity-50">
          + Ajouter un membre
        </Button>
      </div>
    </div>
  );
}
