"use client";

import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { useState } from "react";

export function HeroSection() {
  const [slug, setSlug] = useState("");

  const handleClaim = () => {
    if (slug.trim()) {
      const el = document.getElementById("rejoindre");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        // On pré-remplit le champ slug du formulaire
        const slugInput = document.getElementById(
          "waitlist-slug"
        ) as HTMLInputElement;
        if (slugInput) {
          slugInput.value = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
          slugInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    } else {
      document
        .getElementById("rejoindre")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-16 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-orange)_0%,_transparent_50%)] opacity-[0.07]" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface/50 text-sm text-muted mb-8">
          <span className="text-base">🇨🇮</span>
          <span>L&apos;OS Digital de la Côte d&apos;Ivoire</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
          La porte d&apos;entrée digitale
          <br />
          <span className="text-orange">de la tech ivoirienne</span>
        </h1>

        {/* Subtitle */}
        <p className="text-muted text-lg md:text-xl max-w-xl mx-auto mb-10">
          Le hub des développeurs, startups et services de Côte d&apos;Ivoire.
          Réclame ton espace.
        </p>

        {/* Subdomain input */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden w-full sm:w-auto">
            <input
              type="text"
              placeholder="ton-nom"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              className="bg-transparent px-4 py-3 text-white placeholder:text-muted focus:outline-none w-full sm:w-48 font-mono"
              maxLength={30}
            />
            <span className="text-muted px-3 py-3 bg-border/30 font-mono text-sm whitespace-nowrap">
              .ivoire.io
            </span>
          </div>
          <Button size="md" onClick={handleClaim} className="w-full sm:w-auto">
            <Rocket size={18} className="mr-2" />
            Réclamer mon sous-domaine
          </Button>
        </div>

        {/* Counter */}
        <WaitlistCounter />
      </div>
    </section>
  );
}

function WaitlistCounter() {
  // Le compteur sera hydraté côté client via Supabase
  // Pour le MVP, on affiche un texte statique qui sera mis à jour
  return (
    <p className="text-muted text-sm animate-pulse">
      Rejoins les premiers bâtisseurs 🚀
    </p>
  );
}
