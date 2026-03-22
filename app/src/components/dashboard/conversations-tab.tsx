"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type {
  ChatMessage,
  Conversation,
  ConversationParticipant,
} from "@/lib/types";
import {
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ConversationsTabProps {
  profileId: string;
}

interface EnrichedConversation extends Omit<Conversation, "last_message" | "participants" | "unread_count"> {
  participants: ConversationParticipant[];
  last_message: (ChatMessage & {
    sender?: { full_name: string; slug: string; avatar_url: string | null } | null;
  }) | null;
  unread_count: number;
}

interface EnrichedMessage extends Omit<ChatMessage, "sender"> {
  sender?: { full_name: string; slug: string; avatar_url: string | null } | null;
}

interface UserSearchResult {
  id: string;
  full_name: string;
  slug: string;
  avatar_url: string | null;
  title: string | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "A l'instant";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function ConversationsTab({ profileId }: ConversationsTabProps) {
  const [conversations, setConversations] = useState<EnrichedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<EnrichedMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [userSearching, setUserSearching] = useState(false);
  const [newMessageText, setNewMessageText] = useState("");
  const [creatingConv, setCreatingConv] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/conversations");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      toast.error("Impossible de charger les conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Poll for new messages when conversation is open
  useEffect(() => {
    if (!selectedConvId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/dashboard/conversations/${selectedConvId}/messages?page=1&limit=100`
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages ?? []);
        }
      } catch {
        // silent polling error
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedConvId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fetch messages for a conversation
  async function openConversation(convId: string) {
    setSelectedConvId(convId);
    setMessagesLoading(true);
    setMessages([]);

    try {
      const res = await fetch(
        `/api/dashboard/conversations/${convId}/messages?page=1&limit=100`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(data.messages ?? []);

      // Mark as read
      await fetch(`/api/dashboard/conversations/${convId}/read`, {
        method: "POST",
      });

      // Update local unread count
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, unread_count: 0 } : c
        )
      );
    } catch {
      toast.error("Impossible de charger les messages");
    } finally {
      setMessagesLoading(false);
    }
  }

  // Send a message
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConvId || sending) return;

    setSending(true);
    const content = messageInput.trim();
    setMessageInput("");

    try {
      const res = await fetch(
        `/api/dashboard/conversations/${selectedConvId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, message_type: "text" }),
        }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);

      // Update conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvId
            ? {
              ...c,
              last_message: data.message,
              updated_at: new Date().toISOString(),
            }
            : c
        ).sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      );
    } catch {
      toast.error("Erreur lors de l'envoi");
      setMessageInput(content);
    } finally {
      setSending(false);
    }
  }

  // Search users for new conversation
  useEffect(() => {
    if (!userSearch.trim() || userSearch.trim().length < 2) {
      setUserResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setUserSearching(true);
      try {
        const res = await fetch(
          `/api/dashboard/conversations?search_users=${encodeURIComponent(
            userSearch.trim()
          )}`
        );
        // Fallback: search profiles directly
        const profileRes = await fetch(
          `/api/profiles/search?q=${encodeURIComponent(userSearch.trim())}`
        );
        if (profileRes.ok) {
          const data = await profileRes.json();
          setUserResults(
            (data.profiles ?? []).filter(
              (p: UserSearchResult) => p.id !== profileId
            )
          );
        }
      } catch {
        // silent
      } finally {
        setUserSearching(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [userSearch, profileId]);

  // Create new conversation
  async function createConversation(targetUserId: string) {
    setCreatingConv(true);
    try {
      const res = await fetch("/api/dashboard/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_ids: [targetUserId],
          initial_message: newMessageText.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const conv = data.conversation;

      setShowNewDialog(false);
      setUserSearch("");
      setUserResults([]);
      setNewMessageText("");

      // Refresh conversations and open the new/existing one
      await fetchConversations();
      openConversation(conv.id);
    } catch {
      toast.error("Erreur lors de la creation de la conversation");
    } finally {
      setCreatingConv(false);
    }
  }

  // Get the other participant in a direct conversation
  function getOtherParticipant(conv: EnrichedConversation) {
    const other = conv.participants?.find((p) => p.profile_id !== profileId);
    return other?.profile ?? null;
  }

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const other = getOtherParticipant(conv);
    const name = other?.full_name ?? "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Conversations</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Messagerie interne
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowNewDialog(true)}
          style={{ background: "var(--color-orange)", color: "#fff" }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nouveau message
        </Button>
      </div>

      <div
        className="flex rounded-xl border overflow-hidden"
        style={{
          borderColor: "#1a1a2e",
          background: "#0A0A0A",
          height: "calc(100vh - 220px)",
          minHeight: "500px",
        }}
      >
        {/* Left panel - conversation list */}
        <div
          className="flex flex-col border-r"
          style={{
            borderColor: "#1a1a2e",
            width: "340px",
            minWidth: "280px",
            background: "#111",
          }}
        >
          {/* Search */}
          <div className="p-3 border-b" style={{ borderColor: "#1a1a2e" }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm border-0"
                style={{ background: "#1a1a2e" }}
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col gap-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-lg animate-pulse"
                    style={{ background: "#1a1a2e" }}
                  />
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                <MessageSquare className="w-8 h-8 mb-3 opacity-40" />
                <p className="text-sm">Aucune conversation</p>
                <p className="text-xs mt-1">
                  Commencez une nouvelle conversation
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isSelected = conv.id === selectedConvId;
                const lastMsg = conv.last_message;
                const hasUnread = conv.unread_count > 0;

                return (
                  <div
                    key={conv.id}
                    className="flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors"
                    style={{
                      background: isSelected
                        ? "rgba(255, 107, 0, 0.1)"
                        : "transparent",
                      borderLeft: isSelected
                        ? "3px solid #FF6B00"
                        : "3px solid transparent",
                    }}
                    onClick={() => openConversation(conv.id)}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.03)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      {other?.avatar_url && (
                        <AvatarImage
                          src={other.avatar_url}
                          alt={other.full_name}
                        />
                      )}
                      <AvatarFallback
                        className="text-xs font-semibold"
                        style={{
                          background: "#1a1a2e",
                          color: "#FF6B00",
                        }}
                      >
                        {(other?.full_name ?? "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-sm truncate ${hasUnread ? "font-semibold" : "font-medium"
                            }`}
                          style={{ color: hasUnread ? "#fff" : "#ccc" }}
                        >
                          {other?.full_name ?? "Utilisateur"}
                        </span>
                        {lastMsg && (
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {timeAgo(lastMsg.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <p
                          className="text-xs truncate flex-1"
                          style={{
                            color: hasUnread
                              ? "rgba(255,255,255,0.7)"
                              : "rgba(255,255,255,0.4)",
                          }}
                        >
                          {lastMsg
                            ? lastMsg.sender_id === profileId
                              ? `Vous: ${lastMsg.content}`
                              : lastMsg.content
                            : "Pas encore de message"}
                        </p>
                        {hasUnread && (
                          <Badge
                            className="text-[10px] px-1.5 py-0 shrink-0"
                            style={{
                              background: "#FF6B00",
                              color: "#fff",
                            }}
                          >
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right panel - message thread */}
        <div
          className="flex flex-col flex-1"
          style={{ background: "#0A0A0A" }}
        >
          {!selectedConvId ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">
                Selectionnez une conversation ou commencez-en une nouvelle
              </p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div
                className="flex items-center gap-3 px-4 py-3 border-b"
                style={{ borderColor: "#1a1a2e", background: "#111" }}
              >
                {/* Back button for mobile (optional) */}
                <button
                  className="md:hidden p-1 rounded hover:bg-white/5"
                  onClick={() => setSelectedConvId(null)}
                >
                  <X className="w-5 h-5" />
                </button>
                {selectedConv && (() => {
                  const other = getOtherParticipant(selectedConv);
                  return (
                    <>
                      <Avatar className="h-9 w-9">
                        {other?.avatar_url && (
                          <AvatarImage
                            src={other.avatar_url}
                            alt={other.full_name}
                          />
                        )}
                        <AvatarFallback
                          className="text-xs font-semibold"
                          style={{
                            background: "#1a1a2e",
                            color: "#FF6B00",
                          }}
                        >
                          {(other?.full_name ?? "?")
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {other?.full_name ?? "Utilisateur"}
                        </p>
                        {other?.slug && (
                          <p className="text-xs text-muted-foreground">
                            @{other.slug}
                          </p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
              >
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p className="text-sm">
                      Aucun message pour le moment
                    </p>
                    <p className="text-xs mt-1">
                      Envoyez le premier message
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender_id === profileId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"
                          }`}
                      >
                        <div className="flex items-end gap-2 max-w-[75%]">
                          {!isOwn && (
                            <Avatar className="h-7 w-7 shrink-0">
                              {msg.sender?.avatar_url && (
                                <AvatarImage
                                  src={msg.sender.avatar_url}
                                  alt={msg.sender.full_name}
                                />
                              )}
                              <AvatarFallback
                                className="text-[10px] font-semibold"
                                style={{
                                  background: "#1a1a2e",
                                  color: "#FF6B00",
                                }}
                              >
                                {(msg.sender?.full_name ?? "?")
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <div
                              className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                              style={{
                                background: isOwn
                                  ? "#FF6B00"
                                  : "#1a1a2e",
                                color: isOwn ? "#fff" : "#e0e0e0",
                                borderBottomRightRadius: isOwn
                                  ? "4px"
                                  : "16px",
                                borderBottomLeftRadius: isOwn
                                  ? "16px"
                                  : "4px",
                              }}
                            >
                              {msg.content}
                            </div>
                            <p
                              className={`text-[10px] mt-0.5 ${isOwn ? "text-right" : "text-left"
                                }`}
                              style={{ color: "rgba(255,255,255,0.3)" }}
                            >
                              {new Date(msg.created_at).toLocaleTimeString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <form
                onSubmit={sendMessage}
                className="flex items-center gap-2 p-3 border-t"
                style={{ borderColor: "#1a1a2e", background: "#111" }}
              >
                <Input
                  placeholder="Ecrivez votre message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 border-0 h-10 text-sm"
                  style={{ background: "#1a1a2e" }}
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!messageInput.trim() || sending}
                  className="h-10 w-10 p-0"
                  style={{
                    background: messageInput.trim()
                      ? "#FF6B00"
                      : "#1a1a2e",
                    color: "#fff",
                  }}
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* New conversation dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau message</DialogTitle>
            <DialogDescription>
              Recherchez un utilisateur pour demarrer une conversation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {userSearching && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {userResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-1">
                {userResults.map((usr) => (
                  <div
                    key={usr.id}
                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => createConversation(usr.id)}
                  >
                    <Avatar className="h-9 w-9">
                      {usr.avatar_url && (
                        <AvatarImage
                          src={usr.avatar_url}
                          alt={usr.full_name}
                        />
                      )}
                      <AvatarFallback
                        className="text-xs font-semibold"
                        style={{
                          background: "#1a1a2e",
                          color: "#FF6B00",
                        }}
                      >
                        {usr.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {usr.full_name}
                      </p>
                      {usr.title && (
                        <p className="text-xs text-muted-foreground truncate">
                          {usr.title}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {userSearch.trim().length >= 2 &&
              !userSearching &&
              userResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun utilisateur trouve
                </p>
              )}

            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">
                Message initial (optionnel)
              </label>
              <Input
                placeholder="Bonjour, je souhaite..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowNewDialog(false);
                setUserSearch("");
                setUserResults([]);
                setNewMessageText("");
              }}
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
