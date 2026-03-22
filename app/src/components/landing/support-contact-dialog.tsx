"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Mail, Send, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

type SupportContactDialogProps = {
  triggerLabel?: string;
  triggerClassName?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  triggerSize?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  compact?: boolean;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SupportContactDialog({
  triggerLabel = "Contacter par email",
  triggerClassName,
  triggerVariant = "outline",
  triggerSize = "default",
  compact = false,
}: SupportContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [startedAt, setStartedAt] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const emailValid = useMemo(() => email.length === 0 || EMAIL_REGEX.test(email), [email]);
  const messageValid = message.trim().length >= 20;

  function resetForm() {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setWebsite("");
    setError(null);
    setSuccess(null);
    setSubmitting(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setStartedAt(Date.now());
      setError(null);
      setSuccess(null);
    } else {
      resetForm();
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError("Merci de remplir tous les champs requis.");
      return;
    }

    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      setError("Adresse email invalide.");
      return;
    }

    if (message.trim().length < 20) {
      setError("Le message doit contenir au moins 20 caractères.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject.trim(),
          message: message.trim(),
          website,
          startedAt,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error || "Impossible d'envoyer le message.");
        return;
      }

      setSuccess("Message envoyé. L'équipe ivoire.io reviendra vers toi rapidement.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setWebsite("");
      setStartedAt(Date.now());
    } catch {
      setError("Impossible d'envoyer le message pour le moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant={triggerVariant}
            size={triggerSize}
            className={cn(triggerClassName)}
          />
        }
      >
        {!compact && <Mail size={16} />}
        {triggerLabel}
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl border border-border bg-[#0b0b12]/95 p-0 text-white backdrop-blur-xl">
        <div className="rounded-t-xl border-b border-white/5 bg-[radial-gradient(circle_at_top,_rgba(255,107,0,0.18),_transparent_55%)] px-6 py-6">
          <DialogHeader className="gap-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange/20 bg-orange/10 px-3 py-1 text-xs font-medium text-orange">
              <Sparkles size={14} />
              Support ivoire.io
            </div>
            <DialogTitle className="text-2xl font-semibold text-white">
              Écris-nous proprement
            </DialogTitle>
            <DialogDescription className="max-w-lg text-sm leading-relaxed text-white/65">
              Utilise ce formulaire si tu as une question produit, un blocage à l'inscription,
              un besoin d'orientation, ou une demande liée au lancement.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <input
            type="text"
            name="website"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="support-name" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                Nom
              </label>
              <Input
                id="support-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ton nom"
                autoComplete="name"
                className="border-white/10 bg-white/[0.03]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="support-email" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                Email
              </label>
              <Input
                id="support-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="hello@domaine.com"
                autoComplete="email"
                className={cn(
                  "border-white/10 bg-white/[0.03]",
                  email.length > 0 && !emailValid && "border-red-500/40 focus:border-red-500"
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="support-subject" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Sujet
            </label>
            <Input
              id="support-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Ex: problème d'inscription, question startup, support portfolio"
              className="border-white/10 bg-white/[0.03]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="support-message" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Message
            </label>
            <Textarea
              id="support-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Explique clairement ton besoin pour qu'on puisse t'aider vite."
              rows={6}
              className={cn(
                "min-h-[144px] border-white/10 bg-white/[0.03]",
                message.length > 0 && !messageValid && "border-red-500/40 focus:border-red-500"
              )}
            />
            <p className="text-xs text-white/45">
              Minimum 20 caractères. Les protections anti-spam sont actives sur ce formulaire.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {success}
            </div>
          )}

          <DialogFooter className="-mx-6 -mb-6 border-t border-white/5 bg-white/[0.02] px-6 py-4">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-white/45">
                Support direct aussi sur WhatsApp: +225 01 71 18 18 00
              </p>
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 bg-orange text-white hover:bg-orange/90"
              >
                {submitting ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                Envoyer le message
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}