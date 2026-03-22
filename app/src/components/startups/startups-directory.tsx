"use client";

import { useDynamicFields } from "@/hooks/use-dynamic-fields";
import type { Startup } from "@/lib/types";
import {
  ArrowUpRight,
  ChevronUp,
  ExternalLink,
  Filter,
  MapPin,
  Rocket,
  Search,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const SECTORS_FALLBACK = [
  { value: "", label: "Tous les secteurs" },
  { value: "tech", label: "Tech" },
  { value: "fintech", label: "Fintech" },
  { value: "agritech", label: "Agritech" },
  { value: "healthtech", label: "Healthtech" },
  { value: "edtech", label: "Edtech" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "logistics", label: "Logistique" },
  { value: "media", label: "Media" },
  { value: "energy", label: "Energie" },
  { value: "other", label: "Autre" },
];

const STAGES_FALLBACK = [
  { value: "", label: "Toutes les etapes" },
  { value: "idea", label: "Idee" },
  { value: "mvp", label: "MVP" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "Serie A" },
  { value: "growth", label: "Croissance" },
  { value: "profitable", label: "Rentable" },
];

const STAGE_LABELS_FALLBACK: Record<string, string> = {
  idea: "Idée",
  mvp: "MVP",
  seed: "Seed",
  series_a: "Série A",
  growth: "Croissance",
  profitable: "Rentable",
};

function StartupCard({ startup, onUpvote, stageLabels }: { startup: Startup; onUpvote: (slug: string) => void; stageLabels: Record<string, string> }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-orange/30 transition-all group flex gap-4">
      {/* Logo */}
      <div className="flex-shrink-0">
        {startup.logo_url ? (
          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-border">
            <Image src={startup.logo_url} alt={startup.name} fill sizes="56px" className="object-cover" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center">
            <span className="text-xl font-bold text-orange">{startup.name.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-base truncate group-hover:text-orange transition-colors">{startup.name}</h3>
            <p className="text-muted text-sm mt-0.5 line-clamp-2">{startup.tagline}</p>
          </div>

          {/* Upvote button */}
          <button
            onClick={() => onUpvote(startup.slug)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 border border-border rounded-xl hover:border-orange/50 hover:bg-orange/5 transition-all flex-shrink-0"
          >
            <ChevronUp size={16} className="text-orange" />
            <span className="text-sm font-semibold tabular-nums">{startup.upvotes_count}</span>
          </button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted">
          <span className="px-2 py-0.5 bg-orange/10 text-orange rounded-full font-medium">{startup.sector}</span>
          <span className="px-2 py-0.5 bg-border/50 rounded-full">{stageLabels[startup.stage] || startup.stage}</span>
          {startup.city && (
            <span className="flex items-center gap-1"><MapPin size={11} />{startup.city}</span>
          )}
          {startup.team_size > 0 && (
            <span className="flex items-center gap-1"><Users size={11} />{startup.team_size}</span>
          )}
          {startup.is_hiring && (
            <span className="px-2 py-0.5 bg-green/10 text-green rounded-full font-medium">Recrute</span>
          )}
        </div>

        {/* Tech stack */}
        {startup.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {startup.tech_stack.slice(0, 5).map((t) => (
              <span key={t} className="px-2 py-0.5 bg-border/40 rounded text-xs text-muted font-mono">{t}</span>
            ))}
            {startup.tech_stack.length > 5 && (
              <span className="text-xs text-muted">+{startup.tech_stack.length - 5}</span>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-4 mt-3">
          {startup.website_url && (
            <a href={startup.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted hover:text-orange flex items-center gap-1 transition-colors">
              <ExternalLink size={12} /> Site web
            </a>
          )}
          {startup.profile && (
            <a href={`https://${startup.profile.slug}.ivoire.io`} className="text-xs text-muted hover:text-orange flex items-center gap-1 transition-colors">
              <ArrowUpRight size={12} /> Fondateur
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

interface StartupsDirectoryProps {
  startups: Startup[];
}

export function StartupsDirectory({ startups: initialStartups }: StartupsDirectoryProps) {
  const [startups, setStartups] = useState(initialStartups);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");
  const [stage, setStage] = useState("");
  const [sort, setSort] = useState<"upvotes" | "recent">("upvotes");
  const { options: sectorOpts } = useDynamicFields("sector");
  const { options: stageOpts } = useDynamicFields("stage");
  const SECTORS = sectorOpts.length > 0
    ? [{ value: "", label: "Tous les secteurs" }, ...sectorOpts.map((s) => ({ value: s.value, label: s.label }))]
    : SECTORS_FALLBACK;
  const STAGES = stageOpts.length > 0
    ? [{ value: "", label: "Toutes les etapes" }, ...stageOpts.map((s) => ({ value: s.value, label: s.label }))]
    : STAGES_FALLBACK;
  const STAGE_LABELS: Record<string, string> = stageOpts.length > 0
    ? Object.fromEntries(stageOpts.map((s) => [s.value, s.label]))
    : STAGE_LABELS_FALLBACK;

  const filtered = useMemo(() => {
    let result = startups;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.tech_stack.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sector) result = result.filter((s) => s.sector === sector);
    if (stage) result = result.filter((s) => s.stage === stage);

    if (sort === "recent") {
      result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      result = [...result].sort((a, b) => b.upvotes_count - a.upvotes_count);
    }

    return result;
  }, [startups, search, sector, stage, sort]);

  async function handleUpvote(slug: string) {
    try {
      const res = await fetch(`/api/startups/${encodeURIComponent(slug)}/upvote`, { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Erreur lors du vote.");
        return;
      }

      setStartups((prev) =>
        prev.map((s) => (s.slug === slug ? { ...s, upvotes_count: json.upvotes } : s))
      );
      toast.success("Vote enregistré ! 🎉");
    } catch {
      toast.error("Erreur de connexion.");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket size={24} className="text-orange" />
            <div>
              <h1 className="text-lg font-bold">startups.ivoire.io</h1>
              <p className="text-xs text-muted">Le Product Hunt de la Côte d&apos;Ivoire</p>
            </div>
          </div>
          <a href="https://ivoire.io" className="text-xs text-muted hover:text-white transition-colors">
            🇨🇮 ivoire.io
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Rechercher une startup..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-white placeholder:text-muted focus:border-orange focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="pl-8 pr-6 py-2.5 bg-surface border border-border rounded-lg text-sm text-white appearance-none focus:border-orange focus:outline-none"
              >
                {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-white appearance-none focus:border-orange focus:outline-none"
            >
              {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "upvotes" | "recent")}
              className="px-3 py-2.5 bg-surface border border-border rounded-lg text-sm text-white appearance-none focus:border-orange focus:outline-none"
            >
              <option value="upvotes">Plus votées</option>
              <option value="recent">Plus récentes</option>
            </select>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <Rocket size={14} className="text-orange" />
            {filtered.length} startup{filtered.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Rocket size={48} className="mx-auto text-border mb-4" />
            <p className="text-muted">Aucune startup trouvée.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((startup, i) => (
              <div key={startup.id} className="flex items-start gap-3">
                <span className="text-sm font-mono text-muted w-6 pt-5 text-right flex-shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <StartupCard startup={startup} onUpvote={handleUpvote} stageLabels={STAGE_LABELS} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
