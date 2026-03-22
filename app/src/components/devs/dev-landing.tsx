"use client";

import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Code,
  Eye,
  Globe,
  MessageSquare,
  Rocket,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";

export function DevLanding() {
  return (
    <div className="pt-16">
      {/* ────────────── HERO ────────────── */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-orange)_0%,_transparent_50%)] opacity-[0.07]" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
            Ton nom.
            <span className="text-orange">ivoire.io</span>
          </h1>

          <p className="text-muted text-lg md:text-xl max-w-md mx-auto mb-10">
            Un portfolio pro, une visibilité réelle, des opportunités
            qui viennent à toi. Gratuit.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/rejoindre/developpeur">
              <Button size="lg" className="gap-2">
                <Rocket size={18} />
                Réclamer mon domaine
              </Button>
            </Link>
            <Link href="/devs">
              <Button variant="outline" size="lg">
                Voir l&apos;annuaire
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────── LE PROBLÈME ────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            LinkedIn est trop vague.
            <br />
            GitHub est trop technique.
            <br />
            <span className="text-orange">Il te faut un entre-deux.</span>
          </h2>
          <p className="text-muted max-w-md mx-auto">
            Un endroit qui te représente vraiment : tes projets, tes
            compétences, ta dispo. Visible par ceux qui recrutent.
          </p>
        </div>
      </section>

      {/* ────────────── CE QUE TU OBTIENS ────────────── */}
      <section className="py-24 px-4 bg-surface/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Ce que ça change pour toi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: "Un sous-domaine à ton nom",
                desc: "konan.ivoire.io — ton adresse pro. Mémorable, partageable, à toi.",
              },
              {
                icon: Eye,
                title: "Tu es visible",
                desc: "Ton profil apparaît dans l'annuaire. Les recruteurs te trouvent.",
              },
              {
                icon: Code,
                title: "Tes projets parlent pour toi",
                desc: "Montre ce que tu as construit. Pas de CV, des preuves.",
              },
              {
                icon: MessageSquare,
                title: "On te contacte directement",
                desc: "Les startups et entreprises t'écrivent via la plateforme.",
              },
              {
                icon: Star,
                title: "Ta crédibilité grandit",
                desc: "Recommandations, avis vérifiés, badge. Tu construis ta réputation.",
              },
              {
                icon: Briefcase,
                title: "Les offres viennent à toi",
                desc: "Emplois, missions freelance, collaborations. Sans chercher.",
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

      {/* ────────────── L'ÉCOSYSTÈME ────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Tu n&apos;es pas seul.
          </h2>
          <p className="text-muted max-w-lg mx-auto mb-12">
            ivoire.io c&apos;est un écosystème : développeurs, startups,
            entreprises, investisseurs. Plus il y a de monde, plus il y a
            d&apos;opportunités pour toi.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Users, label: "Développeurs" },
              { icon: Rocket, label: "Startups" },
              { icon: Briefcase, label: "Entreprises" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-surface border border-border rounded-2xl p-6 text-center"
              >
                <item.icon
                  size={24}
                  className="text-orange mx-auto mb-3"
                />
                <p className="text-sm font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────── CTA FINAL ────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-xl mx-auto text-center p-12 rounded-3xl bg-orange/5 border border-orange/20">
          <h2 className="text-3xl font-bold mb-4">
            Réclame ton <span className="text-orange">.ivoire.io</span>
          </h2>
          <p className="text-muted mb-8">
            Gratuit. En 2 minutes.
          </p>
          <Link href="/rejoindre/developpeur">
            <Button size="lg" className="gap-2">
              <Rocket size={18} />
              Créer mon portfolio
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
