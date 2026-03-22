"use client";

import { CheckCircle, Loader2, Phone, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PhoneOtpInlineProps {
  purpose: "registration" | "login";
  onVerified: (data: { phone: string; session_token: string }) => void;
  defaultPhone?: string;
}

type Step = "phone" | "otp" | "verified";

export function PhoneOtpInline({ purpose, onVerified, defaultPhone }: PhoneOtpInlineProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState(defaultPhone || "");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Phone validation (Ivorian 10-digit format)
  const phoneDigits = phone.replace(/\s/g, "");
  const phoneOk = phoneDigits.length === 0 ? null : /^(01|05|07)\d{8}$/.test(phoneDigits);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Send OTP
  const handleSendOtp = useCallback(async () => {
    if (!phoneOk) return;
    setStatus("loading");
    setError(null);

    try {
      const fullPhone = `+225${phoneDigits}`;
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: fullPhone, purpose }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Erreur lors de l'envoi du code.");
        setStatus("error");
        return;
      }

      setSessionToken(data.session_token);
      setStep("otp");
      setCountdown(60);
      setStatus("idle");
      setOtp(["", "", "", "", "", ""]);
      setRemainingAttempts(5);
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Erreur reseau. Reessayez.");
      setStatus("error");
    }
  }, [phoneOk, phoneDigits, purpose]);

  // Handle OTP input
  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);

      // Auto-advance to next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all 6 digits are filled
      const fullCode = newOtp.join("");
      if (fullCode.length === 6) {
        verifyOtp(fullCode);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [otp]
  );

  // Handle paste
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      if (pasted.length === 0) return;
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || "";
      }
      setOtp(newOtp);
      if (pasted.length === 6) {
        verifyOtp(pasted);
      } else {
        otpRefs.current[pasted.length]?.focus();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [otp]
  );

  // Handle backspace
  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  // Verify OTP
  const verifyOtp = async (code: string) => {
    setStatus("loading");
    setError(null);

    try {
      const fullPhone = `+225${phoneDigits}`;
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: fullPhone,
          otp_code: code,
          session_token: sessionToken,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Code incorrect.");
        if (data.remaining_attempts !== undefined) {
          setRemainingAttempts(data.remaining_attempts);
        }
        setStatus("error");
        // Clear OTP inputs
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
        return;
      }

      setStep("verified");
      setStatus("idle");
      onVerified({ phone: fullPhone, session_token: sessionToken });
    } catch {
      setError("Erreur reseau. Reessayez.");
      setStatus("error");
    }
  };

  // ─── Step: Phone Input ─────────────────────────────────────────
  if (step === "phone") {
    return (
      <div className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted/70">
            Numero WhatsApp
          </label>
          <div
            className={`flex items-center bg-white/[0.02] border rounded-xl overflow-hidden transition-all hover:bg-white/[0.04]
              ${phoneTouched && phoneOk === false
                ? "border-red-400/60 ring-4 ring-red-400/10"
                : phoneTouched && phoneOk === true
                  ? "border-green-400/60 ring-4 ring-green-400/10"
                  : "border-white/10 focus-within:border-orange focus-within:ring-4 focus-within:ring-orange/10"
              }`}
          >
            <span className="shrink-0 pl-3 pr-2 text-sm border-r border-white/10 py-3 flex items-center gap-1.5">
              <Phone size={13} className="text-muted/50" />
              <span className="text-muted/60 text-xs font-mono">+225</span>
            </span>
            <input
              type="tel"
              placeholder="07 00 00 00 00"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/[^0-9 ]/g, ""));
                setPhoneTouched(true);
              }}
              onBlur={() => setPhoneTouched(true)}
              className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder:text-muted/50 focus:outline-none"
              maxLength={14}
            />
          </div>
          {phoneTouched && phoneOk === false && (
            <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
              10 chiffres, commencant par 01, 05 ou 07.
            </p>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm" role="alert">{error}</p>
        )}

        <button
          type="button"
          onClick={handleSendOtp}
          disabled={!phoneOk || status === "loading"}
          className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all"
        >
          {status === "loading" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Phone size={16} />
          )}
          {status === "loading" ? "Envoi en cours..." : "Recevoir le code par WhatsApp"}
        </button>
      </div>
    );
  }

  // ─── Step: OTP Input ───────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <p className="text-sm text-muted">
            Code envoye au <span className="text-white font-medium">+225 {phone}</span>
          </p>
        </div>

        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { otpRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-11 h-12 text-center text-lg font-bold bg-white/[0.02] border rounded-lg text-white focus:outline-none transition-all
                ${error
                  ? "border-red-400/60 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                  : "border-white/10 focus:border-orange focus:ring-2 focus:ring-orange/20"
                }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center" role="alert">{error}</p>
        )}

        {status === "loading" && (
          <div className="flex justify-center">
            <Loader2 size={20} className="animate-spin text-orange" />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            {remainingAttempts < 5 && `${remainingAttempts} tentative${remainingAttempts > 1 ? "s" : ""} restante${remainingAttempts > 1 ? "s" : ""}`}
          </span>
          <button
            type="button"
            onClick={() => {
              if (countdown > 0) return;
              handleSendOtp();
            }}
            disabled={countdown > 0 || status === "loading"}
            className="flex items-center gap-1 text-orange hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw size={12} />
            {countdown > 0 ? `Renvoyer (${countdown}s)` : "Renvoyer le code"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setStep("phone");
            setError(null);
            setStatus("idle");
          }}
          className="text-muted text-xs hover:underline text-center"
        >
          Changer de numero
        </button>
      </div>
    );
  }

  // ─── Step: Verified ────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
        <CheckCircle size={24} className="text-green-400" />
      </div>
      <p className="text-sm font-medium text-white">Numero verifie !</p>
      <p className="text-xs text-muted">+225 {phone}</p>
    </div>
  );
}
