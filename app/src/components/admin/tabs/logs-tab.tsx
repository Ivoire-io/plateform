"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/select";
import { Download } from "lucide-react";
import { useState } from "react";

interface LogEntry {
  datetime: string;
  type: string;
  description: string;
  color: string;
  emoji: string;
}

const ALL_LOGS: LogEntry[] = [
  { datetime: "14/03 12:00", type: "profile", emoji: "🟢", description: "ulrich — Profil créé", color: "#22c55e" },
  { datetime: "14/03 12:05", type: "profile", emoji: "🟢", description: "ulrich — Avatar uploadé", color: "#22c55e" },
  { datetime: "14/03 12:10", type: "content", emoji: "🔵", description: "ulrich — 6 projets ajoutés", color: "#3b82f6" },
  { datetime: "14/03 11:00", type: "payment", emoji: "💳", description: "PAIEMENT Acme Corp — Enterprise renouvelé", color: "var(--color-orange)" },
  { datetime: "14/03 10:30", type: "waitlist", emoji: "🟡", description: "WAITLIST jean@mail.ci — Inscription", color: "#f59e0b" },
  { datetime: "14/03 10:00", type: "moderation", emoji: "🔴", description: "MODÉRA spammer — Signalé (2x)", color: "#ef4444" },
  { datetime: "13/03 18:00", type: "profile", emoji: "🟢", description: "fatou — Profil mis à jour", color: "#22c55e" },
  { datetime: "13/03 15:00", type: "admin", emoji: "🏅", description: "CERTIF Acme Corp — Badge certifié émis", color: "var(--color-orange)" },
  { datetime: "13/03 12:00", type: "system", emoji: "⚙️", description: "SYSTÈME — Purge cache CDN", color: "#a0a0a0" },
  { datetime: "12/03 10:00", type: "content", emoji: "🔵", description: "TechCI — Startup profil créé", color: "#3b82f6" },
  { datetime: "12/03 09:00", type: "waitlist", emoji: "🟡", description: "WAITLIST marie@mail.ci — Inscription", color: "#f59e0b" },
  { datetime: "11/03 14:00", type: "payment", emoji: "💳", description: "PAIEMENT ulrich — Dev Premium souscrit", color: "var(--color-orange)" },
];

const TYPE_LABELS: Record<string, string> = {
  profile: "Profil",
  content: "Contenu",
  payment: "Paiement",
  waitlist: "Waitlist",
  moderation: "Modération",
  system: "Système",
  admin: "Admin",
};

export function AdminLogsTab() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const filtered = ALL_LOGS.filter((l) => {
    const matchType = typeFilter === "all" || l.type === typeFilter;
    return matchType;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">Logs d&apos;activité</h2>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <NativeSelect value={typeFilter} onValueChange={setTypeFilter} className="w-40">
          <NativeSelectOption value="all">Tous les types</NativeSelectOption>
          <NativeSelectOption value="profile">Profils</NativeSelectOption>
          <NativeSelectOption value="content">Contenu</NativeSelectOption>
          <NativeSelectOption value="payment">Paiements</NativeSelectOption>
          <NativeSelectOption value="waitlist">Waitlist</NativeSelectOption>
          <NativeSelectOption value="moderation">Modération</NativeSelectOption>
          <NativeSelectOption value="system">Système</NativeSelectOption>
          <NativeSelectOption value="admin">Admin</NativeSelectOption>
        </NativeSelect>
        <NativeSelect value={periodFilter} onValueChange={setPeriodFilter} className="w-40">
          <NativeSelectOption value="all">Toutes les périodes</NativeSelectOption>
          <NativeSelectOption value="today">Aujourd&apos;hui</NativeSelectOption>
          <NativeSelectOption value="7j">7 derniers jours</NativeSelectOption>
          <NativeSelectOption value="30j">30 derniers jours</NativeSelectOption>
        </NativeSelect>
      </div>

      {/* Liste des logs */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filtered.map((log, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
                <span className="text-base shrink-0">{log.emoji}</span>
                <span className="text-xs text-muted-foreground w-32 shrink-0 font-mono">{log.datetime}</span>
                <Badge
                  className="text-xs shrink-0"
                  style={{
                    background: `color-mix(in srgb,${log.color} 15%,transparent)`,
                    color: log.color,
                    border: `1px solid color-mix(in srgb,${log.color} 30%,transparent)`,
                  }}
                >
                  {TYPE_LABELS[log.type]}
                </Badge>
                <span className="text-sm flex-1 truncate">{log.description}</span>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">Aucun log trouvé</div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Page 1 / 234 — {filtered.length} logs affichés</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-7 px-3">←</Button>
          <Button variant="outline" size="sm" className="h-7 px-3">1</Button>
          <Button variant="ghost" size="sm" className="h-7 px-3">2</Button>
          <Button variant="ghost" size="sm" className="h-7 px-3">3</Button>
          <Button variant="outline" size="sm" className="h-7 px-3">→</Button>
        </div>
      </div>
    </div>
  );
}
