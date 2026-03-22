"use client";

import { Code, Loader2, Rocket } from "lucide-react";
import { Suspense, useState } from "react";
import { BaseFields } from "./base-fields";
import { RegistrationSuccess } from "./registration-success";
import { useRegistrationForm } from "./use-registration-form";

type DevRegistrationFormProps = {
  compact?: boolean;
  showHeader?: boolean;
};

const SKILLS_OPTIONS = [
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "Python",
  "Flutter",
  "Go",
  "PHP",
  "Laravel",
  "Django",
  "Vue.js",
  "Angular",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "AWS",
  "Firebase",
  "Figma",
  "TailwindCSS",
  "Swift",
  "React Native",
  "Java",
  "Kotlin",
];

function DevFormInner({ compact = false, showHeader = true }: DevRegistrationFormProps) {
  const form = useRegistrationForm();
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [githubUrl, setGithubUrl] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMode, setSuccessMode] = useState<"open" | "waitlist">(
    "waitlist"
  );

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.isBaseValid) return;
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
          type: "developer",
          referral_code: referralCode,
          extra: {
            skills,
            title: title.trim() || undefined,
            city: city.trim() || undefined,
            github_url: githubUrl.trim() || undefined,
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
              <Code size={14} />
              Développeur
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Crée ton portfolio
            </h1>
            <p className="text-muted max-w-sm mx-auto">
              Ton sous-domaine, ta visibilité, tes opportunités.
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
                Titre / Rôle
              </label>
              <input
                placeholder="Développeur Full-Stack, UI Designer..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-orange focus:ring-4 focus:ring-orange/10 transition-all hover:bg-white/[0.04]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Ville
              </label>
              <input
                placeholder="Abidjan"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-orange focus:ring-4 focus:ring-orange/10 transition-all hover:bg-white/[0.04]"
              />
            </div>
          </div>

          {/* Compétences */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">
              Compétences principales
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILLS_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${skills.includes(skill)
                    ? "border-orange bg-orange text-white shadow-sm shadow-orange/30 scale-105"
                    : "border-white/10 bg-white/[0.02] text-muted hover:text-white hover:bg-white/[0.05]"
                    }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* GitHub */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">
              GitHub{" "}
              <span className="text-muted/50 normal-case">(optionnel)</span>
            </label>
            <input
              placeholder="https://github.com/ton-pseudo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-orange focus:ring-4 focus:ring-orange/10 transition-all hover:bg-white/[0.04]"
            />
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
            disabled={submitStatus === "loading" || !form.isBaseValid}
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
                Créer mon portfolio
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

export function DevRegistrationForm(props: DevRegistrationFormProps) {
  return (
    <Suspense>
      <DevFormInner {...props} />
    </Suspense>
  );
}
