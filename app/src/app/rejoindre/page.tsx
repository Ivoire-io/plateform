import { ArrowLeft, ArrowRight, Briefcase, Code2, Rocket, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

const registrationOptions = [
  {
    title: "Développeur",
    description:
      "Crée ton portfolio, réserve ton sous-domaine et rends ton profil visible.",
    href: "/rejoindre/developpeur",
    icon: Code2,
    accent: "text-orange border-orange/20 bg-orange/5",
    disabled: false,
  },
  {
    title: "Startup",
    description:
      "Présente ton projet, ton secteur et ton stade pour rejoindre l'écosystème.",
    href: "/rejoindre/startup",
    icon: Rocket,
    accent: "text-orange border-orange/20 bg-orange/5",
    disabled: false,
  },
  {
    title: "Entreprise",
    description:
      "Accède aux talents tech ivoiriens et structure tes besoins de recrutement.",
    href: "/rejoindre/entreprise",
    icon: Briefcase,
    accent: "text-orange border-orange/20 bg-orange/5",
    disabled: true,
  },
  {
    title: "Autre profil",
    description:
      "Tu ne rentres dans aucune catégorie ? Utilise le formulaire rapide pour rejoindre la liste.",
    href: "/#rejoindre",
    icon: Sparkles,
    accent: "text-white border-white/10 bg-white/5",
    disabled: true,
  },
] as const;

export const metadata: Metadata = {
  title: "Rejoindre ivoire.io",
  description:
    "Choisis ton parcours d'inscription sur ivoire.io : développeur, startup, entreprise ou autre profil.",
};

export default function RejoindrePage() {
  return (
    <main className="min-h-screen px-4 py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-orange)_0%,_transparent_58%)] opacity-[0.05]" />

      <div className="relative max-w-5xl mx-auto">
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-orange transition-colors group font-medium"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Retour à l&apos;accueil
          </Link>
        </div>

        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange/20 bg-orange/5 text-orange text-sm mb-6">
            <Sparkles size={14} />
            Inscription
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choisis ton entrée sur ivoire.io
          </h1>
          <p className="text-muted text-base md:text-lg max-w-xl">
            Chaque parcours collecte les informations utiles à ton profil. Tu peux commencer avec le formulaire adapté à ton cas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrationOptions.map((option) => {
            const Icon = option.icon;

            return (
              <Link
                key={option.href}
                href={option.disabled ? "#" : option.href}
                aria-disabled={option.disabled}
                className={`group rounded-3xl border border-border bg-surface/60 backdrop-blur-sm p-7 transition-all ${option.disabled
                    ? "opacity-50 grayscale pointer-events-none cursor-not-allowed"
                    : "hover:-translate-y-1 hover:border-orange/30 hover:shadow-xl hover:shadow-orange/10"
                  }`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm ${option.accent}`}>
                    <Icon size={14} />
                    {option.title}
                  </div>
                  {option.disabled && (
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-surface border border-border/50 text-muted uppercase tracking-wider font-semibold">
                      Bientôt
                    </span>
                  )}
                </div>

                <h2 className="text-2xl font-semibold mb-3">{option.title}</h2>
                <p className="text-muted mb-8 leading-relaxed">{option.description}</p>

                <span className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${option.disabled ? "text-muted" : "text-white group-hover:text-orange"
                  }`}>
                  {option.disabled ? "Indisponible" : "Commencer"}
                  {!option.disabled && <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}