"use client";

import type { Profile } from "@/lib/types";
import { Filter, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface DevsDirectoryProps {
  profiles: Profile[];
}

export function DevsDirectory({ profiles }: DevsDirectoryProps) {
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Extraire toutes les compétences et villes uniques
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    profiles.forEach((p) => p.skills.forEach((s) => skills.add(s)));
    return Array.from(skills).sort();
  }, [profiles]);

  const allCities = useMemo(() => {
    const cities = new Set<string>();
    profiles.forEach((p) => {
      if (p.city) cities.add(p.city);
    });
    return Array.from(cities).sort();
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchSearch =
        !search ||
        p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.skills.some((s) =>
          s.toLowerCase().includes(search.toLowerCase())
        );
      const matchSkill = !selectedSkill || p.skills.includes(selectedSkill);
      const matchCity = !selectedCity || p.city === selectedCity;
      const matchAvailable = !onlyAvailable || p.is_available;
      return matchSearch && matchSkill && matchCity && matchAvailable;
    });
  }, [profiles, search, selectedSkill, selectedCity, onlyAvailable]);

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
          Annuaire des <span className="text-orange">développeurs</span>
        </h1>
        <p className="text-muted mb-8">
          {profiles.length} talents tech en Côte d&apos;Ivoire 🇨🇮
        </p>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Rechercher un nom, titre, compétence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-orange transition-colors"
            />
          </div>

          {/* Skill filter */}
          <select
            value={selectedSkill || ""}
            onChange={(e) => setSelectedSkill(e.target.value || null)}
            className="bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange transition-colors cursor-pointer"
          >
            <option value="">Toutes les technos</option>
            {allSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>

          {/* City filter */}
          <select
            value={selectedCity || ""}
            onChange={(e) => setSelectedCity(e.target.value || null)}
            className="bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange transition-colors cursor-pointer"
          >
            <option value="">Toutes les villes</option>
            {allCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* Available toggle */}
          <button
            onClick={() => setOnlyAvailable(!onlyAvailable)}
            className={`px-4 py-3 rounded-lg border text-sm transition-all cursor-pointer whitespace-nowrap ${onlyAvailable
                ? "border-green bg-green/10 text-green"
                : "border-border text-muted hover:border-border/80"
              }`}
          >
            <Filter size={14} className="inline mr-1" />
            Disponibles
          </button>
        </div>

        {/* Results */}
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted text-lg">Aucun profil trouvé.</p>
            <p className="text-muted text-sm mt-2">
              Essaie avec d&apos;autres filtres.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map((profile) => (
              <a
                key={profile.id}
                href={`https://${profile.slug}.ivoire.io`}
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
                    <h3 className="font-semibold truncate group-hover:text-orange transition-colors">
                      {profile.full_name}
                    </h3>
                    {profile.title && (
                      <p className="text-muted text-sm truncate">
                        {profile.title}
                      </p>
                    )}
                    {profile.city && (
                      <p className="text-muted text-xs mt-1 flex items-center gap-1">
                        <MapPin size={12} />
                        {profile.city}
                      </p>
                    )}
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
        )}
      </main>
    </div>
  );
}
