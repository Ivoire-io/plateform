import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { StartupLanding } from "@/components/startups/startup-landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Startups — Rendez votre startup visible en Côte d'Ivoire",
  description:
    "Lancez votre startup sur ivoire.io : page dédiée, annuaire, recrutement de développeurs, matching, upvotes. Le Product Hunt de la Côte d'Ivoire.",
  keywords: [
    "startup Côte d'Ivoire",
    "startup Abidjan",
    "lancer startup tech CI",
    "Product Hunt ivoirien",
    "recruter développeur Abidjan",
    "écosystème startup ivoirien",
  ],
  openGraph: {
    title: "Startups — Rendez votre startup visible | ivoire.io",
    description:
      "Lancez votre startup sur ivoire.io. Annuaire, recrutement, matching dev-startup.",
    url: "https://ivoire.io/startups/landing",
  },
};

export default function StartupLandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <StartupLanding />
      </main>
      <Footer />
    </>
  );
}
