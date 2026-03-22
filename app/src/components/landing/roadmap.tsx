"use client";

import { motion, Variants } from "framer-motion";
import { Briefcase, Check, Code2, Lock, Rocket, Users } from "lucide-react";

type StepStatus = "done" | "current" | "next" | "future";

const steps: {
  phase: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: StepStatus;
}[] = [
    {
      phase: "Phase 1",
      label: "Portfolios Devs",
      description:
        "Un espace pro à ton nom (.ivoire.io) pour présenter simplement ton vrai niveau.",
      icon: Code2,
      status: "done",
    },
    {
      phase: "Phase 2",
      label: "Annuaire public",
      description:
        "La liste claire pour trouver les talents tech ivoiriens, sans chercher partout.",
      icon: Users,
      status: "done",
    },
    {
      phase: "Phase 3",
      label: "Startups",
      description:
        "Un espace pour lancer ton projet, le rendre visible et trouver tes premiers utilisateurs.",
      icon: Rocket,
      status: "current",
    },
    {
      phase: "Phase 4",
      label: "Emplois & Freelance",
      description:
        "Des offres de missions et de jobs qui viennent directement à toi.",
      icon: Briefcase,
      status: "next",
    },
    {
      phase: "Phase 5",
      label: "Confidentiel 🤫",
      description:
        "Comme Coca-Cola, on ne dévoile pas toute la recette secrète d'un seul coup...",
      icon: Lock,
      status: "next",
    },
  ];

export function RoadmapSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } as any },
  };

  return (
    <section id="roadmap" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange/5 rounded-full blur-[120px] -z-10" />

      <motion.div
        className="max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16 sm:mb-24">
          <h2 className="text-[2rem] sm:text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Ce qui arrive</h2>
          <p className="text-muted/90 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            On construit les choses étape par étape, pour que la plateforme grandisse avec vous et pour vous.
          </p>
        </motion.div>

        {/* Vertical Timeline */}
        <div className="relative mt-8 sm:mt-16">
          {/* Vertical Line Background (left on mobile, center on desktop) */}
          <div className="absolute top-0 bottom-0 left-[2.25rem] md:left-1/2 w-px bg-white/10 md:-translate-x-1/2" />

          {/* Vertical Progress Line (approximate fill) */}
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: "55%" }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            viewport={{ once: true }}
            className="absolute top-0 left-[2.25rem] md:left-1/2 w-px bg-gradient-to-b from-green-500 via-orange to-transparent md:-translate-x-1/2 z-0"
          />

          <div className="flex flex-col gap-12 sm:gap-20 relative z-10 w-full">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isDone = step.status === "done";
              const isCurrent = step.status === "current";
              const isNext = step.status === "next";
              const isEven = i % 2 === 0;

              return (
                <motion.div
                  key={step.label}
                  variants={itemVariants}
                  className={`flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-0 w-full group ${isEven ? "md:flex-row-reverse" : ""
                    }`}
                >
                  {/* Empty space for alternating layout desktop */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* Icon bubble */}
                  <div className="absolute left-[2.25rem] md:left-1/2 -translate-x-1/2 flex items-center justify-center bg-background rounded-2xl z-20">
                    <div
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                        ${isDone
                          ? "bg-green-500/20 border border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)] group-hover:scale-110 group-hover:bg-green-500/30"
                          : isCurrent
                            ? "bg-orange shadow-[0_0_30px_rgba(255,165,0,0.5)] text-white ring-4 ring-orange/20 scale-110 group-hover:scale-125 group-hover:ring-orange/40"
                            : isNext
                              ? "bg-surface border border-white/20 text-muted/60 backdrop-blur-sm group-hover:border-white/40 group-hover:text-white"
                              : "bg-surface border border-white/10 text-muted/40 backdrop-blur-sm"
                        }`}
                    >
                      {isDone ? <Check size={24} /> : isCurrent ? <Icon size={24} className="animate-pulse" /> : <Icon size={24} />}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div
                    className={`w-full md:w-1/2 flex pl-[5.5rem] md:pl-0 ${isEven ? "md:pr-16 md:justify-end text-left md:text-right" : "md:pl-16 md:justify-start text-left"
                      }`}
                  >
                    <div
                      className={`w-full max-w-lg rounded-[2rem] p-6 sm:p-8 md:p-10 border backdrop-blur-md transition-all duration-300 hover:-translate-y-2 relative overflow-hidden
                        ${isDone
                          ? "bg-green-500/5 border-green-500/20 hover:border-green-500/40"
                          : isCurrent
                            ? "bg-orange/10 border-orange/30 shadow-[0_8px_32px_rgba(255,165,0,0.15)] hover:border-orange/50 hover:shadow-[0_16px_48px_rgba(255,165,0,0.25)]"
                            : isNext
                              ? "bg-surface/30 border-white/5 hover:border-white/20"
                              : "bg-surface/10 border-transparent hover:border-white/5"
                        }`}
                    >
                      {/* Glow logic for current item */}
                      {isCurrent && (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange/10 to-transparent flex opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      )}

                      <div className={`flex flex-col relative z-10 ${isEven ? "md:items-end" : "md:items-start"}`}>
                        <span
                          className={`text-xs sm:text-sm font-mono mb-3 block uppercase tracking-widest
                            ${isDone ? "text-green-400" : isCurrent ? "text-orange font-bold" : "text-muted/50"}`}
                        >
                          {step.phase}
                        </span>

                        <h3
                          className={`font-bold text-xl sm:text-2xl lg:text-3xl leading-tight mb-4
                            ${isDone ? "text-white/90" : isCurrent ? "text-white" : isNext ? "text-white/90" : "text-muted/60"}`}
                        >
                          {step.label}
                        </h3>

                        <p className="text-sm sm:text-base lg:text-lg text-muted/80 leading-relaxed font-light mb-6">
                          {step.description}
                        </p>

                        <div className={`flex items-center gap-2 ${isEven ? "md:flex-row-reverse" : ""}`}>
                          {isDone && (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-xs sm:text-sm font-semibold border border-green-500/20">
                              <Check size={14} strokeWidth={3} />
                              Lancé
                            </span>
                          )}
                          {isCurrent && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/15 text-orange text-xs sm:text-sm font-semibold border border-orange/30">
                              <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                              En cours de dev
                            </span>
                          )}
                          {isNext && (
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-muted/60 text-xs sm:text-sm uppercase tracking-wider font-medium">
                              À venir
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
