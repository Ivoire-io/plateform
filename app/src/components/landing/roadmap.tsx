import { Briefcase, Check, Code2, Heart, Rocket, Users } from "lucide-react";

type StepStatus = "current" | "next" | "future";

const steps: {
  phase: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: StepStatus;
}[] = [
    {
      phase: "Phase 1",
      label: "Portfolios devs",
      description:
        "Un espace professionnel à ton nom. Réclame ton.ivoire.io et présente ton travail au monde.",
      icon: Code2,
      status: "current",
    },
    {
      phase: "Phase 2",
      label: "Annuaire devs",
      description:
        "devs.ivoire.io — trouve les meilleurs talents ivoiriens, par compétence, ville, disponibilité.",
      icon: Users,
      status: "next",
    },
    {
      phase: "Phase 3",
      label: "Startups CI",
      description:
        "Un Product Hunt made in Côte d'Ivoire. Découvre et soutiens les projets tech locaux.",
      icon: Rocket,
      status: "future",
    },
    {
      phase: "Phase 4",
      label: "Jobs & Missions",
      description:
        "Marketplace de freelance et offres d'emploi tech, connectant recruteurs et talents locaux.",
      icon: Briefcase,
      status: "future",
    },
    {
      phase: "Phase 5",
      label: "Services publics",
      description:
        "Santé, éducation, logement — des services digitaux adaptés aux réalités ivoiriennes.",
      icon: Heart,
      status: "future",
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
            Une vision étape par étape pour structurer l&apos;écosystème tech
            ivoirien.
          </p>
        </div>

        {/* Desktop: horizontal — Mobile: vertical */}
        <div className="relative">
          {/* Connecting line — desktop only */}
          <div className="hidden md:block absolute top-[2.35rem] left-[calc(10%+20px)] right-[calc(10%+20px)] h-px bg-border z-0" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
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
                      ${isCurrent
                        ? "bg-orange shadow-lg shadow-orange/30 text-white ring-4 ring-orange/20"
                        : isNext
                          ? "bg-surface border-2 border-orange/40 text-orange"
                          : "bg-surface border border-border text-muted"
                      }`}
                  >
                    {isCurrent ? <Check size={18} /> : <Icon size={16} />}
                  </div>

                  {/* Card */}
                  <div
                    className={`md:mt-6 flex-1 md:flex-none w-full md:text-center rounded-xl p-4 border transition-all
                      ${isCurrent
                        ? "bg-orange/5 border-orange/30"
                        : isNext
                          ? "bg-surface border-border/80"
                          : "bg-transparent border-transparent"
                      }`}
                  >
                    {/* Phase label */}
                    <span
                      className={`text-xs font-mono mb-1.5 block
                        ${isCurrent ? "text-orange" : "text-muted/60"}`}
                    >
                      {step.phase}
                    </span>

                    {/* Title */}
                    <p
                      className={`font-semibold text-sm leading-snug mb-2
                        ${isCurrent ? "text-white" : isNext ? "text-white/80" : "text-muted/60"}`}
                    >
                      {step.label}
                    </p>

                    {/* Description 
                    <p
                      className={`text-xs leading-relaxed
                        ${isCurrent ? "text-muted" : isNext ? "text-muted/70" : "text-muted/40"}`}
                    >
                      {step.description}
                    </p>*/}

                    {/* Status badge */}
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
