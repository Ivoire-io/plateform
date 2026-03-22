"use client";

import { Check, CheckCircle2, Loader2, Phone, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PhoneVerificationProps {
  profileId: string;
  verified?: boolean;
  currentPhone?: string | null;
}

type Step = "phone" | "otp" | "success";

export function PhoneVerification({
  profileId,
  verified = false,
  currentPhone = null,
}: PhoneVerificationProps) {
  const [step, setStep] = useState<Step>(verified ? "success" : "phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [fullPhoneNumber, setFullPhoneNumber] = useState(currentPhone ?? "");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Display phone for success state
  const displayPhone = currentPhone
    ? currentPhone.replace("+225", "")
    : phone;

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [countdown]);

  // Format countdown
  const formatCountdown = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Validate Ivorian phone format
  const isPhoneValid = useCallback((value: string): boolean => {
    const digits = value.replace(/\s/g, "");
    return /^(01|05|07)\d{8}$/.test(digits);
  }, []);

  // Send OTP
  const handleSendOtp = async () => {
    const digits = phone.replace(/\s/g, "");
    if (!isPhoneValid(phone)) {
      setErrorMsg("Numero invalide. 10 chiffres commencant par 01, 05 ou 07.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const fullPhone = `+225${digits}`;
      setFullPhoneNumber(fullPhone);

      const res = await fetch("/api/dashboard/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: fullPhone }),
      });

      const json = await res.json();

      if (json.success) {
        setStep("otp");
        setCountdown(json.expires_in || 600);
        setOtpDigits(["", "", "", "", "", ""]);
        toast.success("Code envoye par WhatsApp !");
        // Focus first OTP input
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setErrorMsg(json.error || "Erreur lors de l'envoi du code.");
      }
    } catch {
      setErrorMsg("Erreur de connexion. Reessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (countdown > 0) return;
    setOtpDigits(["", "", "", "", "", ""]);
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/dashboard/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: fullPhoneNumber }),
      });

      const json = await res.json();

      if (json.success) {
        setCountdown(json.expires_in || 600);
        toast.success("Nouveau code envoye !");
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setErrorMsg(json.error || "Erreur lors du renvoi.");
      }
    } catch {
      setErrorMsg("Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setErrorMsg("");

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setOtpDigits(newDigits);

    // Focus the input after the last pasted digit
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setErrorMsg("Entrez les 6 chiffres du code.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/dashboard/phone/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: fullPhoneNumber,
          otp_code: code,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setStep("success");
        toast.success("Numero verifie avec succes !");
      } else {
        setErrorMsg(json.error || "Code incorrect.");
      }
    } catch {
      setErrorMsg("Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  // Ignore profileId linting warning; it's used for component identity
  void profileId;

  // Success state
  if (step === "success") {
    return (
      <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10">
            <CheckCircle2 size={20} className="text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-400">
              Numero verifie
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              +225 {displayPhone}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Phone input step
  if (step === "phone") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/10">
            <Phone size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Verification WhatsApp
            </p>
            <p className="text-xs text-muted-foreground">
              Recevez un code sur votre WhatsApp
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Numero de telephone
          </label>
          <div className="flex items-center bg-muted border border-border rounded-xl overflow-hidden focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
            <span className="shrink-0 pl-3.5 pr-2.5 text-sm border-r border-border/60 py-3 flex items-center gap-1.5">
              <span className="text-muted-foreground text-xs font-mono">+225</span>
            </span>
            <input
              type="tel"
              placeholder="07 00 00 00 00"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/[^0-9 ]/g, ""));
                setErrorMsg("");
              }}
              className="flex-1 bg-transparent px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none font-mono"
              maxLength={14}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-400/5 border border-red-400/20 text-red-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleSendOtp}
          disabled={isLoading || !isPhoneValid(phone)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Phone size={16} />
              Verifier
            </>
          )}
        </button>
      </div>
    );
  }

  // OTP input step
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 space-y-5">
      <div className="text-center">
        <p className="text-sm font-medium text-foreground mb-1">
          Code de verification
        </p>
        <p className="text-xs text-muted-foreground">
          Entrez le code envoye au{" "}
          <span className="font-mono text-orange-500">
            +225 {phone}
          </span>
        </p>
      </div>

      {/* 6-digit OTP inputs */}
      <div className="flex justify-center gap-2.5">
        {otpDigits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            onPaste={index === 0 ? handleOtpPaste : undefined}
            className="w-11 h-13 text-center text-lg font-mono font-bold bg-muted border border-border rounded-xl text-foreground focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
          />
        ))}
      </div>

      {/* Countdown */}
      {countdown > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Expire dans{" "}
          <span className="font-mono text-orange-500">
            {formatCountdown(countdown)}
          </span>
        </p>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-400/5 border border-red-400/20 text-red-400 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Verify button */}
      <button
        onClick={handleVerifyOtp}
        disabled={isLoading || otpDigits.join("").length !== 6}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Verification...
          </>
        ) : (
          <>
            <Check size={16} />
            Confirmer
          </>
        )}
      </button>

      {/* Resend / Back */}
      <div className="flex items-center justify-between text-xs">
        <button
          onClick={() => {
            setStep("phone");
            setErrorMsg("");
            setOtpDigits(["", "", "", "", "", ""]);
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          Changer de numero
        </button>

        {countdown > 0 ? (
          <span className="text-muted-foreground/60">
            Renvoyer dans {formatCountdown(countdown)}
          </span>
        ) : (
          <button
            onClick={handleResend}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-orange-500 hover:text-orange-400 transition-colors disabled:opacity-50"
          >
            <RotateCcw size={12} />
            Renvoyer
          </button>
        )}
      </div>
    </div>
  );
}
