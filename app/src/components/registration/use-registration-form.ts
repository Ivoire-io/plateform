"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type OtpStep = "idle" | "sending" | "sent" | "verifying" | "verified";

export function useRegistrationForm() {
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappTouched, setWhatsappTouched] = useState(false);
  const searchParams = useSearchParams();

  // ─── Inline OTP state ───
  const [otpStep, setOtpStep] = useState<OtpStep>("idle");
  const [sessionToken, setSessionToken] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpRemainingAttempts, setOtpRemainingAttempts] = useState(5);

  // Phone verified = OTP completed inline OR arrived via URL params
  const phoneParam = searchParams.get("phone");
  const sessionTokenParam = searchParams.get("session_token");
  const fromUrlVerified = !!(phoneParam && sessionTokenParam);
  const isPhoneVerified = otpStep === "verified" || fromUrlVerified;

  // Init from URL params if present
  useEffect(() => {
    if (sessionTokenParam && !sessionToken) setSessionToken(sessionTokenParam);
    if (phoneParam && !whatsapp) {
      setWhatsapp(phoneParam);
      setWhatsappTouched(true);
    }
    if (fromUrlVerified) setOtpStep("verified");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneParam, sessionTokenParam]);

  // Capture referral code
  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam) localStorage.setItem("ivoire_ref", refParam);
  }, [searchParams]);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Derived validation
  const whatsappDigits = whatsapp.replace(/\s/g, "");
  const whatsappOk =
    whatsappDigits.length === 0
      ? null
      : /^(01|05|07)\d{8}$/.test(whatsappDigits);

  // ─── OTP actions ───
  const sendOtp = useCallback(async () => {
    if (!whatsappOk) return;
    setOtpStep("sending");
    setOtpError(null);

    try {
      const fullPhone = `+225${whatsappDigits}`;
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: fullPhone, purpose: "registration" }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setOtpError(data.error || "Erreur lors de l'envoi du code.");
        setOtpStep("idle");
        return;
      }

      setSessionToken(data.session_token);
      setOtpStep("sent");
      setOtpCountdown(60);
      setOtpCode(["", "", "", "", "", ""]);
      setOtpRemainingAttempts(5);
    } catch {
      setOtpError("Erreur reseau. Reessayez.");
      setOtpStep("idle");
    }
  }, [whatsappOk, whatsappDigits]);

  const verifyOtp = useCallback(
    async (code: string) => {
      setOtpStep("verifying");
      setOtpError(null);

      try {
        const fullPhone = `+225${whatsappDigits}`;
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
          setOtpError(data.error || "Code incorrect.");
          if (data.remaining_attempts !== undefined) {
            setOtpRemainingAttempts(data.remaining_attempts);
          }
          setOtpStep("sent");
          setOtpCode(["", "", "", "", "", ""]);
          return;
        }

        setOtpStep("verified");
      } catch {
        setOtpError("Erreur reseau. Reessayez.");
        setOtpStep("sent");
      }
    },
    [whatsappDigits, sessionToken]
  );

  const resetOtp = useCallback(() => {
    setOtpStep("idle");
    setOtpError(null);
    setOtpCode(["", "", "", "", "", ""]);
    setSessionToken("");
  }, []);

  const isBaseValid = isPhoneVerified;

  return {
    whatsapp,
    setWhatsapp,
    whatsappTouched,
    setWhatsappTouched,
    whatsappOk,
    whatsappDigits,
    isBaseValid,
    isPhoneVerified,
    sessionToken,
    otpStep,
    otpCode,
    setOtpCode,
    otpError,
    otpCountdown,
    otpRemainingAttempts,
    sendOtp,
    verifyOtp,
    resetOtp,
  };
}
