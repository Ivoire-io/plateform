import { SupportContactDialog } from "@/components/landing/support-contact-dialog";
import { EmailSVG } from "@/components/ui/email-svg";
import { Github, Instagram, Linkedin, Send, Twitter } from "lucide-react";
import Link from "next/link";

const socials = [
  { icon: Linkedin, href: "https://linkedin.com/company/ivoireio", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/ivoireio", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/ivoireio", label: "Instagram" },
  { icon: Send, href: "https://t.me/ivoireio", label: "Telegram" },
  { icon: Github, href: "https://github.com/ivoire-io", label: "GitHub" },
];

const footerLinks = {
  Plateforme: [
    { label: "Développeurs", href: "/devs" },
    { label: "Startups", href: "/startups/landing" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
  ],
  Légal: [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Confidentialité", href: "/confidentialite" },
    { label: "CGU", href: "/cgu" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border py-10 md:py-16 px-4 md:px-8 lg:px-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange/5 rounded-full blur-[150px] -z-10 opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* =========================================
            DESKTOP FOOTER (Hidden on Mobile) 
            ========================================= */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            {/* Brand column */}
            <div className="md:col-span-2 lg:col-span-2">
              <Link href="/" className="inline-flex items-center gap-1 mb-6 transition-transform hover:scale-105">
                <span className="text-2xl font-bold text-white">ivoire</span>
                <span className="text-2xl font-bold text-orange">.io</span>
              </Link>
              <p className="text-muted/80 text-base md:text-lg max-w-sm mb-8 leading-relaxed font-light">
                Le hub central des développeurs, startups et services tech de Côte d&apos;Ivoire.
              </p>
              {/* Social links */}
              <div className="flex items-center gap-4">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-surface/50 border border-white/5 flex items-center justify-center text-muted/80 hover:text-white hover:bg-orange/10 hover:border-orange/30 hover:-translate-y-1 transition-all duration-300 shadow-sm"
                    aria-label={social.label}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="lg:ml-auto">
                <h3 className="text-sm font-bold text-white/90 mb-6 uppercase tracking-wider">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted/70 text-base hover:text-orange transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Support column */}
            <div className="lg:ml-auto">
              <h3 className="text-sm font-bold text-white/90 mb-6 uppercase tracking-wider">Support</h3>
              <ul className="space-y-5">
                <li>
                  <a href="https://wa.me/2250171181800" className="flex items-center gap-3 text-muted/70 text-base hover:text-green-500 transition-colors group">
                    <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface/50 border border-white/5 group-hover:bg-green-500/10 group-hover:border-green-500/30 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                    </span>
                    +225 01 71 18 18 00
                  </a>
                </li>
                <li>
                  <SupportContactDialog
                    compact
                    triggerLabel="Contact par formulaire"
                    triggerVariant="ghost"
                    triggerSize="sm"
                    triggerClassName="h-auto justify-start gap-3 px-0 text-muted/70 text-base font-normal hover:bg-transparent hover:text-white"
                  />
                </li>
                <li className="pt-2">
                  <span className="text-muted/50 text-xs block mb-3 uppercase tracking-wider font-semibold">Email direct :</span>
                  <EmailSVG className="h-5 w-[120px] text-muted/70 hover:text-white transition-colors" />
                </li>
              </ul>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="text-center mb-12 relative z-10">
            <div className="inline-flex items-center gap-6 px-8 py-5 bg-surface/30 backdrop-blur-md border border-white/10 rounded-2xl hover:border-orange/30 hover:bg-surface/50 transition-all duration-300">
              <span className="text-white/80 text-base font-medium">Dev ou startup en Côte d&apos;Ivoire ?</span>
              <Link href="/rejoindre" className="inline-flex items-center gap-2 bg-orange text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange/90 transition-colors shadow-[0_0_20px_rgba(255,165,0,0.3)]">
                Rejoindre le mouvement
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </Link>
            </div>
          </div>

          {/* Desktop Bottom */}
          <div className="border-t border-white/5 pt-8 flex items-center justify-between">
            <p className="text-muted/70 text-sm font-medium">
              Fait avec ❤️ depuis Abidjan 🇨🇮
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-muted/60 text-sm font-medium">
                Tous les systèmes sont opérationnels
              </p>
            </div>
            <p className="text-muted/50 text-sm">
              © {new Date().getFullYear()} ivoire.io — Tous droits réservés
            </p>
          </div>
        </div>

        {/* =========================================
            MOBILE FOOTER (Minimalist & Elegant) 
            ========================================= */}
        <div className="md:hidden flex flex-col gap-8">
          {/* Header Card : Compact Logo & Status */}
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="text-xl font-bold text-white">ivoire</span>
              <span className="text-xl font-bold text-orange">.io</span>
            </Link>
            <div className="flex items-center gap-2 bg-surface/50 px-3 py-1.5 rounded-full border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted/80 text-xs font-medium tracking-wide">Opérations OK</span>
            </div>
          </div>

          {/* Compact Action Card - Inspired by the menu */}
          <div className="bg-surface/30 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-orange/20 transition-all duration-300">
            <div className="flex flex-col">
              <span className="text-white/90 text-sm font-semibold">Rejoindre le mouvement</span>
              <span className="text-muted/60 text-xs mt-0.5">Devs & Startups 🇨🇮</span>
            </div>
            <Link href="/rejoindre" className="w-10 h-10 bg-orange hover:bg-orange/90 text-white rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(255,165,0,0.2)] group-hover:scale-105">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </div>

          {/* Simple Link Row */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 px-2">
            <Link href="/mentions-legales" className="text-muted/60 text-xs hover:text-white transition-colors">Mentions légales</Link>
            <span className="text-muted/30 text-xs">•</span>
            <Link href="/confidentialite" className="text-muted/60 text-xs hover:text-white transition-colors">Confidentialité</Link>
            <span className="text-muted/30 text-xs">•</span>
            <Link href="/cgu" className="text-muted/60 text-xs hover:text-white transition-colors">CGU</Link>
          </div>

          {/* Footer Bottom Row : Socials & Copyright */}
          <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-2">
            <p className="text-muted/40 text-xs font-medium">© {new Date().getFullYear()} ivoire.io</p>
            {/* Small subtle socials */}
            <div className="flex items-center gap-2.5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-surface/30 border border-white/5 flex items-center justify-center text-muted/60 hover:text-white hover:bg-orange/10 hover:border-orange/30 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon size={14} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
