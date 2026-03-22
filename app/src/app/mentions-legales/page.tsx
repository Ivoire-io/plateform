import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de la plateforme ivoire.io",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-8">Mentions légales</h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Éditeur du site</h2>
            <p>
              Le site ivoire.io est édité par ivoire.io.<br />
              Siège social : Abidjan, Côte d&apos;Ivoire<br />
              Email : contact@ivoire.io
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Directeur de la publication</h2>
            <p>Le directeur de la publication est le représentant légal de ivoire.io.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Hébergement</h2>
            <p>
              Le site est hébergé par Vercel Inc.<br />
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu du site ivoire.io (textes, images, logos, design) est protégé par le droit de la propriété intellectuelle. Toute reproduction, même partielle, est interdite sans autorisation préalable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Données personnelles</h2>
            <p>
              Les informations collectées sont traitées conformément à notre{" "}
              <a href="/confidentialite" className="text-orange hover:underline">
                politique de confidentialité
              </a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
