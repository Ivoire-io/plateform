"use client";

import { Check, Loader2, Phone, RotateCcw, ShieldCheck, X } from "lucide-react";
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
        Code envoyé au <span className="text-white font-medium">+225 {form.whatsapp}</span>
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
            className={`w-9 h-10 text-center text-sm font-bold bg-muted border rounded-lg text-foreground focus:outline-none transition-all
              ${form.otpError
                ? "border-red-400/60 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                : "border-border focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20"
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
            className="text-muted hover:text-foreground hover:underline"
          >
            Changer
          </button>
        </div>
      </div>
    </div>
  );
}

export function BaseFields({ form }: { form: FormReturn }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted uppercase tracking-wider flex items-center gap-1.5">
        WhatsApp *
        {form.isPhoneVerified && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full normal-case">
            <ShieldCheck size={10} /> Vérifié
          </span>
        )}
      </label>

      {/* Phone input + verify button */}
      <div className="flex items-center gap-2">
        <div
          className={`flex-1 flex items-center bg-muted border rounded-xl overflow-hidden transition-all hover:bg-accent
            ${form.isPhoneVerified
              ? "border-green-400/60 ring-4 ring-green-400/10"
              : form.whatsappTouched && form.whatsappOk === false
                ? "border-red-400/60 ring-4 ring-red-400/10"
                : form.whatsappTouched && form.whatsappOk === true
                  ? "border-[#25D366]/60 ring-4 ring-[#25D366]/10"
                  : "border-border focus-within:border-orange focus-within:ring-4 focus-within:ring-orange/10"
            }`}
        >
          <span className="shrink-0 pl-3 pr-2 text-sm border-r border-border py-3 flex items-center gap-1.5">
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
            className={`flex-1 min-w-0 bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none ${form.isPhoneVerified || form.otpStep !== "idle" ? "cursor-not-allowed opacity-70" : ""}`}
            maxLength={14}
          />
          {form.isPhoneVerified && (
            <ShieldCheck size={16} className="shrink-0 mr-3 text-green-400" />
          )}
        </div>

        {/* Verify button — outside overflow-hidden container */}
        {!form.isPhoneVerified && (form.otpStep === "idle" || form.otpStep === "sending") && form.whatsappOk === true && (
          <button
            type="button"
            onClick={form.sendOtp}
            disabled={form.otpStep === "sending"}
            className="shrink-0 px-3 py-3 text-[11px] font-semibold rounded-xl transition-all
              bg-[#25D366] hover:bg-[#20BD5A] text-white disabled:opacity-50 whitespace-nowrap"
          >
            {form.otpStep === "sending" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              "Vérifier"
            )}
          </button>
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
          Clique sur &quot;Vérifier&quot; pour recevoir un code WhatsApp.
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
        <FieldStatus ok={true} msg="Numéro WhatsApp vérifié !" />
      )}
    </div>
  );
}
