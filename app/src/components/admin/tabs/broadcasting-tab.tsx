"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Loader2, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Broadcast {
  id: string;
  subject: string;
  message: string;
  channels: string[];
  target_type?: string | null;
  target_plan?: string | null;
  status: string;
  scheduled_at?: string | null;
  created_at: string;
  sender?: { full_name: string } | null;
}

export function AdminBroadcastingTab() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [channels, setChannels] = useState({ email: true, inapp: true, sms: false });
  const [targetType, setTargetType] = useState("");
  const [targetPlan, setTargetPlan] = useState("");
  const [scheduleNow, setScheduleNow] = useState(true);
  const [scheduleDate, setScheduleDate] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  // History
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);

  // Preview count
  const [estimatedRecipients, setEstimatedRecipients] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/broadcasts");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBroadcasts(data.broadcasts ?? []);
    } catch {
      toast.error("Erreur lors du chargement de l'historique");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  async function fetchPreview() {
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/admin/broadcasts/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_type: targetType || undefined,
          target_plan: targetPlan || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEstimatedRecipients(data.count ?? 0);
    } catch {
      toast.error("Erreur lors de l'estimation");
    } finally {
      setPreviewLoading(false);
    }
  }

  // Refresh preview when targeting changes
  useEffect(() => { fetchPreview(); }, [targetType, targetPlan]);

  function handleSend() {
    if (!subject || !message) {
      toast.error("Objet et message requis");
      return;
    }
    setShowConfirm(true);
  }

  async function confirmSend() {
    setSending(true);
    try {
      const selectedChannels = Object.entries(channels).filter(([, v]) => v).map(([k]) => k);
      const res = await fetch("/api/admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          channels: selectedChannels,
          target_type: targetType || undefined,
          target_plan: targetPlan || undefined,
          scheduled_at: scheduleNow ? null : scheduleDate || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(`Broadcast envoye a ${estimatedRecipients} destinataires`);
      setShowConfirm(false);
      setSubject("");
      setMessage("");
      fetchHistory();
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  }

  const channelIcons: Record<string, string> = { email: "Email", inapp: "App", sms: "SMS" };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Broadcasting — Notifications de Masse</h2>

      {/* Composer */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Composer un message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Objet</Label>
            <Input
              placeholder="jobs.ivoire.io est en ligne !"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Message (Markdown supporte)
            </Label>
            <Textarea
              placeholder={"Bonjour,\n\nLe portail emploi d'ivoire.io est maintenant disponible !"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="mt-1"
              style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Canaux d&apos;envoi</Label>
            <div className="flex gap-4">
              {[
                { key: "email", label: "Email (via Resend)" },
                { key: "inapp", label: "Notification in-app" },
                { key: "sms", label: "SMS (futur)", disabled: true },
              ].map((c) => (
                <label key={c.key} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={channels[c.key as keyof typeof channels]}
                    onChange={(e) => setChannels({ ...channels, [c.key]: e.target.checked })}
                    className="accent-orange-500"
                    disabled={c.disabled}
                  />
                  <span className={c.disabled ? "text-muted-foreground" : ""}>{c.label}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ciblage */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Ciblage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Par type de profil</Label>
            <div className="flex gap-4 flex-wrap">
              {["", "developer", "startup", "enterprise"].map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" checked={targetType === t} onChange={() => setTargetType(t)} className="accent-orange-500" />
                  {t === "" ? "Tous" : t === "developer" ? "Developpeurs" : t.charAt(0).toUpperCase() + t.slice(1) + "s"}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Par plan</Label>
            <div className="flex gap-4 flex-wrap">
              {["", "free", "premium", "enterprise"].map((p) => (
                <label key={p} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" checked={targetPlan === p} onChange={() => setTargetPlan(p)} className="accent-orange-500" />
                  {p === "" ? "Tous" : p.charAt(0).toUpperCase() + p.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div
            className="rounded-lg px-4 py-3 text-sm font-semibold flex items-center gap-2"
            style={{ background: "color-mix(in srgb,var(--color-orange) 10%,transparent)", border: "1px solid color-mix(in srgb,var(--color-orange) 25%,transparent)", color: "var(--color-orange)" }}
          >
            {previewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Estimation : {estimatedRecipients} destinataires
          </div>
        </CardContent>
      </Card>

      {/* Programmation */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Programmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer text-sm">
            <input type="radio" checked={scheduleNow} onChange={() => setScheduleNow(true)} className="accent-orange-500" />
            Envoyer maintenant
          </label>
          <label className="flex items-center gap-3 cursor-pointer text-sm">
            <input type="radio" checked={!scheduleNow} onChange={() => setScheduleNow(false)} className="accent-orange-500" />
            Programmer :
            {!scheduleNow && (
              <Input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="h-7 text-xs w-52"
              />
            )}
          </label>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" className="gap-2" onClick={fetchPreview} disabled={previewLoading}>
          {previewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
          Rafraichir estimation
        </Button>
        <Button className="gap-2" style={{ background: "var(--color-orange)" }} onClick={handleSend}>
          <Send className="h-4 w-4" /> Envoyer a {estimatedRecipients} destinataires
        </Button>
      </div>

      {/* Confirmation */}
      {showConfirm && (
        <Card style={{ background: "color-mix(in srgb,var(--color-orange) 8%,var(--color-surface))", border: "1px solid color-mix(in srgb,var(--color-orange) 25%,transparent)" }}>
          <CardContent className="p-4">
            <div className="font-semibold text-sm mb-2">Confirmation requise avant envoi</div>
            <div className="text-sm text-muted-foreground mb-3">
              Vous allez envoyer a <strong className="text-foreground">{estimatedRecipients} personnes</strong>
              <br />
              Objet : &ldquo;{subject}&rdquo;
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>Annuler</Button>
              <Button style={{ background: "var(--color-orange)" }} onClick={confirmSend} disabled={sending}>
                {sending && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                Confirmer l&apos;envoi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Historique des Broadcasts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left p-3 pl-4">Date</th>
                  <th className="text-left p-3">Objet</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Canaux</th>
                </tr>
              </thead>
              <tbody>
                {broadcasts.map((b) => (
                  <tr key={b.id} className="border-b border-border/50 hover:bg-white/2">
                    <td className="p-3 pl-4 text-xs text-muted-foreground font-mono">
                      {new Date(b.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-3 text-sm">{b.subject}</td>
                    <td className="p-3 text-xs">{b.status}</td>
                    <td className="p-3 text-sm">{(b.channels ?? []).map((c) => channelIcons[c] ?? c).join(", ")}</td>
                  </tr>
                ))}
                {broadcasts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-muted-foreground">Aucun broadcast</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
