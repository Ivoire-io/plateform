import { DevLanding } from "@/components/devs/dev-landing";
import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Développeurs — Ton portfolio pro en Côte d'Ivoire | ivoire.io",
  description:
    "Crée ton portfolio développeur sur ivoire.io. Un sous-domaine à ton nom, une visibilité dans l'annuaire, des opportunités qui viennent à toi.",
  keywords: [
    "développeur Côte d'Ivoire",
    "portfolio développeur Abidjan",
    "développeur ivoirien",
    "freelance tech CI",
    "annuaire développeurs",
    "emploi tech Abidjan",
  ],
  openGraph: {
    title: "Développeurs — Ton portfolio pro | ivoire.io",
    description:
      "Crée ton portfolio, sois visible, reçois des opportunités. La plateforme des développeurs ivoiriens.",
    url: "https://ivoire.io/developpeurs/landing",
  },
};

export default function DevLandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <DevLanding />
      </main>
      <Footer />
    </>
  );
}
