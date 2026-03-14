import { Building2, Code2, Rocket } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Talents",
    description:
      "Ton portfolio professionnel sur nom.ivoire.io. Montre tes compétences, projets et expériences au monde entier.",
  },
  {
    icon: Rocket,
    title: "Startups",
    description:
      "Lance ton produit devant toute la communauté tech CI. Le Product Hunt de la Côte d'Ivoire.",
  },
  {
    icon: Building2,
    title: "Services",
    description:
      "Accède aux services essentiels du pays, centralisés sur une plateforme unique et moderne.",
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
