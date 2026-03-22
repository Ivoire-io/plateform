export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQSection {
  category: string;
  intro: string;
  questions: FAQItem[];
}

export const faqSections: FAQSection[] = [
  {
    category: "Général",
    intro: "Comprendre la mission et le fonctionnement d'Ivoire.io",
    questions: [
      {
        q: "Qu'est-ce que Ivoire.io ?",
        a: "Ivoire.io est l'écosystème numérique de référence pour la tech en Côte d'Ivoire. C'est une plateforme qui rassemble les développeurs, connecte les startups aux talents, et facilite la création de projets technologiques innovants."
      },
      {
        q: "À qui s'adresse la plateforme ?",
        a: "Principalement aux développeurs et professionnels de la tech qui souhaitent valoriser leurs compétences, ainsi qu'aux fondateurs de startups et entreprises à la recherche de talents ou d'outils pour structurer leurs projets."
      },
      {
        q: "L'inscription est-elle gratuite ?",
        a: "Oui, la création d'un profil développeur et l'accès à l'annuaire de base sont totalement gratuits."
      }
    ]
  },
  {
    category: "Pour les Développeurs",
    intro: "Tout savoir sur les portfolios, la visibilité et les opportunités.",
    questions: [
      {
        q: "Pourquoi créer un portfolio sur Ivoire.io ?",
        a: "Votre portfolio Ivoire.io agit comme votre carte de visite professionnelle locale. Il met en valeur vos projets, votre stack technique et votre disponibilité, vous rendant directement visible auprès des recruteurs et fondateurs de la région."
      },
      {
        q: "Faut-il être un développeur senior pour s'inscrire ?",
        a: "Pas du tout ! La plateforme accueille tous les niveaux, des juniors aux profils très expérimentés. Ce qui compte le plus, c'est la présentation de vos projets personnels ou professionnels."
      },
      {
        q: "Comment les recruteurs peuvent-ils me contacter ?",
        a: "Ils peuvent vous contacter directement via la plateforme. Vous gardez le contrôle total sur votre disponibilité et les informations affichées sur votre profil public."
      }
    ]
  },
  {
    category: "Pour les Startups & Entreprises",
    intro: "Découvrez comment utiliser nos outils pour propulser votre projet.",
    questions: [
      {
        q: "Comment trouvez-vous des développeurs pour mon projet ?",
        a: "Vous pouvez parcourir notre annuaire de talents filtrable par compétences, disponibilité et expérience, ou utiliser nos outils de mise en relation pour trouver le bon profil pour votre équipe."
      },
      {
        q: "Qu'est-ce que le Project Builder ?",
        a: "C'est un outil intégré qui vous aide à structurer votre idée de startup de A à Z : de la formulation du problème à la définition de l'architecture technique, vous préparant ainsi au développement."
      },
      {
        q: "Mes idées de projets sont-elles protégées ?",
        a: "Oui, la confidentialité est au cœur de notre plateforme. Les informations sensibles de vos projets restent privées, et vous décidez des informations à rendre publiques pour attirer des talents ou des partenaires."
      }
    ]
  },
  {
    category: "Support et Assistance",
    intro: "Besoin d'aide ? Voici comment nous joindre.",
    questions: [
      {
        q: "Acceptez-vous les profils en dehors de la Côte d'Ivoire ?",
        a: "Pour l'instant, notre focus principal est l'écosystème ivoirien pour maximiser la pertinence des mises en relation locales, mais la diaspora ivoirienne est évidemment la bienvenue."
      },
      {
        q: "J'ai un problème technique, comment contacter le support ?",
        a: "Vous pouvez nous contacter directement sur WhatsApp au +225 01 71 18 18 00 ou utiliser le formulaire de contact par email disponible sur le site."
      }
    ]
  }
];
