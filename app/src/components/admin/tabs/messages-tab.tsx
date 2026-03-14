"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Message {
  id: string;
  from: string;
  to: string;
  to_slug: string;
  excerpt: string;
  date: string;
  is_read: boolean;
}

const MOCK_MESSAGES: Message[] = [
  { id: "1", from: "marie@tech.ci", to: "Ulrich Kouamé", to_slug: "ulrich", excerpt: "Bonjour, je souhaite vous proposer une collaboration sur...", date: "2h", is_read: false },
  { id: "2", from: "hr@acme.ci", to: "Fatou Diallo", to_slug: "fatou", excerpt: "Nous cherchons un développeur senior disponible pour...", date: "5h", is_read: false },
  { id: "3", from: "jean@mail.ci", to: "TechCI", to_slug: "techci", excerpt: "Question concernant votre startup et ses offres de...", date: "1j", is_read: true },
  { id: "4", from: "contact@startup.ci", to: "Marie Koné", to_slug: "marie", excerpt: "Votre profil nous a beaucoup impressionné, nous avons une...", date: "2j", is_read: true },
  { id: "5", from: "rh@corp.ci", to: "Ulrich Kouamé", to_slug: "ulrich", excerpt: "Suite à votre candidature, nous souhaitons organiser...", date: "3j", is_read: true },
];

export function AdminMessagesTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = MOCK_MESSAGES.filter((m) => {
    const matchSearch = !search || m.from.toLowerCase().includes(search.toLowerCase()) || m.to.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "unread" && !m.is_read);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Messages de contact ({MOCK_MESSAGES.length})</h2>
      </div>

      <div
        className="rounded-lg px-4 py-3 text-sm flex items-start gap-2"
        style={{ background: "color-mix(in srgb,#f59e0b 10%,transparent)", border: "1px solid color-mix(in srgb,#f59e0b 25%,transparent)" }}
      >
        <span className="text-yellow-400">⚠️</span>
        <span className="text-yellow-300 text-xs">Vue en lecture seule — les messages sont privés entre l&apos;expéditeur et le destinataire. L&apos;admin peut voir pour modération uniquement.</span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1">
          {[["all", "Tous"], ["unread", "Non lus"]].map(([val, label]) => (
            <Button key={val} size="sm" variant={filter === val ? "default" : "outline"} onClick={() => setFilter(val)}
              style={filter === val ? { background: "var(--color-orange)" } : {}}
            >{label}</Button>
          ))}
        </div>
      </div>

      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left p-3 pl-4">De</th>
                  <th className="text-left p-3">À (profil)</th>
                  <th className="text-left p-3">Extrait</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Lu</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((msg) => (
                  <tr key={msg.id} className={`border-b border-border/50 transition-colors ${!msg.is_read ? "bg-blue-500/5" : "hover:bg-white/2"}`}>
                    <td className="p-3 pl-4 text-xs font-medium">{msg.from}</td>
                    <td className="p-3 text-xs">
                      <span className="text-blue-400">{msg.to_slug}.ivoire.io</span>
                      <div className="text-muted-foreground">{msg.to}</div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">&ldquo;{msg.excerpt}&rdquo;</td>
                    <td className="p-3 text-xs text-muted-foreground">{msg.date}</td>
                    <td className="p-3">
                      {msg.is_read
                        ? <span className="text-muted-foreground text-xs">⚪ Lu</span>
                        : <span className="text-blue-400 text-xs">🔵 Non lu</span>
                      }
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.info("Lecture seule — message privé")}>
                        <Eye className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">Aucun message trouvé</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
