import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de la plateforme ivoire.io — Comment nous protégeons vos données.",
};

export default function ConfidentialitePage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-8">Politique de confidentialité</h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Collecte des données</h2>
            <p>
              Nous collectons les données que vous fournissez lors de votre inscription et de l&apos;utilisation de la plateforme : nom, email, numéro de téléphone, compétences, liens professionnels, et informations de profil.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Créer et gérer votre compte et votre portfolio</li>
              <li>Vous mettre en relation avec des startups et recruteurs</li>
              <li>Améliorer nos services et votre expérience utilisateur</li>
              <li>Vous envoyer des notifications pertinentes (que vous pouvez désactiver)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Stockage et sécurité</h2>
            <p>
              Vos données sont stockées de manière sécurisée via Supabase (infrastructure hébergée en Europe). Nous utilisons le chiffrement en transit (HTTPS) et au repos pour protéger vos informations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Partage des données</h2>
            <p>
              Nous ne vendons jamais vos données personnelles. Les informations de votre profil public (portfolio) sont visibles par les visiteurs de votre sous-domaine. Les données de contact ne sont partagées qu&apos;avec votre consentement explicite.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Vos droits</h2>
            <p>Vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à contact@ivoire.io.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Cookies</h2>
            <p>
              Nous utilisons des cookies essentiels pour le fonctionnement du site (authentification, session) et des cookies analytiques (Plausible Analytics, respectueux de la vie privée, sans tracking individuel).
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
