"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BroadcastHistory {
  date: string;
  subject: string;
  recipients: number;
  channels: string[];
}

const HISTORY: BroadcastHistory[] = [
  { date: "10/03/26", subject: "Bienvenue sur ivoire.io", recipients: 1247, channels: ["📧", "🔔"] },
  { date: "01/03/26", subject: "Phase 2 lancée !", recipients: 500, channels: ["📧"] },
  { date: "15/02/26", subject: "Votre portfolio est prêt", recipients: 200, channels: ["📧", "🔔"] },
];

export function AdminBroadcastingTab() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [channels, setChannels] = useState({ email: true, inapp: true, sms: false });
  const [targetTypes, setTargetTypes] = useState({ developer: true, startup: true, enterprise: true, other: false });
  const [targetPlans, setTargetPlans] = useState({ free: true, premium: true, enterprise: true });
  const [scheduleNow, setScheduleNow] = useState(true);
  const [scheduleDate, setScheduleDate] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const estimatedRecipients = 847;

  function handlePreview() {
    toast.info("Prévisualisation générée (simulation)");
  }

  function handleSend() {
    if (!subject || !message) {
      toast.error("Objet et message requis");
      return;
    }
    setShowConfirm(true);
  }

  function confirmSend() {
    toast.success(`Broadcast envoyé à ${estimatedRecipients} destinataires`);
    setShowConfirm(false);
    setSubject("");
    setMessage("");
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">📢 Broadcasting — Notifications de Masse</h2>

      {/* Composer */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">📝 Composer un message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Objet</Label>
            <Input
              placeholder="🚀 jobs.ivoire.io est en ligne !"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">
              Message (Markdown supporté · Variables : {"{prénom}"} {"{nom}"} {"{slug}"} {"{type}"})
            </Label>
            <Textarea
              placeholder={`Bonjour {prénom},\n\nLe portail emploi d'ivoire.io est maintenant disponible !\n\n👉 Accéder → jobs.ivoire.io`}
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
                { key: "email", label: "📧 Email (via Resend)" },
                { key: "inapp", label: "🔔 Notification in-app" },
                { key: "sms", label: "💬 SMS (futur)" },
              ].map((c) => (
                <label key={c.key} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={channels[c.key as keyof typeof channels]}
                    onChange={(e) => setChannels({ ...channels, [c.key]: e.target.checked })}
                    className="accent-orange-500"
                    disabled={c.key === "sms"}
                  />
                  <span className={c.key === "sms" ? "text-muted-foreground" : ""}>{c.label}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ciblage */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">🎯 Ciblage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Par type de profil</Label>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(targetTypes).map(([k, v]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer text-sm capitalize">
                  <input type="checkbox" checked={v} onChange={(e) => setTargetTypes({ ...targetTypes, [k]: e.target.checked })} className="accent-orange-500" />
                  {k === "developer" ? "Développeurs" : k.charAt(0).toUpperCase() + k.slice(1) + "s"}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Par plan</Label>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(targetPlans).map(([k, v]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer text-sm capitalize">
                  <input type="checkbox" checked={v} onChange={(e) => setTargetPlans({ ...targetPlans, [k]: e.target.checked })} className="accent-orange-500" />
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div
            className="rounded-lg px-4 py-3 text-sm font-semibold"
            style={{ background: "color-mix(in srgb,var(--color-orange) 10%,transparent)", border: "1px solid color-mix(in srgb,var(--color-orange) 25%,transparent)", color: "var(--color-orange)" }}
          >
            📊 Estimation : {estimatedRecipients} destinataires
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
        <Button variant="outline" className="gap-2" onClick={handlePreview}>
          <Eye className="h-4 w-4" /> Prévisualiser
        </Button>
        <Button className="gap-2" style={{ background: "var(--color-orange)" }} onClick={handleSend}>
          <Send className="h-4 w-4" /> Envoyer à {estimatedRecipients} destinataires
        </Button>
      </div>

      {/* Confirmalion */}
      {showConfirm && (
        <Card style={{ background: "color-mix(in srgb,var(--color-orange) 8%,var(--color-surface))", border: "1px solid color-mix(in srgb,var(--color-orange) 25%,transparent)" }}>
          <CardContent className="p-4">
            <div className="font-semibold text-sm mb-2">⚠️ Confirmation requise avant envoi</div>
            <div className="text-sm text-muted-foreground mb-3">
              Vous allez envoyer à <strong className="text-foreground">{estimatedRecipients} personnes</strong> via {channels.email ? "Email " : ""}{channels.inapp ? "+ App" : ""}
              <br />
              Objet : &ldquo;{subject}&rdquo;
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>✖ Annuler</Button>
              <Button style={{ background: "var(--color-orange)" }} onClick={confirmSend}>✅ Confirmer l&apos;envoi</Button>
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                <th className="text-left p-3 pl-4">Date</th>
                <th className="text-left p-3">Objet</th>
                <th className="text-left p-3">Destinataires</th>
                <th className="text-left p-3">Canaux</th>
              </tr>
            </thead>
            <tbody>
              {HISTORY.map((h, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-white/2">
                  <td className="p-3 pl-4 text-xs text-muted-foreground font-mono">{h.date}</td>
                  <td className="p-3 text-sm">{h.subject}</td>
                  <td className="p-3 text-xs">{h.recipients.toLocaleString()}</td>
                  <td className="p-3 text-sm">{h.channels.join(" ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
