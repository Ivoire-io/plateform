"use client";

import { Button } from "@/components/ui/button";
import {
  FolderUp,
  Globe,
  Heart,
  Lightbulb,
  PenLine,
  Rocket,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export function StartupLanding() {
  return (
    <div className="pt-16">
      {/* ────────────── HERO ────────────── */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-orange)_0%,_transparent_50%)] opacity-[0.07]" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            Tu as une idée ?
            <br />
            <span className="text-orange">On la transforme en startup.</span>
          </h1>

          <p className="text-muted text-lg md:text-xl max-w-md mx-auto mb-10">
            Un dossier complet, une page en ligne, une communauté.
            Prêt en quelques minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/#rejoindre">
              <Button size="lg" className="gap-2">
                <Rocket size={18} />
                Commencer
              </Button>
            </Link>
            <Link href="/startups">
              <Button variant="outline" size="lg">
                Voir les startups
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────── PROJECT BUILDER ────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange/20 bg-orange/5 text-orange text-sm mb-6">
              <Sparkles size={14} />
              Project Builder
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Dis-nous où tu en es.
            </h2>
            <p className="text-muted max-w-md mx-auto">
              Le résultat est le même : un projet structuré, présentable et
              protégé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {/* Mode A */}
            <Link href="/#rejoindre" className="block">
              <div className="bg-surface border border-border rounded-2xl p-7 hover:border-green-400/30 transition-colors h-full">
                <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center mb-5">
                  <FolderUp size={20} className="text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">J&apos;ai déjà tout</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Importe tes fichiers. On audite et on complète.
                </p>
              </div>
            </Link>

            {/* Mode B */}
            <Link href="/#rejoindre" className="block">
              <div className="bg-surface border border-border rounded-2xl p-7 hover:border-orange/30 transition-colors h-full">
                <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center mb-5">
                  <PenLine size={20} className="text-orange" />
                </div>
                <h3 className="font-semibold mb-2">J&apos;ai des éléments</h3>
                <p className="text-sm text-muted leading-relaxed">
                  Un nom, des notes ? On construit le reste ensemble.
                </p>
              </div>
            </Link>

            {/* Mode C */}
            <Link href="/#rejoindre" className="block">
              <div className="bg-surface border border-orange/20 rounded-2xl p-7 hover:border-purple-400/30 transition-colors h-full relative">
                <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-orange/10 text-orange font-medium">
                  Populaire
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center mb-5">
                  <Lightbulb size={20} className="text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">
                  J&apos;ai juste l&apos;idée
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Décris ton idée. On s&apos;occupe de tout le reste.
                </p>
              </div>
            </Link>
          </div>

          <p className="text-center text-sm text-muted">
            Logo, pitch deck, étude de marché, nom de domaine, protection —
            tout est inclus. Gratuit.
          </p>
        </div>
      </section>

      {/* ────────────── CE QUE ÇA CHANGE ────────────── */}
      <section className="py-24 px-4 bg-surface/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Et après ?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: "Ta page est en ligne",
                desc: "Une vitrine pro pour ta startup. Partageable en un lien.",
              },
              {
                icon: Heart,
                title: "La communauté découvre",
                desc: "Les gens votent. Tu montes dans le classement.",
              },
              {
                icon: Users,
                title: "Tu recrutes",
                desc: "Publie des offres. Reçois des candidatures. Fais des entretiens.",
              },
              {
                icon: Zap,
                title: "Les bons profils viennent à toi",
                desc: "On connecte ta startup aux développeurs compatibles.",
              },
              {
                icon: Shield,
                title: "Ton idée est horodatée",
                desc: "Preuve de création datée dès ton inscription. Tu peux prouver que l'idée est la tienne.",
              },
              {
                icon: Sparkles,
                title: "Prépare ta levée de fonds",
                desc: "Dossier investisseur prêt. Suivi des levées bientôt disponible.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-surface border border-border rounded-2xl p-6 hover:border-orange/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center mb-4 group-hover:bg-orange/20 transition-colors">
                  <f.icon size={20} className="text-orange" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-muted text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────── CTA FINAL ────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-xl mx-auto text-center p-12 rounded-3xl bg-orange/5 border border-orange/20">
          <h2 className="text-3xl font-bold mb-4">Une idée suffit.</h2>
          <p className="text-muted mb-8">On s&apos;occupe du reste.</p>
          <Link href="/#rejoindre">
            <Button size="lg" className="gap-2">
              <Rocket size={18} />
              Créer ma startup
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
