"use client";

import { ArrowRight, Briefcase, Code, Rocket } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center px-4 pt-16 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-orange)_0%,_transparent_50%)] opacity-[0.07]" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-surface/50 text-sm text-muted mb-8 backdrop-blur-sm shadow-sm">
          <span className="text-base">🇨🇮</span>
          <span>L&apos;Écosystème Digital de la Côte d&apos;Ivoire</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-8">
          La tech ivoirienne.
          <br />
          <span className="text-orange">Rassemblée.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-16 leading-relaxed">
          Le hub central pour trouver les meilleurs développeurs, lancer votre startup ou recruter votre prochaine équipe tech.
        </p>

        {/* Choix du parcours */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full max-w-4xl mx-auto mb-10">
          <Link href="/developpeurs/landing" className="group text-left p-6 sm:p-8 rounded-3xl bg-surface/60 backdrop-blur-sm border border-border hover:border-orange/40 hover:shadow-xl hover:shadow-orange/5 transition-all hover:-translate-y-1 block">
            <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Code size={24} className="text-orange" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Développeurs</h3>
            <p className="text-muted text-sm mb-6">Crée ton portfolio, sois visible, et reçois des opportunités tech.</p>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-white group-hover:text-orange transition-colors">
              Ton espace <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link href="/startups/landing" className="group text-left p-6 sm:p-8 rounded-3xl bg-surface/60 backdrop-blur-sm border border-border hover:border-orange/40 hover:shadow-xl hover:shadow-orange/5 transition-all hover:-translate-y-1 block">
            <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Rocket size={24} className="text-orange" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Startups</h3>
            <p className="text-muted text-sm mb-6">Lance ton idée, gagne en visibilité et trouve ton talent ou CTO.</p>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-white group-hover:text-orange transition-colors">
              Lancer le projet <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <div className="group text-left p-6 sm:p-8 rounded-3xl bg-surface/40 backdrop-blur-sm border border-border/50 opacity-60 cursor-not-allowed block relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white/5 border border-white/10 text-xs px-2.5 py-1 rounded-full text-white/50 backdrop-blur-md">
              Bientôt
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5">
              <Briefcase size={24} className="text-white/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white/70">Entreprises</h3>
            <p className="text-muted/60 text-sm mb-6">Trouve ton prochain talent tech sans chercher pendant des mois.</p>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-white/40">
              Recruter
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
