"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WhatsAppLog, WhatsAppTemplate } from "@/lib/types";
import {
  CheckCircle,
  Loader2,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Status Section ───
function StatusSection() {
  const [status, setStatus] = useState<{
    status: string;
    message?: string;
    data?: unknown;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/whatsapp/status");
      if (res.ok) setStatus(await res.json());
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const statusColor =
    status?.status === "connected"
      ? "#22c55e"
      : status?.status === "error"
        ? "#ef4444"
        : "#f59e0b";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Status WaSender</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStatus}
            disabled={loading}
          >
            <RefreshCw
              className={`h-3 w-3 mr-1.5 ${loading ? "animate-spin" : ""}`}
            />
            Rafraichir
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {status ? (
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: statusColor }}
            />
            <div>
              <p className="text-sm font-medium capitalize">{status.status}</p>
              {status.message && (
                <p className="text-xs text-muted-foreground">{status.message}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Quick Send Section ───
function QuickSendSection() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!phone || !message) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Message envoye !");
        setMessage("");
      } else {
        toast.error(data.error || "Echec de l'envoi");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          <Send className="inline h-4 w-4 mr-1.5" />
          Envoi rapide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            placeholder="+225XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button
          size="sm"
          disabled={sending || !phone || !message}
          onClick={handleSend}
          style={{ background: "#25D366", color: "#fff" }}
        >
          {sending ? (
            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
          ) : (
            <Send className="h-3 w-3 mr-1.5" />
          )}
          Envoyer
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Logs Section ───
function LogsSection() {
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (typeFilter) params.set("type", typeFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/whatsapp/logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch {
      toast.error("Erreur chargement logs");
    } finally {
      setLoading(false);
    }
  }, [offset, typeFilter, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      sent: "#22c55e",
      failed: "#ef4444",
      delivered: "#3b82f6",
      read: "#8b5cf6",
    };
    return (
      <Badge
        className="text-[10px]"
        style={{
          background: `color-mix(in srgb, ${colors[s] || "#888"} 15%, transparent)`,
          color: colors[s] || "#888",
          border: `1px solid color-mix(in srgb, ${colors[s] || "#888"} 30%, transparent)`,
        }}
      >
        {s}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-semibold">
            <MessageSquare className="inline h-4 w-4 mr-1.5" />
            Logs WhatsApp ({total})
          </CardTitle>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setOffset(0); }}
              className="text-xs rounded border border-border bg-transparent px-2 py-1"
            >
              <option value="">Tous types</option>
              <option value="otp">OTP</option>
              <option value="text">Texte</option>
              <option value="notification">Notification</option>
              <option value="broadcast">Broadcast</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
              className="text-xs rounded border border-border bg-transparent px-2 py-1"
            >
              <option value="">Tous statuts</option>
              <option value="sent">Envoye</option>
              <option value="failed">Echoue</option>
              <option value="delivered">Delivre</option>
              <option value="read">Lu</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucun log.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 pr-2">Date</th>
                  <th className="text-left py-2 pr-2">Phone</th>
                  <th className="text-left py-2 pr-2">Type</th>
                  <th className="text-left py-2 pr-2">Status</th>
                  <th className="text-left py-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50">
                    <td className="py-2 pr-2 whitespace-nowrap text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-2 pr-2 font-mono">{log.phone}</td>
                    <td className="py-2 pr-2">
                      <Badge className="text-[10px]" variant="outline">{log.message_type}</Badge>
                    </td>
                    <td className="py-2 pr-2">{statusBadge(log.status)}</td>
                    <td className="py-2 max-w-[200px] truncate">{log.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {total > limit && (
          <div className="flex justify-between items-center mt-3">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              Precedent
            </Button>
            <span className="text-xs text-muted-foreground">
              {offset + 1}-{Math.min(offset + limit, total)} / {total}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
            >
              Suivant
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Templates Section ───
function TemplatesSection() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [variables, setVariables] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/whatsapp/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  async function handleCreate() {
    if (!name || !content) return;
    setSaving(true);
    try {
      const vars = variables
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
      const res = await fetch("/api/admin/whatsapp/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content, variables: vars }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Template cree !");
        setName("");
        setContent("");
        setVariables("");
        fetchTemplates();
      } else {
        toast.error(data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/whatsapp/templates?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Template supprime");
        fetchTemplates();
      }
    } catch {
      toast.error("Erreur");
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Templates WhatsApp</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create form */}
        <div className="space-y-2 p-3 rounded-lg border border-border">
          <p className="text-xs font-medium text-muted-foreground">Nouveau template</p>
          <input
            placeholder="Nom du template"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            placeholder="Contenu (utilise {{name}}, {{slug}} pour les variables)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            placeholder="Variables (separees par des virgules: name, slug)"
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button size="sm" disabled={saving || !name || !content} onClick={handleCreate}>
            {saving ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : null}
            Creer
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Aucun template.</p>
        ) : (
          <div className="space-y-2">
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                    {t.content}
                  </p>
                  {t.variables.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {t.variables.map((v) => (
                        <Badge key={v} variant="outline" className="text-[10px]">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 shrink-0"
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Broadcast Section ───
function BroadcastSection() {
  const [message, setMessage] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterPlan, setFilterPlan] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    sent: number;
    failed: number;
  } | null>(null);

  async function handleBroadcast() {
    if (!message) return;
    if (!confirm("Envoyer ce message a tous les utilisateurs correspondants ?")) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/whatsapp/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          filter_type: filterType || null,
          filter_plan: filterPlan || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ total: data.total, sent: data.sent, failed: data.failed });
        toast.success(`Broadcast termine: ${data.sent} envoyes`);
      } else {
        toast.error(data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          <Phone className="inline h-4 w-4 mr-1.5" />
          Envoi en masse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm rounded-lg border border-border bg-transparent px-3 py-2"
          >
            <option value="">Tous les types</option>
            <option value="developer">Developpeurs</option>
            <option value="startup">Startups</option>
            <option value="enterprise">Entreprises</option>
          </select>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="text-sm rounded-lg border border-border bg-transparent px-3 py-2"
          >
            <option value="">Tous les plans</option>
            <option value="free">Gratuit</option>
            <option value="builder">Builder</option>
            <option value="startup">Startup</option>
            <option value="pro">Pro</option>
            <option value="growth">Growth</option>
          </select>
        </div>
        <textarea
          placeholder="Message a envoyer (utilise {{name}}, {{slug}} pour personnaliser)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button
          size="sm"
          variant="destructive"
          disabled={sending || !message}
          onClick={handleBroadcast}
        >
          {sending ? (
            <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
          ) : (
            <Send className="h-3 w-3 mr-1.5" />
          )}
          Envoyer le broadcast
        </Button>
        {result && (
          <div className="flex gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {result.sent} envoyes
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              {result.failed} echoues
            </span>
            <span className="text-muted-foreground">{result.total} cibles</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main WhatsApp Tab ───
export function AdminWhatsAppTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">WhatsApp Management</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusSection />
        <QuickSendSection />
      </div>
      <LogsSection />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemplatesSection />
        <BroadcastSection />
      </div>
    </div>
  );
}
