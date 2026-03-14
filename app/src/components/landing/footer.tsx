import { Github, Instagram, Linkedin, Send, Twitter } from "lucide-react";
import Link from "next/link";

const socials = [
  { icon: Linkedin, href: "https://linkedin.com/company/ivoireio", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/ivoireio", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/ivoireio", label: "Instagram" },
  { icon: Send, href: "https://t.me/ivoireio", label: "Telegram" },
  { icon: Github, href: "https://github.com/ivoireio", label: "GitHub" },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-1 mb-6">
          <span className="text-lg font-bold text-white">ivoire</span>
          <span className="text-lg font-bold text-orange">.io</span>
        </Link>

        {/* Social links */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-muted hover:text-orange hover:border-orange/30 transition-colors"
              aria-label={social.label}
            >
              <social.icon size={18} />
            </a>
          ))}
        </div>

        {/* Tagline */}
        <p className="text-muted text-sm mb-2">
          Fait avec ❤️ depuis Abidjan 🇨🇮
        </p>

        {/* Copyright */}
        <p className="text-muted/50 text-xs">
          © {new Date().getFullYear()} ivoire.io — Tous droits réservés
        </p>
      </div>
    </footer>
  );
}
