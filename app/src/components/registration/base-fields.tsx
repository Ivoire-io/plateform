"use client";

import { Check, Loader2, Mail, Phone, RotateCcw, ShieldCheck, User, X } from "lucide-react";
import { useCallback, useRef } from "react";
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

function OtpInputRow({ form }: { form: FormReturn }) {
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const newOtp = [...form.otpCode];
      newOtp[index] = value.slice(-1);
      form.setOtpCode(newOtp);

      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }

      const fullCode = newOtp.join("");
      if (fullCode.length === 6) {
        form.verifyOtp(fullCode);
      }
    },
    [form]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      if (pasted.length === 0) return;
      const newOtp = [...form.otpCode];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || "";
      }
      form.setOtpCode(newOtp);
      if (pasted.length === 6) {
        form.verifyOtp(pasted);
      } else {
        otpRefs.current[pasted.length]?.focus();
      }
    },
    [form]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !form.otpCode[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [form.otpCode]
  );

  return (
    <div className="space-y-2 mt-2">
      <p className="text-xs text-muted">
        Code envoye au <span className="text-white font-medium">+225 {form.whatsapp}</span>
      </p>
      <div className="flex gap-1.5" onPaste={handlePaste}>
        {form.otpCode.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { otpRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-9 h-10 text-center text-sm font-bold bg-white/[0.02] border rounded-lg text-white focus:outline-none transition-all
              ${form.otpError
                ? "border-red-400/60 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                : "border-white/10 focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20"
              }`}
          />
        ))}
        {form.otpStep === "verifying" && (
          <div className="flex items-center ml-1">
            <Loader2 size={14} className="animate-spin text-[#25D366]" />
          </div>
        )}
      </div>
      {form.otpError && (
        <p className="text-xs text-red-400">{form.otpError}</p>
      )}
      <div className="flex items-center justify-between text-[10px] text-muted">
        <span>
          {form.otpRemainingAttempts < 5 && `${form.otpRemainingAttempts} tentative${form.otpRemainingAttempts > 1 ? "s" : ""}`}
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={form.sendOtp}
            disabled={form.otpCountdown > 0 || form.otpStep === "verifying"}
            className="flex items-center gap-1 text-[#25D366] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={10} />
            {form.otpCountdown > 0 ? `${form.otpCountdown}s` : "Renvoyer"}
          </button>
          <button
            type="button"
            onClick={form.resetOtp}
            className="text-muted hover:text-white hover:underline"
          >
            Changer
          </button>
        </div>
      </div>
    </div>
  );
}

export function BaseFields({ form }: { form: FormReturn }) {
  const slugBorder =
    form.slugStatus === "available"
      ? "border-green-400/60 ring-4 ring-green-400/10"
      : form.slugStatus === "taken" ||
        form.slugStatus === "reserved" ||
        form.slugStatus === "invalid"
        ? "border-red-400/60 ring-4 ring-red-400/10"
        : "border-white/10 focus-within:border-orange focus-within:ring-4 focus-within:ring-orange/10";

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
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none focus:border-orange focus:ring-4 focus:ring-orange/10 transition-all hover:bg-white/[0.04]"
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
            Email {form.isPhoneVerified && <span className="normal-case text-muted/50">(optionnel)</span>}
          </label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/50 pointer-events-none"
            />
            <input
              required={!form.isPhoneVerified}
              type="email"
              placeholder={form.isPhoneVerified ? "Optionnel si WhatsApp verifie" : "john@email.com"}
              value={form.email}
              onChange={(e) => {
                form.setEmail(e.target.value);
                form.setEmailTouched(true);
              }}
              onBlur={() => form.setEmailTouched(true)}
              className={`w-full bg-white/[0.02] border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none transition-all hover:bg-white/[0.04]
                ${form.emailTouched && form.emailOk === false
                  ? "border-red-400/60 focus:border-red-400 focus:ring-4 focus:ring-red-400/10"
                  : form.emailTouched && form.emailOk === true
                    ? "border-green-400/60 focus:border-green-400 focus:ring-4 focus:ring-green-400/10"
                    : "border-white/10 focus:border-orange focus:ring-4 focus:ring-orange/10"
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
            className={`flex items-center bg-white/[0.02] border rounded-xl overflow-hidden transition-all hover:bg-white/[0.04] ${slugBorder}`}
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
            <span className="shrink-0 text-muted/60 pr-3 font-mono text-xs border-l border-white/10 pl-2.5 py-3">
              .ivoire.io
            </span>
          </div>
          {slugMsg && <FieldStatus ok={slugMsg.ok} msg={slugMsg.msg} />}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wider flex items-center gap-1.5">
            WhatsApp *
            {form.isPhoneVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full normal-case">
                <ShieldCheck size={10} /> Verifie
              </span>
            )}
          </label>

          {/* Phone input + verify button */}
          <div
            className={`flex items-center bg-white/[0.02] border rounded-xl overflow-hidden transition-all hover:bg-white/[0.04]
              ${form.isPhoneVerified
                ? "border-green-400/60 ring-4 ring-green-400/10"
                : form.whatsappTouched && form.whatsappOk === false
                  ? "border-red-400/60 ring-4 ring-red-400/10"
                  : form.whatsappTouched && form.whatsappOk === true
                    ? "border-[#25D366]/60 ring-4 ring-[#25D366]/10"
                    : "border-white/10 focus-within:border-orange focus-within:ring-4 focus-within:ring-orange/10"
              }`}
          >
            <span className="shrink-0 pl-3 pr-2 text-sm border-r border-white/10 py-3 flex items-center gap-1.5">
              <Phone size={13} className="text-muted/50" />
              <span className="text-muted/60 text-xs font-mono">+225</span>
            </span>
            <input
              type="tel"
              required
              placeholder="07 00 00 00 00"
              value={form.whatsapp}
              readOnly={form.isPhoneVerified || form.otpStep === "sent" || form.otpStep === "verifying"}
              onChange={(e) => {
                if (!form.isPhoneVerified && form.otpStep === "idle") {
                  form.setWhatsapp(e.target.value.replace(/[^0-9 ]/g, ""));
                  form.setWhatsappTouched(true);
                }
              }}
              onBlur={() => form.setWhatsappTouched(true)}
              className={`flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none ${form.isPhoneVerified || form.otpStep !== "idle" ? "cursor-not-allowed opacity-70" : ""}`}
              maxLength={14}
            />
            {/* Verify button inline */}
            {!form.isPhoneVerified && (form.otpStep === "idle" || form.otpStep === "sending") && form.whatsappOk === true && (
              <button
                type="button"
                onClick={form.sendOtp}
                disabled={form.otpStep === "sending"}
                className="shrink-0 mr-2 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all
                  bg-[#25D366] hover:bg-[#20BD5A] text-white disabled:opacity-50"
              >
                {form.otpStep === "sending" ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  "Verifier"
                )}
              </button>
            )}
            {form.isPhoneVerified && (
              <ShieldCheck size={16} className="shrink-0 mr-3 text-green-400" />
            )}
          </div>

          {/* Validation message (before OTP sent) */}
          {form.otpStep === "idle" && form.whatsappTouched && form.whatsappOk === false && (
            <FieldStatus
              ok={false}
              msg="10 chiffres, commençant par 01, 05 ou 07."
            />
          )}
          {form.otpStep === "idle" && form.whatsappTouched && form.whatsappOk === true && !form.isPhoneVerified && (
            <p className="text-[11px] text-muted/60 mt-1">
              Clique sur &quot;Verifier&quot; pour recevoir un code WhatsApp.
            </p>
          )}

          {/* OTP error at sending stage */}
          {form.otpStep === "idle" && form.otpError && (
            <p className="text-xs text-red-400 mt-1">{form.otpError}</p>
          )}

          {/* OTP input row */}
          {(form.otpStep === "sent" || form.otpStep === "verifying") && (
            <OtpInputRow form={form} />
          )}

          {/* Verified message */}
          {form.isPhoneVerified && (
            <FieldStatus ok={true} msg="Numero WhatsApp verifie !" />
          )}
        </div>
      </div>
    </>
  );
}
