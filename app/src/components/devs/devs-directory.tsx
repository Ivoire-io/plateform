"use client";

import { BadgeCheck, ChevronLeft, ChevronRight, Filter, Loader2, MapPin, Search, Star, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ───

interface ProfileItem {
  id: string;
  slug: string;
  full_name: string;
  title: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  skills: string[];
  is_available: boolean;
  verified_badge: boolean;
  created_at: string;
  avg_rating: number | null;
  review_count: number;
}

interface FilterOption {
  name: string;
  count: number;
}

interface ApiResponse {
  profiles: ProfileItem[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    skills: FilterOption[];
    cities: FilterOption[];
  };
}

// ─── Component ───

export function DevsDirectory() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State derived from URL params
  const currentSkill = searchParams.get("skill") || "";
  const currentCity = searchParams.get("city") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "recent";
  const currentPage = Number(searchParams.get("page") || "1");
  const currentAvailable = searchParams.get("available") === "true";

  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [skills, setSkills] = useState<FilterOption[]>([]);
  const [cities, setCities] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Local detection for subdomain URLs
  const [isLocal, setIsLocal] = useState(false);
  const [localPort, setLocalPort] = useState("3000");

  useEffect(() => {
    const h = window.location.hostname;
    if (h.endsWith(".localhost") || h === "localhost") {
      setIsLocal(true);
      setLocalPort(window.location.port || "3000");
    }
  }, []);

  function profileUrl(slug: string) {
    if (isLocal) return `http://${slug}.localhost:${localPort}?from=devs`;
    return `https://${slug}.ivoire.io?from=devs`;
  }

  // ── URL update helper ──
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Reset to page 1 when filters change (unless page is the only change)
      if (!("page" in updates)) {
        params.delete("page");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // ── Debounced search ──
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        updateParams({ search: value || null });
      }, 400);
    },
    [updateParams]
  );

  // Sync search input when URL param changes externally
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // ── Fetch data from API ──
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentSkill) params.set("skill", currentSkill);
      if (currentCity) params.set("city", currentCity);
      if (currentSearch) params.set("search", currentSearch);
      if (currentSort) params.set("sort", currentSort);
      if (currentAvailable) params.set("available", "true");
      params.set("page", String(currentPage));
      params.set("limit", "12");

      try {
        const res = await fetch(`/api/devs?${params.toString()}`);
        if (!res.ok) throw new Error("Fetch failed");
        const data: ApiResponse = await res.json();
        if (cancelled) return;
        setProfiles(data.profiles);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setSkills(data.filters.skills);
        setCities(data.filters.cities);
      } catch {
        if (!cancelled) {
          setProfiles([]);
          setTotal(0);
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [currentSkill, currentCity, currentSearch, currentSort, currentPage, currentAvailable]);

  // ── Active filter tags ──
  const activeFilters: { label: string; key: string }[] = [];
  if (currentSkill) activeFilters.push({ label: currentSkill, key: "skill" });
  if (currentCity) activeFilters.push({ label: currentCity, key: "city" });
  if (currentSearch) activeFilters.push({ label: `"${currentSearch}"`, key: "search" });
  if (currentAvailable) activeFilters.push({ label: "Disponibles", key: "available" });

  // ── Pagination helpers ──
  function getPageNumbers(): (number | "ellipsis")[] {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="https://ivoire.io" className="flex items-center gap-1">
            <span className="text-lg font-bold text-white">ivoire</span>
            <span className="text-lg font-bold text-orange">.io</span>
          </Link>
          <span className="font-mono text-sm text-muted">devs.ivoire.io</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Annuaire des <span className="text-orange">developpeurs</span>
        </h1>
        <p className="text-muted mb-8">
          {loading ? "Chargement..." : `${total} talents tech en Cote d'Ivoire`}
        </p>

        {/* ── Filters ── */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Rechercher un nom, titre, competence..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-orange transition-colors"
            />
          </div>

          {/* Skill filter */}
          <select
            value={currentSkill}
            onChange={(e) => updateParams({ skill: e.target.value || null })}
            className="bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange transition-colors cursor-pointer"
          >
            <option value="">Toutes les technos</option>
            {skills.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.count})
              </option>
            ))}
          </select>

          {/* City filter */}
          <select
            value={currentCity}
            onChange={(e) => updateParams({ city: e.target.value || null })}
            className="bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange transition-colors cursor-pointer"
          >
            <option value="">Toutes les villes</option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>

          {/* Sort selector */}
          <select
            value={currentSort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange transition-colors cursor-pointer"
          >
            <option value="recent">Recent</option>
            <option value="popular">Populaire</option>
            <option value="alpha">A-Z</option>
          </select>

          {/* Available toggle */}
          <button
            onClick={() =>
              updateParams({ available: currentAvailable ? null : "true" })
            }
            className={`px-4 py-3 rounded-lg border text-sm transition-all cursor-pointer whitespace-nowrap ${currentAvailable
                ? "border-green bg-green/10 text-green"
                : "border-border text-muted hover:border-border/80"
              }`}
          >
            <Filter size={14} className="inline mr-1" />
            Disponibles
          </button>
        </div>

        {/* ── Active filter tags ── */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.map((f) => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange/10 text-orange text-sm"
              >
                {f.label}
                <button
                  onClick={() => {
                    if (f.key === "search") {
                      setSearchInput("");
                    }
                    updateParams({ [f.key]: null });
                  }}
                  className="hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            {activeFilters.length > 1 && (
              <button
                onClick={() => {
                  setSearchInput("");
                  router.push("?", { scroll: false });
                }}
                className="text-sm text-muted hover:text-white transition-colors underline"
              >
                Tout effacer
              </button>
            )}
          </div>
        )}

        {/* ── Results ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg">Aucun profil trouve.</p>
            <p className="text-muted text-sm mt-2">
              Essaie avec d&apos;autres filtres.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <a
                  key={profile.id}
                  href={profileUrl(profile.slug)}
                  className="bg-surface border border-border rounded-2xl p-6 hover:border-orange/30 transition-colors group block"
                >
                  <div className="flex items-start gap-4">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-orange/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">
                          {profile.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold truncate group-hover:text-orange transition-colors">
                          {profile.full_name}
                        </h3>
                        {profile.verified_badge && (
                          <BadgeCheck size={16} className="text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      {profile.title && (
                        <p className="text-muted text-sm truncate">
                          {profile.title}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {profile.city && (
                          <p className="text-muted text-xs flex items-center gap-1">
                            <MapPin size={12} />
                            {profile.city}
                          </p>
                        )}
                        {profile.avg_rating !== null && profile.review_count > 0 && (
                          <p className="text-yellow-400 text-xs flex items-center gap-0.5">
                            <Star size={12} fill="currentColor" />
                            {profile.avg_rating.toFixed(1)}
                            <span className="text-muted ml-0.5">
                              ({profile.review_count})
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    {profile.is_available && (
                      <span className="w-2.5 h-2.5 rounded-full bg-green flex-shrink-0 mt-1" />
                    )}
                  </div>

                  {profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {profile.skills.slice(0, 5).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-border/50 rounded text-xs text-muted font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                      {profile.skills.length > 5 && (
                        <span className="px-2 py-0.5 text-xs text-muted">
                          +{profile.skills.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="font-mono text-xs text-muted mt-3">
                    {profile.slug}.ivoire.io
                  </p>
                </a>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() =>
                    updateParams({ page: String(currentPage - 1) })
                  }
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg border border-border text-muted hover:text-white hover:border-orange/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>

                {getPageNumbers().map((p, i) =>
                  p === "ellipsis" ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-muted">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => updateParams({ page: String(p) })}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${p === currentPage
                          ? "bg-orange text-white"
                          : "border border-border text-muted hover:text-white hover:border-orange/30"
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    updateParams({ page: String(currentPage + 1) })
                  }
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg border border-border text-muted hover:text-white hover:border-orange/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        {/* ── CTA Banner ── */}
        <div className="mt-16 mb-8 rounded-2xl border border-orange/20 bg-orange/5 p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">
            Cree ton portfolio <span className="text-orange">gratuitement</span>
          </h2>
          <p className="text-muted mb-6 max-w-lg mx-auto">
            Rejoins la communaute des developpeurs ivoiriens et obtiens ton portfolio en ligne en quelques minutes.
          </p>
          <a
            href="https://ivoire.io/#rejoindre"
            className="inline-block px-8 py-3 rounded-lg bg-orange text-white font-semibold hover:bg-orange/90 transition-colors"
          >
            Commencer maintenant
          </a>
        </div>
      </main>
    </div>
  );
}
