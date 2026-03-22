"use client";

import { PhoneOtpInline } from "@/components/auth/phone-otp-inline";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginForm() {
  const [phoneLoginStatus, setPhoneLoginStatus] = useState<"idle" | "loading" | "error">("idle");
  const [phoneLoginError, setPhoneLoginError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const router = useRouter();

  // Capture referral code from URL if present
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("ivoire_ref", ref);
    }
  }, [searchParams]);

  // Handle WhatsApp OTP verified → phone login
  async function handlePhoneVerified(data: { phone: string; session_token: string }) {
    setPhoneLoginStatus("loading");
    setPhoneLoginError(null);

    try {
      const res = await fetch("/api/auth/phone-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: data.phone,
          session_token: data.session_token,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        setPhoneLoginError(result.error || "Erreur de connexion.");
        setPhoneLoginStatus("error");
        return;
      }

      if (result.action === "login" && result.access_token && result.refresh_token) {
        // Existing user → set Supabase session directly
        const supabase = createClient();
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });

        if (sessionError) {
          setPhoneLoginError("Erreur lors de la connexion. Reessayez.");
          setPhoneLoginStatus("error");
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } else if (result.action === "register") {
        // New user → redirect to registration with phone info
        const phoneDigits = data.phone.replace("+225", "");
        router.push(
          `/rejoindre?phone=${encodeURIComponent(phoneDigits)}&session_token=${encodeURIComponent(data.session_token)}`
        );
      }
    } catch {
      setPhoneLoginError("Erreur reseau. Reessayez.");
      setPhoneLoginStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-0.5">
            <span className="text-2xl font-bold text-white">ivoire</span>
            <span className="text-2xl font-bold text-orange">.io</span>
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          <h1 className="text-xl font-bold mb-1">Connexion</h1>
          <p className="text-muted text-sm mb-6">
            Connectez-vous avec votre numero WhatsApp.
          </p>

          {/* Auth error banners */}
          {authError === "account_suspended" && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm" role="alert">
              Votre compte a ete suspendu. Contactez l&apos;equipe ivoire.io pour plus d&apos;informations.
            </div>
          )}
          {authError && authError !== "account_suspended" && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm" role="alert">
              Session expiree ou invalide. Reconnectez-vous.
            </div>
          )}

          {/* WhatsApp OTP Login */}
          <PhoneOtpInline purpose="login" onVerified={handlePhoneVerified} />

          {phoneLoginStatus === "loading" && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted">
              <Loader2 size={16} className="animate-spin" />
              Connexion en cours...
            </div>
          )}

          {phoneLoginError && (
            <p className="mt-3 text-red-400 text-sm text-center" role="alert">
              {phoneLoginError}
            </p>
          )}

          <p className="text-center text-muted/60 text-xs mt-6">
            Pas encore de compte ?{" "}
            <Link href="/rejoindre" className="text-orange hover:underline">
              Rejoindre la communaute &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
