import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Conditions générales d'utilisation de la plateforme ivoire.io",
};

export default function CGUPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-8">Conditions Générales d&apos;Utilisation</h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Objet</h2>
            <p>
              Les présentes CGU régissent l&apos;utilisation de la plateforme ivoire.io, accessible à l&apos;adresse ivoire.io et ses sous-domaines. En utilisant la plateforme, vous acceptez ces conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Inscription</h2>
            <p>
              L&apos;inscription est gratuite et ouverte à toute personne physique ou morale. Vous êtes responsable de l&apos;exactitude des informations fournies et de la confidentialité de vos identifiants de connexion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Sous-domaines personnalisés</h2>
            <p>
              Chaque utilisateur peut réclamer un sous-domaine (nom.ivoire.io) pour son portfolio. Ce sous-domaine est attribué sur la base du premier arrivé, premier servi. ivoire.io se réserve le droit de révoquer un sous-domaine en cas d&apos;utilisation abusive ou de non-respect des CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contenu utilisateur</h2>
            <p>
              Vous êtes responsable du contenu que vous publiez sur votre portfolio et profil. Il est interdit de publier du contenu illégal, diffamatoire, discriminatoire, ou portant atteinte aux droits de tiers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Propriété intellectuelle</h2>
            <p>
              Vous conservez la propriété de votre contenu. En publiant sur ivoire.io, vous nous accordez une licence non-exclusive pour afficher ce contenu dans le cadre du fonctionnement de la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Responsabilité</h2>
            <p>
              ivoire.io est une plateforme de mise en relation. Nous ne sommes pas responsables des transactions, accords ou litiges entre utilisateurs. La plateforme est fournie &quot;en l&apos;état&quot;.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Résiliation</h2>
            <p>
              Vous pouvez supprimer votre compte à tout moment. Nous nous réservons le droit de suspendre ou supprimer un compte en cas de violation des CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Modification des CGU</h2>
            <p>
              Nous pouvons modifier ces CGU à tout moment. Les utilisateurs seront informés des modifications significatives. L&apos;utilisation continue de la plateforme après modification vaut acceptation.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
