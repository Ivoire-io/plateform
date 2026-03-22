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
  ],
  Légal: [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Confidentialité", href: "/confidentialite" },
    { label: "CGU", href: "/cgu" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Top: Logo + Nav columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-1 mb-4">
              <span className="text-lg font-bold text-white">ivoire</span>
              <span className="text-lg font-bold text-orange">.io</span>
            </Link>
            <p className="text-muted text-sm max-w-xs mb-4">
              Le hub central des développeurs, startups et services tech de Côte d&apos;Ivoire.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-muted hover:text-orange hover:border-orange/30 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA viral */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-surface border border-border rounded-xl hover:border-orange/30 transition-colors">
            <span className="text-muted text-sm">Dev ou startup en Côte d&apos;Ivoire ?</span>
            <Link href="/rejoindre" className="text-orange text-sm font-medium hover:underline">
              Crée ton portfolio gratuitement →
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-muted text-sm">
            Fait avec ❤️ depuis Abidjan 🇨🇮
          </p>
          <p className="text-muted/50 text-xs">
            © {new Date().getFullYear()} ivoire.io — Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
