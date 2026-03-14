import { Check, Clock } from "lucide-react";

const steps = [
  { label: "Portfolios développeurs", status: "done" as const },
  { label: "Annuaire devs.ivoire.io", status: "soon" as const },
  { label: "Product Hunt des startups CI", status: "soon" as const },
  { label: "Marketplace & Jobs", status: "soon" as const },
  { label: "Services (santé, éducation, logement)", status: "soon" as const },
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Ce qui arrive
        </h2>
        <p className="text-muted text-center mb-16">
          Une vision étape par étape pour structurer l&apos;écosystème tech
          ivoirien.
        </p>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-start gap-4 relative">
              {/* Vertical line */}
              {i < steps.length - 1 && (
                <div className="absolute left-[19px] top-10 w-px h-full bg-border" />
              )}

              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${step.status === "done"
                    ? "bg-green text-white"
                    : "bg-surface border border-border text-muted"
                  }`}
              >
                {step.status === "done" ? (
                  <Check size={18} />
                ) : (
                  <Clock size={16} />
                )}
              </div>

              {/* Text */}
              <div className="pb-10">
                <p
                  className={`font-medium ${step.status === "done" ? "text-white" : "text-muted"
                    }`}
                >
                  {step.label}
                </p>
                {step.status === "done" && (
                  <span className="text-green text-sm">Bientôt ✨</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
