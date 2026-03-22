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
  return (
    <section id="roadmap" className="py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ce qui arrive</h2>
          <p className="text-muted max-w-lg mx-auto">
            On construit les choses étape par étape, pour que la plateforme grandisse avec vous.
          </p>
        </div>

        {/* Desktop: horizontal — Mobile: vertical */}
        <div className="relative">
          {/* Connecting line — desktop only */}
          <div className="hidden md:block absolute top-[2.35rem] left-[calc(10%+20px)] right-[calc(10%+20px)] h-px bg-border z-0" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isDone = step.status === "done";
              const isCurrent = step.status === "current";
              const isNext = step.status === "next";

              return (
                <div
                  key={step.label}
                  className="flex md:flex-col items-start md:items-center gap-4 md:gap-0 relative"
                >
                  {/* Vertical line — mobile only */}
                  {i < steps.length - 1 && (
                    <div className="md:hidden absolute left-[19px] top-10 w-px bottom-0 bg-border" />
                  )}

                  {/* Icon bubble */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                      ${isDone
                        ? "bg-green-500/20 border-2 border-green-500/40 text-green-400"
                        : isCurrent
                          ? "bg-orange shadow-lg shadow-orange/30 text-white ring-4 ring-orange/20"
                          : isNext
                            ? "bg-surface border-2 border-orange/40 text-orange"
                            : "bg-surface border border-border text-muted"
                      }`}
                  >
                    {isDone ? <Check size={18} /> : isCurrent ? <Check size={18} /> : <Icon size={16} />}
                  </div>

                  {/* Card */}
                  <div
                    className={`md:mt-6 flex-1 md:flex-none w-full md:text-center rounded-xl p-4 border transition-all
                      ${isDone
                        ? "bg-green-500/5 border-green-500/20"
                        : isCurrent
                          ? "bg-orange/5 border-orange/30"
                          : isNext
                            ? "bg-surface border-border/80"
                            : "bg-transparent border-transparent"
                      }`}
                  >
                    {/* Phase label */}
                    <span
                      className={`text-xs font-mono mb-1.5 block
                        ${isDone ? "text-green-400" : isCurrent ? "text-orange" : "text-muted/60"}`}
                    >
                      {step.phase}
                    </span>

                    {/* Title */}
                    <p
                      className={`font-semibold text-sm leading-snug mb-2
                        ${isDone ? "text-white/80" : isCurrent ? "text-white" : isNext ? "text-white/80" : "text-muted/60"}`}
                    >
                      {step.label}
                    </p>

                    {/* Status badge */}
                    {isDone && (
                      <span className="inline-flex items-center gap-1 mt-3 px-2.5 py-0.5 rounded-full bg-green-500/15 text-green-400 text-xs font-medium">
                        <Check size={12} />
                        Lancé
                      </span>
                    )}
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 mt-3 px-2.5 py-0.5 rounded-full bg-orange/15 text-orange text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
                        En cours
                      </span>
                    )}
                    {isNext && (
                      <span className="inline-flex items-center gap-1 mt-3 px-2.5 py-0.5 rounded-full bg-surface border border-border text-muted text-xs">
                        Bientôt
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
