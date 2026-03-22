import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { SupportContactDialog } from "@/components/landing/support-contact-dialog";
import { EmailSVG } from "@/components/ui/email-svg";
import { faqSections } from "@/lib/faq-content";
import { ChevronRight, HelpCircle, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Foire Aux Questions | ivoire.io",
  description: "Toutes les réponses utiles sur ivoire.io: développeurs, startups, portfolios, visibilité, support et phases publiques de lancement.",
};

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange/10 mb-6">
              <HelpCircle size={32} className="text-orange" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Foire Aux Questions</h1>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions.
            </p>
          </div>

          <div className="space-y-12">
            {faqSections.map((group) => (
              <section key={group.category}>
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                  <span className="w-8 h-px bg-orange/50"></span>
                  {group.category}
                </h2>
                <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted">
                  {group.intro}
                </p>
                <div className="space-y-4">
                  {group.questions.map((faq) => (
                    <div key={faq.q} className="bg-surface/50 border border-border rounded-xl p-6 hover:border-orange/20 transition-colors">
                      <div className="mb-3 flex items-start gap-3">
                        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange/10 text-orange">
                          <ChevronRight size={14} />
                        </span>
                        <h3 className="text-lg font-medium text-white">{faq.q}</h3>
                      </div>
                      <p className="pl-8 text-muted leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-20 rounded-3xl border border-border bg-surface p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Toujours pas la bonne réponse ?</h2>
            <p className="text-muted mb-8">
              Passe par WhatsApp pour aller vite, ou ouvre le formulaire email pour une demande plus détaillée.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://wa.me/2250171181800" className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-colors gap-2 w-full sm:w-auto">
                <MessageCircle size={18} />
                WhatsApp +225 01 71 18 18 00
              </a>
              <SupportContactDialog
                triggerLabel="Nous envoyer un email"
                triggerClassName="h-12 w-full border-border bg-white/5 px-6 text-muted hover:border-orange/50 hover:bg-white/[0.08] hover:text-white sm:w-auto"
              />
            </div>
            <div className="text-sm text-muted/60 mt-6 flex flex-col items-center gap-2">
              <p>On répond généralement en quelques heures.</p>
              <div className="flex items-center gap-1.5">
                <span>Ou écrivez-nous directement à :</span>
                <EmailSVG className="h-5 w-[110px]" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}