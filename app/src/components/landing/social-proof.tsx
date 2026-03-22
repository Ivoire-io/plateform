"use client";

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
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
        <Icon size={20} className="text-orange" />
      </div>
      <span className="text-3xl font-bold tabular-nums">{display}+</span>
      <span className="text-sm text-muted">{label}</span>
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
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface/60 backdrop-blur-sm border border-border rounded-2xl p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex -space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-surface flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                MK
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-surface flex items-center justify-center bg-gradient-to-br from-orange to-red-500 text-xs font-bold text-white z-10 shadow-sm">
                SY
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-surface flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600 text-xs font-bold text-white z-20 shadow-sm">
                AO
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-surface flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold text-white z-30 shadow-sm">
                DT
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-surface flex items-center justify-center bg-background/80 text-xs font-medium text-white z-40 shadow-sm">
                ...
              </div>
            </div>
            <p className="text-center text-sm text-muted">
              Rejoins les pionniers qui construisent l&apos;écosystème tech ivoirien.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/5">
            <AnimatedCounter value={stats.waitlist} label="Inscrits" icon={Users} />
            <AnimatedCounter value={stats.portfolios} label="Portfolios" icon={Zap} />
            <AnimatedCounter value={stats.startups} label="Startups" icon={Rocket} />
          </div>
        </div>
      </div>
    </section>
  );
}
