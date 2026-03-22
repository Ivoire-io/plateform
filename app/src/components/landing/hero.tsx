"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, Briefcase, Code, Rocket } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } as any },
  };

  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center px-4 pt-28 pb-12 sm:pb-24 relative overflow-hidden">
      {/* Dynamic Backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background z-0" />
      <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--color-orange)_0%,_transparent_60%)] opacity-[0.15] mix-blend-screen" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange/10 rounded-full blur-[100px] opacity-50" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] opacity-40" />

      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-orange/20 bg-orange/5 backdrop-blur-xl mb-12 shadow-[0_0_20px_rgba(255,165,0,0.1)] hover:shadow-[0_0_25px_rgba(255,165,0,0.15)] transition-shadow">
          <span className="text-lg">🇨🇮</span>
          <span className="text-sm font-medium tracking-wide text-white/90">L&apos;Écosystème Digital Numéro 1</span>
        </motion.div>

        {/* Title */}
        <motion.h1 variants={itemVariants} className="text-[2.75rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter text-center mb-8 text-white w-full px-2">
          La tech ivoirienne.
          <br className="sm:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange via-orange-400 to-yellow-500 drop-shadow-sm ml-0 sm:ml-4">
            Rassemblée.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={itemVariants} className="text-muted/90 text-base md:text-xl text-center max-w-2xl mx-auto mb-20 leading-relaxed px-4 font-light">
          Le hub central pour trouver les meilleurs développeurs, lancer votre startup ou recruter votre prochaine équipe tech en un clic.
        </motion.p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-[1200px] mx-auto z-20 pb-16">
          <motion.div variants={itemVariants} className="w-full">
            <Link href="/developpeurs/landing" className="group flex flex-col h-full text-left p-8 md:p-10 rounded-[2.5rem] bg-surface/40 backdrop-blur-md border border-white/10 hover:border-orange/50 hover:bg-surface/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(255,165,0,0.2)]">
              <div className="w-16 h-16 rounded-2xl bg-orange/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Code size={32} className="text-orange" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">Développeurs</h3>
              <p className="text-muted text-base md:text-lg mb-10 flex-grow leading-relaxed">Crée ton portfolio pro, sois visible 24/7, et reçois de vraies opportunités tech.</p>
              <div className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-orange transition-colors mt-auto">
                Ton espace <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full">
            <Link href="/startups/landing" className="group flex flex-col h-full text-left p-8 md:p-10 rounded-[2.5rem] bg-surface/40 backdrop-blur-md border border-white/10 hover:border-blue-500/50 hover:bg-surface/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)]">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Rocket size={32} className="text-blue-500" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">Startups</h3>
              <p className="text-muted text-base md:text-lg mb-10 flex-grow leading-relaxed">Lance ton idée, gagne en visibilité immédiate et trouve ton talent tech ou CTO.</p>
              <div className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:text-blue-500 transition-colors mt-auto">
                Lancer le projet <ArrowRight size={18} className="transition-transform group-hover:translate-x-1.5" />
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="w-full sm:col-span-2 lg:col-span-1">
            <div className="group flex flex-col h-full text-left p-8 md:p-10 rounded-[2.5rem] bg-surface/20 backdrop-blur-sm border border-white/5 opacity-80 cursor-not-allowed relative overflow-hidden">
              <div className="absolute top-8 right-8 bg-white/10 border border-white/10 text-xs font-bold px-4 py-2 rounded-full text-white/70 backdrop-blur-md uppercase tracking-wider">
                Bientôt
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8">
                <Briefcase size={32} className="text-white/40" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white/70">Entreprises</h3>
              <p className="text-muted/60 text-base md:text-lg mb-10 flex-grow leading-relaxed">Trouve ton prochain talent tech vérifié sans chercher pendant des mois.</p>
              <div className="inline-flex items-center gap-2 text-sm font-bold text-white/40 mt-auto">
                Recruter
              </div>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </section>
  );
}
