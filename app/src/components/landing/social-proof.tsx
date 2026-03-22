"use client";

import { motion } from "framer-motion";
import { Rocket, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface Stats {
  waitlist: number;
  portfolios: number;
  startups: number;
}

function AnimatedCounter({ value, label, icon: Icon }: { value: number; label: string; icon: React.ElementType }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1500;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:bg-white/[0.04] transition-colors group relative overflow-hidden">
      {/* Background glow per card */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="w-12 h-12 rounded-2xl bg-orange/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10">
        <Icon size={24} className="text-orange" />
      </div>
      <span className="text-4xl sm:text-5xl font-extrabold tabular-nums tracking-tighter text-white mb-1.5 relative z-10">{display}+</span>
      <span className="text-xs sm:text-sm font-bold text-white/50 uppercase tracking-[0.2em] relative z-10">{label}</span>
    </div>
  );
}

export function SocialProof() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => { });
  }, []);

  if (!stats || (stats.waitlist === 0 && stats.portfolios === 0)) return null;

  return (
    <section className="py-16 sm:py-24 px-4 relative z-20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-surface/20 relative overflow-hidden backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 sm:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-orange/10 rounded-full blur-[100px] -z-10" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] -z-10" />

          <div className="flex flex-col items-center justify-center mb-12">
            <p className="text-center text-lg sm:text-xl font-light text-white/80 max-w-md mx-auto leading-relaxed">
              Rejoins les pionniers qui construisent <span className="font-semibold text-white">l&apos;écosystème tech ivoirien.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 relative z-10 pt-8 sm:pt-10 border-t border-white/5">
            <AnimatedCounter value={stats.waitlist} label="Inscrits" icon={Users} />
            <AnimatedCounter value={stats.portfolios} label="Portfolios" icon={Zap} />
            <AnimatedCounter value={stats.startups} label="Startups" icon={Rocket} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
