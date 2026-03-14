"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Loader2, Rocket, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type AvailabilityStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "reserved"
  | "invalid"
  | "too_short";

const STATUS_CONFIG: Record<
  Exclude<AvailabilityStatus, "idle" | "checking" | "too_short">,
  { label: string; color: string }
> = {
  available: { label: "Disponible !", color: "text-green-400" },
  taken: { label: "Déjà réservé", color: "text-red-400" },
  reserved: { label: "Nom réservé", color: "text-red-400" },
  invalid: {
    label: "3–30 caractères, commence et finit par une lettre ou chiffre",
    color: "text-yellow-400",
  },
};

function formatSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "") // supprimer les caractères non autorisés
    .replace(/-{2,}/g, "-") // pas de doubles tirets
    .slice(0, 30);
}

export function HeroSection() {
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<AvailabilityStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAvailability = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setStatus(value.length > 0 ? "too_short" : "idle");
      return;
    }
    setStatus("checking");
    try {
      const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (data.available === true) setStatus("available");
      else if (data.reason === "reserved") setStatus("reserved");
      else if (data.reason === "invalid_format") setStatus("invalid");
      else setStatus("taken");
    } catch {
      setStatus("idle");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSlug(e.target.value);
    setSlug(formatted);
    setStatus("idle");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkAvailability(formatted), 400);
  };

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleClaim = () => {
    const el = document.getElementById("rejoindre");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      if (slug) {
        const slugInput = document.getElementById("waitlist-slug") as HTMLInputElement | null;
        if (slugInput) {
          slugInput.value = slug;
          slugInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    }
  };

  const borderColor =
    status === "available"
      ? "border-green-400/60"
      : status === "taken" || status === "reserved" || status === "invalid"
        ? "border-red-400/60"
        : "border-border";

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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
          <div
            className={cn(
              "flex items-center bg-surface border rounded-lg overflow-hidden w-full sm:w-auto transition-colors duration-200",
              borderColor
            )}
          >
            <input
              type="text"
              placeholder="ton-nom"
              value={slug}
              onChange={handleChange}
              className="bg-transparent px-4 py-3 text-white placeholder:text-muted focus:outline-none w-full sm:w-48 font-mono"
              maxLength={30}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="none"
            />
            <span className="text-muted px-3 py-3 bg-border/30 font-mono text-sm whitespace-nowrap border-l border-border/40">
              .ivoire.io
            </span>
            {/* Status icon — après le suffixe */}
            {status !== "idle" && (
              <span className="pl-2 pr-3 flex items-center">
                {status === "checking" && (
                  <Loader2 size={15} className="text-muted animate-spin" />
                )}
                {status === "available" && (
                  <Check size={15} className="text-green-400" />
                )}
                {(status === "taken" ||
                  status === "reserved" ||
                  status === "invalid") && (
                    <X size={15} className="text-red-400" />
                  )}
              </span>
            )}
          </div>
          <Button
            size="default"
            onClick={handleClaim}
            disabled={status === "taken" || status === "reserved"}
            className="w-full sm:w-auto"
          >
            <Rocket size={18} className="mr-2" />
            Réclamer mon domaine
          </Button>
        </div>

        {/* Availability feedback */}
        <div className="h-5 mb-4">
          {status !== "idle" && status !== "checking" && status !== "too_short" && (
            <p
              className={cn(
                "text-sm font-medium transition-opacity duration-200",
                STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color
              )}
            >
              {slug && (
                <span className="font-mono text-white/60">{slug}.ivoire.io </span>
              )}
              {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label}
            </p>
          )}
          {status === "too_short" && (
            <p className="text-sm text-muted">
              Minimum 3 caractères
            </p>
          )}
        </div>

        {/* Counter */}
        <p className="text-muted text-sm">
          Rejoins les premiers bâtisseurs 🚀
        </p>
      </div>
    </section>
  );
}
