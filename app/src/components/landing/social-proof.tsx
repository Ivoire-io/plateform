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
          <p className="text-center text-sm text-muted mb-6">
            Ils construisent déjà l&apos;écosystème tech ivoirien
          </p>
          <div className="grid grid-cols-3 gap-6">
            <AnimatedCounter value={stats.waitlist} label="Inscrits" icon={Users} />
            <AnimatedCounter value={stats.portfolios} label="Portfolios" icon={Zap} />
            <AnimatedCounter value={stats.startups} label="Startups" icon={Rocket} />
          </div>
        </div>
      </div>
    </section>
  );
}
