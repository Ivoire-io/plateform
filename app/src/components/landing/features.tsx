import { Briefcase, Code2, Lightbulb, Rocket, Users } from "lucide-react";

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
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          C&apos;est quoi <span className="text-orange">ivoire.io</span> au juste ?
        </h2>
        <p className="text-muted text-center max-w-xl mx-auto mb-16">
          Un endroit qui regroupe les créateurs tech du pays pour les rendre facilement identifiables.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Côté Développeurs */}
          <div>
            <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Code2 size={20} className="text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold">Pour les Développeurs</h3>
            </div>

            <div className="flex flex-col gap-6">
              {devFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-surface/50 border border-border rounded-2xl p-6 hover:border-blue-500/30 transition-all hover:-translate-y-1 block group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                      <feature.icon size={24} className="text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Côté Startups */}
          <div>
            <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
              <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
                <Rocket size={20} className="text-orange" />
              </div>
              <h3 className="text-2xl font-semibold">Pour les Projets & Startups</h3>
            </div>

            <div className="flex flex-col gap-6">
              {startupFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-surface/50 border border-border rounded-2xl p-6 hover:border-orange/30 transition-all hover:-translate-y-1 block group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-orange/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-orange/20 transition-all">
                      <feature.icon size={24} className="text-orange" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
