"use client";

import { motion, Variants } from "framer-motion";
import { Briefcase, Code2, Lightbulb, Rocket, Users } from "lucide-react";
import Link from "next/link";

const devFeatures = [
  {
    icon: Code2,
    title: "Un portfolio simple",
    description:
      "Ton adresse nom.ivoire.io. Un bel espace direct pour montrer aux autres ce que tu as déjà construit.",
  },
  {
    icon: Users,
    title: "L'annuaire des talents",
    description:
      "Une liste ouverte pour trouver exactement le développeur qu'il faut, dans n'importe quelle ville du pays.",
  },
  {
    icon: Briefcase,
    title: "De la visibilité pour l'emploi",
    description:
      "Des offres de travail claires, sans CV à rallonge. Le pont direct entre recruteurs et profils tech.",
  },
];

const startupFeatures = [
  {
    icon: Lightbulb,
    title: "De l'idée à la startup",
    description:
      "Décris ton idée. L'outil génère ton dossier complet : logo, pitch deck et étude de marché instantanément.",
  },
  {
    icon: Rocket,
    title: "Une vitrine publique",
    description:
      "Ta startup a sa propre page. La communauté découvre, vote, et t'aide à trouver tes premiers utilisateurs.",
  },
  {
    icon: Users,
    title: "Recrute ton équipe",
    description:
      "Trouve les bons développeurs directement dans l'annuaire pour t'aider à construire ton produit. Contact facile et direct.",
  },
];

export function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } as any },
  };

  return (
    <section id="features" className="py-24 px-4 relative overflow-hidden">
      {/* Background glowing effects to match hero */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange/5 rounded-full blur-[120px] -z-10" />

      <motion.div
        className="max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants} className="text-[2rem] sm:text-4xl md:text-5xl font-extrabold text-center mb-6 tracking-tight">
          C&apos;est quoi <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-orange-400">ivoire.io</span> au juste ?
        </motion.h2>
        <motion.p variants={itemVariants} className="text-muted/90 text-lg text-center max-w-2xl mx-auto mb-20 font-light leading-relaxed">
          Un endroit unique qui regroupe les créateurs tech du pays pour les rendre facilement identifiables et créer des synergies.
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
          {/* Côté Développeurs */}
          <motion.div variants={itemVariants} className="bg-surface/20 p-6 sm:p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-sm relative overflow-hidden group/dev">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10 group-hover/dev:bg-blue-500/20 transition-colors duration-700" />

            <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center shadow-inner">
                <Code2 size={28} className="text-blue-500" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold">Pour les Développeurs</h3>
            </div>

            <div className="flex flex-col gap-6">
              {devFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-5 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                    <feature.icon size={22} className="text-blue-500/80" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1.5 text-white/90">{feature.title}</h4>
                    <p className="text-sm sm:text-base text-muted/80 leading-relaxed font-light">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/rejoindre/developpeur"
                className="group flex w-full sm:w-auto items-center justify-center px-8 py-4 rounded-full bg-blue-600/10 text-blue-500 border border-blue-500/20 font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 gap-3"
              >
                <Code2 size={20} />
                <span>Créer mon portfolio dev</span>
              </Link>
            </div>
          </motion.div>

          {/* Côté Startups */}
          <motion.div variants={itemVariants} className="bg-surface/20 p-6 sm:p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-sm relative overflow-hidden group/startup">
            <div className="absolute top-0 left-0 w-64 h-64 bg-orange/10 rounded-full blur-[80px] -z-10 group-hover/startup:bg-orange/20 transition-colors duration-700" />

            <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-orange/10 flex items-center justify-center shadow-inner">
                <Rocket size={28} className="text-orange" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold">Pour les Startups</h3>
            </div>

            <div className="flex flex-col gap-6">
              {startupFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-5 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-orange/10 flex items-center justify-center">
                    <feature.icon size={22} className="text-orange/80" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1.5 text-white/90">{feature.title}</h4>
                    <p className="text-sm sm:text-base text-muted/80 leading-relaxed font-light">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/rejoindre/startup"
                className="group flex w-full sm:w-auto items-center justify-center px-8 py-4 rounded-full bg-orange/10 text-orange border border-orange/20 font-semibold hover:bg-orange hover:text-white hover:border-orange transition-all duration-300 gap-3 shadow-[0_0_15px_rgba(255,165,0,0)] hover:shadow-[0_0_20px_rgba(255,165,0,0.3)]"
              >
                <Rocket size={20} />
                <span>Lancer ma startup</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
