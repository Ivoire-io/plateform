"use client";

import { Check, Loader2, Mail, Phone, User, X } from "lucide-react";
import type { useRegistrationForm } from "./use-registration-form";

function FieldStatus({ ok, msg }: { ok: boolean | null; msg: string }) {
  if (ok === null) return null;
  return (
    <p
      className={`text-xs mt-1.5 flex items-center gap-1 ${ok ? "text-green-400" : "text-red-400"}`}
    >
      {ok ? <Check size={11} /> : <X size={11} />}
      {msg}
    </p>
  );
}

type FormReturn = ReturnType<typeof useRegistrationForm>;

export function BaseFields({ form }: { form: FormReturn }) {
  const slugBorder =
    form.slugStatus === "available"
      ? "border-green-400/60 ring-1 ring-green-400/30"
      : form.slugStatus === "taken" ||
          form.slugStatus === "reserved" ||
          form.slugStatus === "invalid"
        ? "border-red-400/60 ring-1 ring-red-400/20"
        : "border-border focus-within:border-orange focus-within:ring-1 focus-within:ring-orange";

  const slugMsg =
    form.slugStatus === "available"
      ? { ok: true, msg: `${form.slug}.ivoire.io est disponible !` }
      : form.slugStatus === "taken"
        ? { ok: false, msg: "Ce domaine est déjà réservé." }
        : form.slugStatus === "reserved"
          ? { ok: false, msg: "Ce nom est réservé par ivoire.io." }
          : form.slugStatus === "invalid"
            ? {
                ok: false,
                msg: "3–30 caractères, lettres et chiffres uniquement.",
              }
            : form.slugStatus === "too_short"
              ? { ok: false, msg: "Minimum 3 caractères." }
              : null;

  return (
    <>
      {/* Nom + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Nom complet
          </label>
          <div className="relative">
            <User
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/50 pointer-events-none"
            />
            <input
              required
              placeholder="John Koffi"
              value={form.fullName}
              onChange={(e) => form.setFullName(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-colors"
            />
          </div>
          {form.fullName.length > 0 && form.fullName.trim().length < 2 && (
            <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
              <X size={11} /> Minimum 2 caractères.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Email
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/50 pointer-events-none"
            />
            <input
              required
              type="email"
              placeholder="john@email.com"
              value={form.email}
              onChange={(e) => {
                form.setEmail(e.target.value);
                form.setEmailTouched(true);
              }}
              onBlur={() => form.setEmailTouched(true)}
              className={`w-full bg-background border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none transition-colors
                ${
                  form.emailTouched && form.emailOk === false
                    ? "border-red-400/60 focus:border-red-400 focus:ring-1 focus:ring-red-400/30"
                    : form.emailTouched && form.emailOk === true
                      ? "border-green-400/60 focus:border-green-400"
                      : "border-border focus:border-orange focus:ring-1 focus:ring-orange"
                }`}
            />
          </div>
          {form.emailTouched && (
            <FieldStatus
              ok={form.emailOk}
              msg={
                form.emailOk
                  ? "Adresse email valide."
                  : "Adresse email invalide."
              }
            />
          )}
        </div>
      </div>

      {/* Slug + WhatsApp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Ton domaine
          </label>
          <div
            className={`flex items-center bg-background border rounded-xl overflow-hidden transition-all ${slugBorder}`}
          >
            <input
              required
              placeholder="ton-nom"
              value={form.slug}
              onChange={(e) => form.handleSlugChange(e.target.value)}
              className="flex-1 min-w-0 bg-transparent px-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none font-mono"
              maxLength={30}
              spellCheck={false}
              autoCapitalize="none"
            />
            {form.slugStatus === "checking" && (
              <Loader2
                size={14}
                className="mr-2 text-muted animate-spin shrink-0"
              />
            )}
            {form.slugStatus === "available" && (
              <Check size={14} className="mr-2 text-green-400 shrink-0" />
            )}
            {(form.slugStatus === "taken" ||
              form.slugStatus === "reserved" ||
              form.slugStatus === "invalid") && (
              <X size={14} className="mr-2 text-red-400 shrink-0" />
            )}
            <span className="shrink-0 text-muted/60 pr-3 font-mono text-xs border-l border-border/60 pl-2.5 py-3">
              .ivoire.io
            </span>
          </div>
          {slugMsg && <FieldStatus ok={slugMsg.ok} msg={slugMsg.msg} />}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            WhatsApp
          </label>
          <div
            className={`flex items-center bg-background border rounded-xl overflow-hidden transition-all
              ${
                form.whatsappTouched && form.whatsappOk === false
                  ? "border-red-400/60 ring-1 ring-red-400/20"
                  : form.whatsappTouched && form.whatsappOk === true
                    ? "border-green-400/60"
                    : "border-border focus-within:border-orange focus-within:ring-1 focus-within:ring-orange"
              }`}
          >
            <span className="shrink-0 pl-3 pr-2 text-sm border-r border-border/60 py-3 flex items-center gap-1.5">
              <Phone size={13} className="text-muted/50" />
              <span className="text-muted/60 text-xs font-mono">+225</span>
            </span>
            <input
              type="tel"
              required
              placeholder="07 00 00 00 00"
              value={form.whatsapp}
              onChange={(e) => {
                form.setWhatsapp(e.target.value.replace(/[^0-9 ]/g, ""));
                form.setWhatsappTouched(true);
              }}
              onBlur={() => form.setWhatsappTouched(true)}
              className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none"
              maxLength={14}
            />
          </div>
          {form.whatsappTouched && form.whatsappOk === false && (
            <FieldStatus
              ok={false}
              msg="10 chiffres, commençant par 01, 05 ou 07."
            />
          )}
          {form.whatsappTouched && form.whatsappOk === true && (
            <FieldStatus ok={true} msg="Numéro valide." />
          )}
        </div>
      </div>
    </>
  );
}
