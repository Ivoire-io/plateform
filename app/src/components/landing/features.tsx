import { Briefcase, Calendar, Code2, Rocket, Star, Users } from "lucide-react";

const features = [
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
    icon: Rocket,
    title: "La vitrine des startups",
    description:
      "Lance ton idée ici. La communauté vote, te donne de la force et t'aide à te faire de premiers clients.",
  },
  {
    icon: Briefcase,
    title: "De la visibilité pour l'emploi",
    description:
      "Des offres de travail claires, sans CV à rallonge. Le pont direct entre recruteurs et profils tech.",
  },
  {
    icon: Star,
    title: "La bonne équipe",
    description:
      "On t'aide à croiser la route des personnes qui veulent construire les mêmes choses que toi.",
  },
  {
    icon: Calendar,
    title: "Contact sans barrière",
    description:
      "Ceux qui ont besoin de tes talents peuvent t'identifier et te laisser un message directement.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          C&apos;est quoi <span className="text-orange">ivoire.io</span> au juste ?
        </h2>
        <p className="text-muted text-center max-w-xl mx-auto mb-16">
          Un endroit qui regroupe les créateurs tech du pays pour les rendre facilement identifiables.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-surface/50 border border-border rounded-2xl p-8 hover:border-orange/30 transition-all hover:-translate-y-1 block h-full group"
            >
              <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange/20 transition-all">
                <feature.icon size={24} className="text-orange" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
