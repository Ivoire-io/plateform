"use client";

import { Loader2, Rocket } from "lucide-react";
import { Suspense, useState } from "react";
import { BaseFields } from "./base-fields";
import { RegistrationSuccess } from "./registration-success";
import { useRegistrationForm } from "./use-registration-form";

type StartupRegistrationFormProps = {
  compact?: boolean;
  showHeader?: boolean;
};

const SECTORS = [
  "Fintech",
  "EdTech",
  "HealthTech",
  "AgriTech",
  "E-commerce",
  "SaaS",
  "Marketplace",
  "Logistique",
  "Media",
  "Energie",
  "Autre",
];

const STAGES = [
  { value: "idea", label: "Idée" },
  { value: "mvp", label: "MVP" },
  { value: "seed", label: "Lancement" },
  { value: "growth", label: "Croissance" },
];

function StartupFormInner({ compact = false, showHeader = true }: StartupRegistrationFormProps) {
  const form = useRegistrationForm();
  const [startupName, setStartupName] = useState("");
  const [tagline, setTagline] = useState("");
  const [sector, setSector] = useState("");
  const [stage, setStage] = useState("");
  const [problem, setProblem] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMode, setSuccessMode] = useState<"open" | "waitlist">(
    "waitlist"
  );

  const isFormValid =
    form.isBaseValid && startupName.trim().length >= 2 && sector && stage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitStatus("loading");
    setErrorMsg("");

    try {
      const referralCode = localStorage.getItem("ivoire_ref") || null;
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          full_name: form.fullName.trim(),
          desired_slug: form.slug,
          whatsapp:
            form.whatsappDigits.length > 0
              ? `+225${form.whatsappDigits}`
              : "",
          type: "startup",
          referral_code: referralCode,
          extra: {
            startup_name: startupName.trim(),
            tagline: tagline.trim() || undefined,
            sector,
            stage,
            problem_statement: problem.trim() || undefined,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || "Une erreur est survenue. Réessaie.");
        setSubmitStatus("error");
        return;
      }

      setSuccessMode(json.mode === "open" ? "open" : "waitlist");
      setSubmitStatus("success");
    } catch {
      setErrorMsg("Erreur de connexion. Réessaie.");
      setSubmitStatus("error");
    }
  };

  if (submitStatus === "success") {
    return <RegistrationSuccess slug={form.slug} mode={successMode} />;
  }

  return (
    <section className={`px-4 relative overflow-hidden ${compact ? "py-4 md:py-6" : "py-24"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--color-orange)_0%,_transparent_60%)] opacity-[0.04]" />
      <div className="relative max-w-xl mx-auto">
        {showHeader && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange/20 bg-orange/5 text-orange text-sm mb-6">
              <Rocket size={14} />
              Startup
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Lance ta startup
            </h1>
            <p className="text-muted max-w-sm mx-auto">
              Un projet structuré, une page en ligne, une communauté.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`bg-surface/60 backdrop-blur-sm border border-border rounded-3xl ${compact ? "p-4 md:p-5" : "p-8 md:p-10"} space-y-6`}
        >
          <BaseFields form={form} />

          <hr className="border-white/5 my-2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Nom de la startup *
              </label>
              <input
                required
                placeholder="TechCI, StockFacile..."
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-orange focus:ring-4 focus:ring-orange/10 transition-all hover:bg-white/[0.04]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Tagline{" "}
                <span className="text-muted/50 normal-case">(optionnel)</span>
              </label>
              <input
                placeholder="En une phrase, ce que vous faites"
                value={tagline}
                onChange={(e) => setTagline(e.target.value.slice(0, 120))}
                maxLength={120}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-orange focus:ring-4 focus:ring-orange/10 transition-all hover:bg-white/[0.04]"
              />
              <p className="text-xs text-muted/50 text-right">
                {tagline.length}/120
              </p>
            </div>
          </div>

          {/* Secteur + Stade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Secteur *
              </label>
              <select
                required
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange focus:ring-4 focus:ring-orange/10 transition-all hover:bg-white/[0.04] appearance-none"
              >
                <option value="" disabled>
                  Choisir un secteur
                </option>
                {SECTORS.map((s) => (
                  <option key={s} value={s.toLowerCase()}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Stade *
              </label>
              <select
                required
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange focus:ring-4 focus:ring-orange/10 transition-all hover:bg-white/[0.04] appearance-none"
              >
                <option value="" disabled>
                  Choisir un stade
                </option>
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Problème résolu */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">
              Le problème que vous résolvez{" "}
              <span className="text-muted/50 normal-case">(optionnel)</span>
            </label>
            <textarea
              placeholder="En quelques phrases..."
              value={problem}
              onChange={(e) => setProblem(e.target.value.slice(0, 300))}
              maxLength={300}
              rows={3}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-orange focus:ring-4 focus:ring-orange/10 transition-all hover:bg-white/[0.04] resize-none"
            />
            <p className="text-xs text-muted/50 text-right">
              {problem.length}/300
            </p>
          </div>

          {/* Error */}
          {submitStatus === "error" && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-400/5 border border-red-400/20 text-red-400 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitStatus === "loading" || !isFormValid}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-orange to-orange-hover text-white font-semibold text-sm transition-all disabled:opacity-40 disabled:from-white/5 disabled:to-white/5 disabled:text-white/40 disabled:shadow-none shadow-lg shadow-orange/20 hover:shadow-orange/40 hover:scale-[1.02]"
          >
            {submitStatus === "loading" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Création en cours…
              </>
            ) : (
              <>
                <Rocket size={18} />
                Lancer ma startup
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

export function StartupRegistrationForm(props: StartupRegistrationFormProps) {
  return (
    <Suspense>
      <StartupFormInner {...props} />
    </Suspense>
  );
}
