"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export type SlugStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "reserved"
  | "invalid"
  | "too_short";

export type OtpStep = "idle" | "sending" | "sent" | "verifying" | "verified";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WHATSAPP_VALID = (v: string) => {
  const digits = v.replace(/\s/g, "");
  return /^(01|05|07)\d{8}$/.test(digits);
};

export function useRegistrationForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappTouched, setWhatsappTouched] = useState(false);
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Pre-fill slug from query param
  useEffect(() => {
    const slugParam = searchParams.get("slug");
    if (slugParam) handleSlugChange(slugParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Derived validation
  const emailOk = email.length === 0 ? null : EMAIL_REGEX.test(email);
  const whatsappDigits = whatsapp.replace(/\s/g, "");
  const whatsappOk =
    whatsappDigits.length === 0
      ? null
      : /^(01|05|07)\d{8}$/.test(whatsappDigits);

  const checkSlug = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setSlugStatus(value.length > 0 ? "too_short" : "idle");
      return;
    }
    setSlugStatus("checking");
    try {
      const res = await fetch(
        `/api/check-slug?slug=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      if (data.available === true) setSlugStatus("available");
      else if (data.reason === "reserved") setSlugStatus("reserved");
      else if (data.reason === "invalid_format") setSlugStatus("invalid");
      else setSlugStatus("taken");
    } catch {
      setSlugStatus("idle");
    }
  }, []);

  const handleSlugChange = useCallback(
    (raw: string) => {
      const formatted = raw
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-{2,}/g, "-")
        .slice(0, 30);
      setSlug(formatted);
      setSlugStatus("idle");
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => checkSlug(formatted), 400);
    },
    [checkSlug]
  );

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

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

  // isBaseValid: if phone is verified, email is optional
  const isBaseValid = isPhoneVerified
    ? fullName.trim().length >= 2 &&
      WHATSAPP_VALID(whatsapp) &&
      slugStatus === "available" &&
      (email.length === 0 || EMAIL_REGEX.test(email))
    : fullName.trim().length >= 2 &&
      EMAIL_REGEX.test(email) &&
      WHATSAPP_VALID(whatsapp) &&
      slugStatus === "available";

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    emailTouched,
    setEmailTouched,
    emailOk,
    whatsapp,
    setWhatsapp,
    whatsappTouched,
    setWhatsappTouched,
    whatsappOk,
    whatsappDigits,
    slug,
    slugStatus,
    handleSlugChange,
    isBaseValid,
    isPhoneVerified,
    sessionToken,
    // OTP inline
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
