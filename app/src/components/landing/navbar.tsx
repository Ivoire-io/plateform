"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-bold text-white">ivoire</span>
          <span className="text-xl font-bold text-orange">.io</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            className="text-muted hover:text-white transition-colors text-sm"
          >
            À propos
          </a>
          <a
            href="#roadmap"
            className="text-muted hover:text-white transition-colors text-sm"
          >
            Roadmap
          </a>
          <a href="#rejoindre">
            <Button size="sm">Rejoindre</Button>
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 pb-4 flex flex-col gap-4">
          <a
            href="#features"
            className="text-muted hover:text-white transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            À propos
          </a>
          <a
            href="#roadmap"
            className="text-muted hover:text-white transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Roadmap
          </a>
          <a href="#rejoindre" onClick={() => setMobileOpen(false)}>
            <Button size="sm" className="w-full">
              Rejoindre
            </Button>
          </a>
        </div>
      )}
    </nav>
  );
}
