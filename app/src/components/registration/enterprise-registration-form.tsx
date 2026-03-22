"use client";

import { createClient } from "@/lib/supabase/client";
import { Briefcase, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { BaseFields } from "./base-fields";
import { useRegistrationForm } from "./use-registration-form";

type EnterpriseRegistrationFormProps = {
  compact?: boolean;
  showHeader?: boolean;
};

function EnterpriseFormInner({ compact = false, showHeader = true }: EnterpriseRegistrationFormProps) {
  const form = useRegistrationForm();
  const router = useRouter();
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const hasAutoSubmitted = useRef(false);

  // Auto-submit when phone is verified
  useEffect(() => {
    if (form.isPhoneVerified && form.sessionToken && !hasAutoSubmitted.current && submitStatus === "idle") {
      hasAutoSubmitted.current = true;
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.isPhoneVerified, form.sessionToken]);

  const handleSubmit = async () => {
    setSubmitStatus("loading");
    setErrorMsg("");

    try {
      const referralCode = localStorage.getItem("ivoire_ref") || null;
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp:
            form.whatsappDigits.length > 0
              ? `+225${form.whatsappDigits}`
              : "",
          type: "enterprise",
          referral_code: referralCode,
          session_token: form.sessionToken || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || "Une erreur est survenue. Réessaie.");
        setSubmitStatus("error");
        hasAutoSubmitted.current = false;
        return;
      }

      // Phone-verified users get tokens → set session and redirect to dashboard
      if (json.access_token && json.refresh_token) {
        const supabase = createClient();
        await supabase.auth.setSession({
          access_token: json.access_token,
          refresh_token: json.refresh_token,
        });
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Fallback (shouldn't happen for phone-verified)
      setSubmitStatus("idle");
    } catch {
      setErrorMsg("Erreur de connexion. Réessaie.");
      setSubmitStatus("error");
      hasAutoSubmitted.current = false;
    }
  };

  return (
    <section className={`px-4 relative overflow-hidden ${compact ? "py-4 md:py-6" : "py-24"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--color-orange)_0%,_transparent_60%)] opacity-[0.04]" />
      <div className="relative max-w-md mx-auto">
        {showHeader && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange/20 bg-orange/5 text-orange text-sm mb-6">
              <Briefcase size={14} />
              Entreprise
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Recrutez les meilleurs talents
            </h1>
            <p className="text-muted max-w-sm mx-auto">
              Vérifie ton WhatsApp pour créer ton compte en 30 secondes.
            </p>
          </div>
        )}

        <div
          className={`bg-surface/60 backdrop-blur-sm border border-border rounded-3xl ${compact ? "p-4 md:p-5" : "p-8 md:p-10"} space-y-6`}
        >
          <BaseFields form={form} />

          {/* Loading state during auto-submit */}
          {submitStatus === "loading" && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted">
              <Loader2 size={16} className="animate-spin text-orange" />
              Création de ton compte...
            </div>
          )}

          {/* Error */}
          {submitStatus === "error" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-400/5 border border-red-400/20 text-red-400 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {errorMsg}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange text-white text-sm font-semibold hover:bg-orange-hover transition-all"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function EnterpriseRegistrationForm(props: EnterpriseRegistrationFormProps) {
  return (
    <Suspense>
      <EnterpriseFormInner {...props} />
    </Suspense>
  );
}
