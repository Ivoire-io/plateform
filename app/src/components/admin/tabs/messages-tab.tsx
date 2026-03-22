"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ContactMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  message: string;
  is_read: boolean;
  created_at: string;
  profile?: { full_name: string; slug: string } | null;
}

export function AdminMessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filter === "unread") params.set("filter", "unread");
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/messages?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(data.messages ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error("Erreur lors du chargement des messages");
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Messages de contact ({total})</h2>
      </div>

      <div
        className="rounded-lg px-4 py-3 text-sm flex items-start gap-2"
        style={{ background: "color-mix(in srgb,#f59e0b 10%,transparent)", border: "1px solid color-mix(in srgb,#f59e0b 25%,transparent)" }}
      >
        <span className="text-yellow-400">!</span>
        <span className="text-yellow-300 text-xs">Vue en lecture seule — les messages sont prives entre l&apos;expediteur et le destinataire. L&apos;admin peut voir pour moderation uniquement.</span>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <div className="flex gap-1">
          {[["all", "Tous"], ["unread", "Non lus"]].map(([val, label]) => (
            <Button key={val} size="sm" variant={filter === val ? "default" : "outline"} onClick={() => { setFilter(val); setPage(1); }}
              style={filter === val ? { background: "var(--color-orange)" } : {}}
            >{label}</Button>
          ))}
        </div>
      </div>

      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-left p-3 pl-4">De</th>
                    <th className="text-left p-3">A (profil)</th>
                    <th className="text-left p-3">Extrait</th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Lu</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((msg) => (
                    <tr key={msg.id} className={`border-b border-border/50 transition-colors ${!msg.is_read ? "bg-blue-500/5" : "hover:bg-white/2"}`}>
                      <td className="p-3 pl-4">
                        <div className="text-xs font-medium">{msg.sender_name}</div>
                        <div className="text-xs text-muted-foreground">{msg.sender_email}</div>
                      </td>
                      <td className="p-3 text-xs">
                        {msg.profile ? (
                          <>
                            <span className="text-blue-400">{msg.profile.slug}.ivoire.io</span>
                            <div className="text-muted-foreground">{msg.profile.full_name}</div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground max-w-xs truncate">
                        {msg.message.length > 80 ? msg.message.slice(0, 80) + "..." : msg.message}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="p-3">
                        {msg.is_read
                          ? <span className="text-muted-foreground text-xs">Lu</span>
                          : <span className="text-blue-400 text-xs">Non lu</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {messages.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">Aucun message trouve</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Page {page} / {totalPages} — {total} resultat{total > 1 ? "s" : ""}</span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-7" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Precedent
          </Button>
          <Button variant="outline" size="sm" className="h-7" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
