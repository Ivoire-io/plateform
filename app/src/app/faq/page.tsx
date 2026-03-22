import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { SupportContactDialog } from "@/components/landing/support-contact-dialog";
import { EmailSVG } from "@/components/ui/email-svg";
import { FadeUp } from "@/components/ui/fade-up";
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
      <main className="relative pt-32 pb-24 min-h-screen overflow-hidden">
        {/* Transparent Background Glows */}
        <div className="pointer-events-none absolute left-0 top-1/4 -translate-x-1/2 h-[700px] w-[700px] rounded-full bg-orange/5 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 bottom-1/4 translate-x-1/3 h-[600px] w-[600px] rounded-full bg-orange/10 blur-[100px]" />

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <FadeUp delay={0.1}>
            <div className="text-center mb-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-orange/10 mb-8 border border-orange/20 shadow-[0_0_30px_rgba(249,115,22,0.15)] relative">
                <HelpCircle size={40} className="text-orange relative z-10" />
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Foire Aux <span className="text-orange">Questions</span></h1>
              <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto">
                Trouvez rapidement les réponses à vos questions.
              </p>
            </div>
          </FadeUp>

          <div className="space-y-16">
            {faqSections.map((group, groupIndex) => (
              <FadeUp key={group.category} delay={0.2 + (0.1 * groupIndex)}>
                <section>
                  <h2 className="text-3xl font-bold mb-4 flex items-center gap-4 text-white">
                    <span className="w-10 h-1 bg-orange rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></span>
                    {group.category}
                  </h2>
                  <p className="mb-8 max-w-3xl text-base leading-relaxed text-muted/80">
                    {group.intro}
                  </p>
                  <div className="space-y-4">
                    {group.questions.map((faq) => (
                      <div key={faq.q} className="bg-surface/50 backdrop-blur-sm border border-border/60 rounded-2xl p-6 md:p-8 hover:border-orange/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5 group">
                        <div className="mb-4 flex items-start gap-4">
                          <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange/10 text-orange group-hover:bg-orange group-hover:text-white transition-colors duration-300">
                            <ChevronRight size={16} />
                          </span>
                          <h3 className="text-lg md:text-xl font-semibold text-white leading-snug group-hover:text-orange transition-colors">{faq.q}</h3>
                        </div>
                        <p className="pl-10 text-muted/90 leading-relaxed text-base">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.6}>
            <div className="relative mt-24 rounded-3xl border border-border/60 bg-surface/50 backdrop-blur-md p-10 md:p-14 text-center overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange/5 via-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <h2 className="text-3xl font-bold mb-5 text-white relative z-10">Toujours pas la bonne réponse ?</h2>
              <p className="text-muted text-lg mb-10 max-w-xl mx-auto relative z-10">
                Passe par WhatsApp pour aller vite, ou ouvre le formulaire email pour une demande plus détaillée.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <a href="https://wa.me/2250171181800" className="inline-flex items-center justify-center h-14 px-8 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:-translate-y-0.5 gap-2.5 w-full sm:w-auto text-base">
                  <MessageCircle size={22} />
                  WhatsApp +225 01 71 18 18 00
                </a>
                <SupportContactDialog
                  triggerLabel="Nous envoyer un email"
                  triggerClassName="h-14 w-full border border-border bg-white/5 px-8 text-muted hover:border-orange/50 hover:bg-orange/10 hover:text-white sm:w-auto rounded-xl font-medium transition-all duration-300 text-base"
                />
              </div>
              <div className="text-sm text-muted/60 mt-8 flex flex-col items-center gap-3 relative z-10">
                <p>On répond généralement en quelques heures.</p>
                <div className="flex items-center gap-2">
                  <span>Ou écrivez-nous directement à :</span>
                  <EmailSVG className="h-6 w-[120px] opacity-70 hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </main>
      <Footer />
    </>
  );
}