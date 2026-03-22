import { RegistrationPageShell } from "@/components/registration/registration-page-shell";
import { StartupRegistrationForm } from "@/components/registration/startup-registration-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rejoindre en tant que Startup",
  description:
    "Lance ta startup sur ivoire.io. Un projet structuré, une page en ligne, une communauté.",
};

export default function RejoindreStartupPage() {
  return (
    <RegistrationPageShell
      eyebrow="Startup"
      title="Inscris ta startup sans détour"
      description="Renseigne les informations essentielles sans perdre le contexte ni l'accès à la page précédente."
      backHref="/rejoindre"
      backLabel="Retour aux parcours"
    >
      <StartupRegistrationForm compact showHeader={false} />
    </RegistrationPageShell>
  );
}
