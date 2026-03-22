import { DevRegistrationForm } from "@/components/registration/dev-registration-form";
import { RegistrationPageShell } from "@/components/registration/registration-page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rejoindre en tant que Développeur",
  description:
    "Crée ton portfolio développeur sur ivoire.io. Ton sous-domaine, ta visibilité, tes opportunités.",
};

export default function RejoindreDevPage() {
  return (
    <RegistrationPageShell
      eyebrow="Développeur"
      title="Crée ton portfolio ivoire.io"
      description="Réserve ton sous-domaine, rends ton profil visible et garde un accès clair à la page précédente."
      backHref="/rejoindre"
      backLabel="Retour aux parcours"
    >
      <DevRegistrationForm compact showHeader={false} />
    </RegistrationPageShell>
  );
}
