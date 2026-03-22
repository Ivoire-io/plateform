import { EnterpriseRegistrationForm } from "@/components/registration/enterprise-registration-form";
import { RegistrationPageShell } from "@/components/registration/registration-page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rejoindre en tant qu'Entreprise",
  description:
    "Recrutez les meilleurs talents tech ivoiriens sur ivoire.io. Accédez à l'annuaire des développeurs.",
};

export default function RejoindreEntreprisePage() {
  return (
    <RegistrationPageShell
      eyebrow="Entreprise"
      title="Dépose ton besoin de recrutement"
      description="Accède au formulaire avec un vrai entête, un retour clair et moins de friction pour compléter l'inscription."
      backHref="/rejoindre"
      backLabel="Retour aux parcours"
    >
      <EnterpriseRegistrationForm compact showHeader={false} />
    </RegistrationPageShell>
  );
}
