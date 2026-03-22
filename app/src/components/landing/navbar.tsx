"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { ChevronRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Développeurs", href: "/developpeurs/landing", desc: "Crée ton portfolio" },
  { label: "Startups", href: "/startups/landing", desc: "Lance ton projet" },
  { label: "Blog", href: "/blog", desc: "Actus & articles" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const joinHref =
    pathname === "/developpeurs/landing"
      ? "/rejoindre/developpeur"
      : pathname === "/startups/landing"
        ? "/rejoindre/startup"
        : "/rejoindre";

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const menuVariants: Variants = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as any }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as any }
    }
  };

  const linkVariants: Variants = {
    closed: { opacity: 0, y: 20 },
    open: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.1 + i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] as any }
    } as any)
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 h-16 sm:h-20",
          scrolled || mobileOpen
            ? "bg-background/80 backdrop-blur-2xl border-b border-white/5"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center relative z-[101]" onClick={() => setMobileOpen(false)}>
            <Image
              src="/logo-ivoire.io-blanc.webp"
              alt="ivoire.io"
              width={140}
              height={32}
              className="h-8 sm:h-9 w-auto hover:opacity-80 transition-opacity"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/70 hover:text-white font-medium transition-colors text-sm tracking-wide"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-6 w-px bg-white/10 mx-2" />
            <Link
              href="/login"
              className="text-white/70 hover:text-white font-medium transition-colors text-sm tracking-wide"
            >
              Connexion
            </Link>
            <a href={joinHref}>
              <Button size="default" className="bg-orange hover:bg-orange/90 text-white font-semibold rounded-full px-6 shadow-[0_0_15px_rgba(255,165,0,0.3)] hover:shadow-[0_0_25px_rgba(255,165,0,0.5)] transition-all">
                Rejoindre
              </Button>
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden relative z-[101] w-10 h-10 flex items-center justify-center text-white/90 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10 focus:outline-none"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <motion.div animate={{ rotate: mobileOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Fullscreen Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 z-[90] bg-background/98 backdrop-blur-3xl flex flex-col pt-24 px-4 sm:px-6 md:hidden overflow-y-auto min-h-[100dvh]"
          >
            {/* Background glowing effects for the menu */}
            <div className="absolute top-1/4 left-0 w-64 h-64 bg-orange/10 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10" />

            <div className="flex flex-col gap-4 mt-6 flex-grow">
              {navLinks.map((link, i) => (
                <motion.div custom={i} variants={linkVariants} key={link.href}>
                  <Link
                    href={link.href}
                    className="group border border-white/5 bg-white/[0.03] p-5 rounded-3xl flex items-center justify-between hover:bg-white/[0.08] hover:border-white/10 transition-all active:scale-[0.98]"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div>
                      <div className="text-[1.35rem] leading-none font-bold text-white mb-2 group-hover:text-orange transition-colors">
                        {link.label}
                      </div>
                      <div className="text-sm font-light text-white/50">
                        {link.desc}
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-orange/20 transition-colors">
                      <ChevronRight size={22} className="text-white/40 group-hover:text-orange transition-colors" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              custom={4}
              variants={linkVariants}
              className="mt-auto pt-8 mb-10 flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/login"
                  className="flex items-center justify-center px-4 py-4 rounded-3xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors active:scale-95"
                  onClick={() => setMobileOpen(false)}
                >
                  Connexion
                </Link>
                <a
                  href={joinHref}
                  className="flex items-center justify-center px-4 py-4 rounded-3xl bg-gradient-to-r from-orange to-orange-400 text-white font-bold shadow-[0_0_20px_rgba(255,165,0,0.3)] hover:shadow-[0_0_30px_rgba(255,165,0,0.5)] transition-all active:scale-95"
                  onClick={() => setMobileOpen(false)}
                >
                  Rejoindre
                </a>
              </div>
              <div className="text-center text-xs font-medium tracking-wide text-white/30 mt-6 uppercase">
                L&apos;Écosystème Digital Numéro 1 🇨🇮
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
