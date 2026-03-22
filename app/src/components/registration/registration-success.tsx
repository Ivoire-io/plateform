"use client";

import { CheckCircle2, Mail } from "lucide-react";

export function RegistrationSuccess({
  slug,
  mode,
}: {
  slug: string;
  mode: "open" | "waitlist";
}) {
  return (
    <section className="py-24 px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="relative bg-surface border border-green-500/20 rounded-3xl p-12 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#00A651_0%,_transparent_70%)] opacity-[0.06]" />
          <CheckCircle2
            className="mx-auto text-green-400 mb-5"
            size={56}
            strokeWidth={1.5}
          />
          {mode === "open" ? (
            <>
              <h2 className="text-2xl font-bold mb-3">Compte créé !</h2>
              <p className="text-muted mb-6">
                Vérifie ton email pour te connecter.{" "}
                <span className="font-mono text-orange font-medium">
                  {slug}.ivoire.io
                </span>{" "}
                est prêt.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 border border-orange/20 text-orange text-sm">
                <Mail size={14} />
                Lien de connexion envoyé
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-3">
                Tu es dans la liste !
              </h2>
              <p className="text-muted mb-6">
                On te prévient dès que{" "}
                <span className="font-mono text-orange font-medium">
                  {slug}.ivoire.io
                </span>{" "}
                est prêt à être activé.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 border border-orange/20 text-orange text-sm">
                <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                Lancement imminent
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
