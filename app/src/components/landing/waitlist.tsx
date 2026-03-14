"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { isValidSlug, RESERVED_SUBDOMAINS, TABLES } from "@/lib/utils";
import { Rocket } from "lucide-react";
import { useState } from "react";

type FormType = "developer" | "startup" | "enterprise" | "other";

export function WaitlistSection() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<FormType>("developer");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

    if (!cleanSlug || !isValidSlug(cleanSlug)) {
      setErrorMsg(
        "Le sous-domaine doit contenir 3-30 caractères (lettres, chiffres, tirets)."
      );
      setStatus("error");
      return;
    }

    if (RESERVED_SUBDOMAINS.has(cleanSlug)) {
      setErrorMsg("Ce sous-domaine est réservé. Choisis-en un autre.");
      setStatus("error");
      return;
    }

    try {
      const supabase = createClient();

      const { error } = await supabase.from(TABLES.waitlist).insert({
        email,
        full_name: fullName,
        desired_slug: cleanSlug,
        type,
      });

      if (error) {
        if (error.code === "23505") {
          setErrorMsg("Cet email ou ce sous-domaine est déjà pris !");
        } else {
          setErrorMsg("Une erreur est survenue. Réessaie.");
        }
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Erreur de connexion. Réessaie.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <section id="rejoindre" className="py-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-surface border border-green/30 rounded-2xl p-10">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Bienvenue !</h2>
            <p className="text-muted">
              Tu es inscrit(e) sur la liste. On te prévient dès que{" "}
              <span className="font-mono text-orange">
                {slug}.ivoire.io
              </span>{" "}
              est prêt.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="rejoindre" className="py-24 px-4">
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Rejoins les premiers bâtisseurs
        </h2>
        <p className="text-muted text-center mb-10">
          Réserve ton sous-domaine avant que quelqu&apos;un d&apos;autre le
          prenne.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-2xl p-8 space-y-5"
        >
          {/* Nom */}
          <div>
            <label className="block text-sm text-muted mb-2">
              Nom complet
            </label>
            <Input
              required
              placeholder="Ulrich Kouamé"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-muted mb-2">Email</label>
            <Input
              required
              type="email"
              placeholder="ulrich@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Sous-domaine */}
          <div>
            <label className="block text-sm text-muted mb-2">
              Sous-domaine souhaité
            </label>
            <div className="flex items-center bg-background border border-border rounded-lg overflow-hidden focus-within:border-orange focus-within:ring-1 focus-within:ring-orange transition-colors">
              <input
                id="waitlist-slug"
                required
                placeholder="ton-nom"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                  )
                }
                className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-muted focus:outline-none font-mono"
                maxLength={30}
              />
              <span className="text-muted px-3 py-3 bg-border/30 font-mono text-sm whitespace-nowrap">
                .ivoire.io
              </span>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm text-muted mb-3">Tu es :</label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: "developer", label: "🧑‍💻 Développeur" },
                  { value: "startup", label: "🚀 Startup" },
                  { value: "enterprise", label: "🏢 Entreprise" },
                  { value: "other", label: "✨ Autre" },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={`px-4 py-3 rounded-lg border text-sm transition-all cursor-pointer ${type === option.value
                      ? "border-orange bg-orange/10 text-white"
                      : "border-border bg-background text-muted hover:border-border/80"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {status === "error" && (
            <p className="text-red-400 text-sm">{errorMsg}</p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={status === "loading"}
            className="w-full"
          >
            {status === "loading" ? (
              "Inscription en cours..."
            ) : (
              <>
                <Rocket size={18} className="mr-2" />
                Réclamer mon .ivoire.io
              </>
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
