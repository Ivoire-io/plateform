import { Briefcase, Calendar, Code2, Rocket, Star, Users } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Portfolio sous-domaine",
    description:
      "Ton espace pro sur nom.ivoire.io. 3 templates, projets, certifications, liens — ton CV augmenté accessible au monde entier.",
  },
  {
    icon: Users,
    title: "Annuaire développeurs",
    description:
      "devs.ivoire.io — Recherche par compétences, ville, disponibilité. Trouve le talent ivoirien qu'il te faut en 2 clics.",
  },
  {
    icon: Rocket,
    title: "Startups directory",
    description:
      "Le Product Hunt de la Côte d'Ivoire. Lance ta startup, reçois des upvotes, gagne en visibilité auprès de toute la communauté tech.",
  },
  {
    icon: Briefcase,
    title: "Jobs & missions freelance",
    description:
      "Offres d'emploi tech, missions freelance, candidatures directes. Le pont entre recruteurs et développeurs ivoiriens.",
  },
  {
    icon: Star,
    title: "Matching dev-startup",
    description:
      "Un algorithme qui connecte les bons profils aux bons projets. Score de compatibilité, notifications, mise en relation directe.",
  },
  {
    icon: Calendar,
    title: "Reviews & rendez-vous",
    description:
      "Avis vérifiés sur les devs, prise de RDV en ligne. Construis ta réputation et laisse les clients te trouver.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          C&apos;est quoi <span className="text-orange">ivoire.io</span> ?
        </h2>
        <p className="text-muted text-center max-w-xl mx-auto mb-16">
          Une plateforme qui structure l&apos;écosystème tech ivoirien et rend
          ses talents visibles au monde.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-surface border border-border rounded-2xl p-8 hover:border-orange/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center mb-6 group-hover:bg-orange/20 transition-colors">
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
