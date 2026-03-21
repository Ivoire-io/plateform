"use client";

import { createClient } from "@/lib/supabase/client";
import { TABLES } from "@/lib/utils";
import { Check, CheckCircle2, Loader2, Mail, Phone, Rocket, User, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type FormType = "developer" | "startup" | "enterprise" | "other";
type SlugStatus = "idle" | "checking" | "available" | "taken" | "reserved" | "invalid" | "too_short";

const TYPES: { value: FormType; emoji: string; label: string; desc: string }[] = [
  { value: "developer", emoji: "🧑‍💻", label: "Développeur", desc: "Portfolio & projets" },
  { value: "startup", emoji: "🚀", label: "Startup", desc: "Présence & visibilité" },
  { value: "enterprise", emoji: "🏢", label: "Entreprise", desc: "Services & équipe" },
  { value: "other", emoji: "✨", label: "Autre", desc: "Créatif, freelance…" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Numéros CI : 10 chiffres commençant par 01, 05 ou 07
const WHATSAPP_VALID = (v: string) => {
  const digits = v.replace(/\s/g, "");
  return digits.length === 0 || (/^(01|05|07)\d{8}$/.test(digits));
};

function FieldStatus({ ok, msg }: { ok: boolean | null; msg: string }) {
  if (ok === null) return null;
  return (
    <p className={`text-xs mt-1.5 flex items-center gap-1 ${ok ? "text-green-400" : "text-red-400"}`}>
      {ok ? <Check size={11} /> : <X size={11} />}
      {msg}
    </p>
  );
}

export function WaitlistSection() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappTouched, setWhatsappTouched] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [type, setType] = useState<FormType>("developer");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchParams = useSearchParams();

  // Capture referral code from URL ?ref=xxx and persist in localStorage
  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam) {
      localStorage.setItem("ivoire_ref", refParam);
    }
  }, [searchParams]);

  // Validation dérivée
  const emailOk = email.length === 0 ? null : EMAIL_REGEX.test(email);
  const whatsappDigits = whatsapp.replace(/\s/g, "");
  const whatsappOk =
    whatsappDigits.length === 0
      ? null
      : /^(01|05|07)\d{8}$/.test(whatsappDigits)
        ? true
        : false;
  const slugOk =
    slugStatus === "available" ? true : slugStatus === "idle" || slugStatus === "too_short" ? null : false;

  // Vérification disponibilité slug
  const checkSlug = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setSlugStatus(value.length > 0 ? "too_short" : "idle");
      return;
    }
    setSlugStatus("checking");
    try {
      const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (data.available === true) setSlugStatus("available");
      else if (data.reason === "reserved") setSlugStatus("reserved");
      else if (data.reason === "invalid_format") setSlugStatus("invalid");
      else setSlugStatus("taken");
    } catch {
      setSlugStatus("idle");
    }
  }, []);

  const handleSlugChange = useCallback((raw: string) => {
    const formatted = raw.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").slice(0, 30);
    setSlug(formatted);
    setSlugStatus("idle");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkSlug(formatted), 400);
  }, [checkSlug]);

  // Écoute les modifications DOM depuis le héro (dispatchEvent)
  useEffect(() => {
    const el = document.getElementById("waitlist-slug") as HTMLInputElement | null;
    if (!el) return;
    const handler = () => handleSlugChange(el.value);
    el.addEventListener("input", handler);
    return () => el.removeEventListener("input", handler);
  }, [handleSlugChange]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const isFormValid =
    fullName.trim().length >= 2 &&
    EMAIL_REGEX.test(email) &&
    (whatsappDigits.length === 0 || /^(01|05|07)\d{8}$/.test(whatsappDigits)) &&
    slugStatus === "available";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitStatus("loading");
    setErrorMsg("");

    try {
      const supabase = createClient();
      const referralCode = localStorage.getItem("ivoire_ref") || null;
      const { error } = await supabase.from(TABLES.waitlist).insert({
        email,
        full_name: fullName.trim(),
        desired_slug: slug,
        whatsapp: whatsappDigits.length > 0 ? `+225${whatsappDigits}` : null,
        type,
        referral_code: referralCode,
      });

      if (error) {
        setErrorMsg(
          error.code === "23505"
            ? "Cet email ou ce domaine est déjà enregistré."
            : "Une erreur est survenue. Réessaie."
        );
        setSubmitStatus("error");
        return;
      }
      setSubmitStatus("success");
    } catch {
      setErrorMsg("Erreur de connexion. Réessaie.");
      setSubmitStatus("error");
    }
  };

  if (submitStatus === "success") {
    return (
      <section id="rejoindre" className="py-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="relative bg-surface border border-green-500/20 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#00A651_0%,_transparent_70%)] opacity-[0.06]" />
            <CheckCircle2 className="mx-auto text-green-400 mb-5" size={56} strokeWidth={1.5} />
            <h2 className="text-2xl font-bold mb-3">Tu es dans la liste 🎉</h2>
            <p className="text-muted mb-6">
              On te prévient dès que{" "}
              <span className="font-mono text-orange font-medium">{slug}.ivoire.io</span>{" "}
              est prêt à être activé.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 border border-orange/20 text-orange text-sm">
              <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
              Lancement imminent
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Couleur de bordure slug
  const slugBorder =
    slugStatus === "available"
      ? "border-green-400/60 ring-1 ring-green-400/30"
      : slugStatus === "taken" || slugStatus === "reserved" || slugStatus === "invalid"
        ? "border-red-400/60 ring-1 ring-red-400/20"
        : "border-border focus-within:border-orange focus-within:ring-1 focus-within:ring-orange";

  const slugStatusMsg =
    slugStatus === "available" ? { ok: true, msg: `${slug}.ivoire.io est disponible !` } :
      slugStatus === "taken" ? { ok: false, msg: "Ce domaine est déjà réservé." } :
        slugStatus === "reserved" ? { ok: false, msg: "Ce nom est réservé par ivoire.io." } :
          slugStatus === "invalid" ? { ok: false, msg: "3–30 caractères, commence et finit par une lettre ou un chiffre." } :
            slugStatus === "too_short" ? { ok: false, msg: "Minimum 3 caractères." } :
              null;

  return (
    <section id="rejoindre" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--color-orange)_0%,_transparent_60%)] opacity-[0.04]" />

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange/20 bg-orange/5 text-orange text-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
            Accès anticipé ouvert
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Rejoins les premiers bâtisseurs
          </h2>
          <p className="text-muted max-w-sm mx-auto">
            Réserve ton domaine avant que quelqu&apos;un d&apos;autre le prenne.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface/60 backdrop-blur-sm border border-border rounded-3xl p-8 md:p-10 space-y-6"
        >
          {/* Nom + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nom */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Nom complet
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/50 pointer-events-none" />
                <input
                  required
                  placeholder="John Koffi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-colors"
                />
              </div>
              {fullName.length > 0 && fullName.trim().length < 2 && (
                <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                  <X size={11} /> Minimum 2 caractères.
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/50 pointer-events-none" />
                <input
                  required
                  type="email"
                  placeholder="john@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }}
                  onBlur={() => setEmailTouched(true)}
                  className={`w-full bg-background border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none transition-colors
                    ${emailTouched && emailOk === false
                      ? "border-red-400/60 focus:border-red-400 focus:ring-1 focus:ring-red-400/30"
                      : emailTouched && emailOk === true
                        ? "border-green-400/60 focus:border-green-400"
                        : "border-border focus:border-orange focus:ring-1 focus:ring-orange"
                    }`}
                />
              </div>
              {emailTouched && (
                <FieldStatus
                  ok={emailOk}
                  msg={emailOk ? "Adresse email valide." : "Adresse email invalide."}
                />
              )}
            </div>
          </div>

          {/* Domaine + WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider">
                Ton domaine
              </label>
              <div className={`flex items-center bg-background border rounded-xl overflow-hidden transition-all ${slugBorder}`}>
                <input
                  id="waitlist-slug"
                  required
                  placeholder="ton-nom"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent px-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none font-mono"
                  maxLength={30}
                  spellCheck={false}
                  autoCapitalize="none"
                />
                {/* Status icon */}
                {slugStatus === "checking" && (
                  <Loader2 size={14} className="mr-2 text-muted animate-spin shrink-0" />
                )}
                {slugStatus === "available" && (
                  <Check size={14} className="mr-2 text-green-400 shrink-0" />
                )}
                {(slugStatus === "taken" || slugStatus === "reserved" || slugStatus === "invalid") && (
                  <X size={14} className="mr-2 text-red-400 shrink-0" />
                )}
                <span className="shrink-0 text-muted/60 pr-3 font-mono text-xs border-l border-border/60 pl-2.5 py-3">
                  .ivoire.io
                </span>
              </div>
              {slugStatusMsg && (
                <FieldStatus ok={slugStatusMsg.ok} msg={slugStatusMsg.msg} />
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted uppercase tracking-wider flex items-center gap-2">
                WhatsApp
              </label>
              <div className={`flex items-center bg-background border rounded-xl overflow-hidden transition-all
                ${whatsappTouched && whatsappOk === false
                  ? "border-red-400/60 ring-1 ring-red-400/20"
                  : whatsappTouched && whatsappOk === true
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
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value.replace(/[^0-9 ]/g, ""));
                    setWhatsappTouched(true);
                  }}
                  onBlur={() => setWhatsappTouched(true)}
                  className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none"
                  maxLength={14}
                />
              </div>
              {whatsappTouched && whatsappOk === false && (
                <FieldStatus
                  ok={false}
                  msg="10 chiffres, commençant par 01, 05 ou 07."
                />
              )}
              {whatsappTouched && whatsappOk === true && (
                <FieldStatus ok={true} msg="Numéro valide." />
              )}
            </div>
          </div>

          {/* Type */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted uppercase tracking-wider">
              Tu es
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TYPES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={`relative flex flex-col items-center gap-1.5 px-3 py-4 rounded-2xl border text-sm transition-all cursor-pointer ${type === option.value
                    ? "border-orange bg-orange/10 text-white"
                    : "border-border bg-background/50 text-muted hover:border-border hover:text-white/70"
                    }`}
                >
                  {type === option.value && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange" />
                  )}
                  <span className="text-xl">{option.emoji}</span>
                  <span className="font-medium text-xs">{option.label}</span>
                  <span className="text-muted/50 text-[10px] leading-tight text-center hidden sm:block">
                    {option.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error global */}
          {submitStatus === "error" && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-400/5 border border-red-400/20 text-red-400 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitStatus === "loading" || !isFormValid}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-orange hover:bg-orange-hover text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange/20 hover:shadow-orange/30"
          >
            {submitStatus === "loading" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Inscription en cours…
              </>
            ) : (
              <>
                <Rocket size={18} />
                Je réserver
                {slugStatus === "available" ? (
                  <>
                    {' '}{slug}
                  </>
                ) : ' mon '}
                .ivoire.io
              </>
            )}
          </button>

          {/* Hint si form pas encore valide */}
          {!isFormValid && slug.length > 0 && (
            <p className="text-center text-xs text-muted/50">
              {slugStatus !== "available"
                ? "Vérifie la disponibilité de ton domaine pour continuer."
                : "Complète tous les champs requis."}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
