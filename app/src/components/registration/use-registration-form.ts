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

  const isBaseValid =
    fullName.trim().length >= 2 &&
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
  };
}
