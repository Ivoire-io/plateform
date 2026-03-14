"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ContactMessage } from "@/lib/types";
import { Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Filter = "all" | "unread";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

export function MessagesTab() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const PAGE_SIZE = 10;

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/messages");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      toast.error("Impossible de charger les messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filtered = filter === "unread" ? messages.filter((m) => !m.is_read) : messages;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function openMessage(msg: ContactMessage) {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      try {
        await fetch(`/api/dashboard/messages/${msg.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_read: true }),
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
        );
      } catch {
        // silent
      }
    }
  }

  async function deleteMessage() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/dashboard/messages/${deleteTarget}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setMessages((prev) => prev.filter((m) => m.id !== deleteTarget));
      if (selectedMessage?.id === deleteTarget) setSelectedMessage(null);
      toast.success("Message supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} message${unreadCount > 1 ? "s" : ""} non lu${unreadCount > 1 ? "s" : ""}` : "Tous les messages lus"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => { setFilter("all"); setPage(1); }}
            style={filter === "all" ? { background: "var(--color-orange)", color: "#fff" } : {}}
          >
            Tous ({messages.length})
          </Button>
          <Button
            size="sm"
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => { setFilter("unread"); setPage(1); }}
            style={filter === "unread" ? { background: "var(--color-orange)", color: "#fff" } : {}}
          >
            Non lus ({unreadCount})
          </Button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl animate-pulse"
              style={{ background: "var(--color-surface)" }}
            />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Mail className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>Aucun message{filter === "unread" ? " non lu" : ""}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {paginated.map((msg) => (
            <Card
              key={msg.id}
              className={`cursor-pointer transition-colors hover:border-orange-400 ${!msg.is_read ? "border-orange-400/50" : ""
                }`}
              style={{ borderColor: !msg.is_read ? "color-mix(in srgb, var(--color-orange) 50%, transparent)" : undefined }}
              onClick={() => openMessage(msg)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {msg.is_read ? (
                    <MailOpen className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1.5"
                      style={{ background: "var(--color-orange)" }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${!msg.is_read ? "font-semibold" : ""}`}>
                        {msg.sender_name}
                      </span>
                      {!msg.is_read && (
                        <Badge
                          className="text-[10px] px-1.5 py-0"
                          style={{ background: "var(--color-orange)", color: "#fff" }}
                        >
                          Nouveau
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{msg.sender_email}</p>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{msg.message}</p>
                </div>
                <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    render={
                      <a
                        href={`mailto:${msg.sender_email}?subject=Re: Message ivoire.io`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <Reply className="w-3.5 h-3.5 mr-1" />
                    Répondre
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => setDeleteTarget(msg.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant →
          </Button>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>Message de {selectedMessage.sender_name}</DialogTitle>
                <DialogDescription className="flex flex-col gap-0.5">
                  <span>De : {selectedMessage.sender_email}</span>
                  <span>
                    Reçu le{" "}
                    {new Date(selectedMessage.created_at).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div
                className="rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed"
                style={{ background: "var(--color-surface)" }}
              >
                {selectedMessage.message}
              </div>
              <DialogFooter className="flex-row gap-2 sm:justify-between">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setDeleteTarget(selectedMessage.id);
                    setSelectedMessage(null);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Supprimer
                </Button>
                <Button
                  size="sm"
                  style={{ background: "var(--color-orange)", color: "#fff" }}
                  render={
                    <a
                      href={`mailto:${selectedMessage.sender_email}?subject=Re: Message ivoire.io`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <Reply className="w-4 h-4 mr-1.5" />
                  Répondre par email
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer le message ?</DialogTitle>
            <DialogDescription>Cette action est irréversible.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={deleteMessage}
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
