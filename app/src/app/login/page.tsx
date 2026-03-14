"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    const supabase = createClient();
    const { error: sbError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (sbError) {
      setError(sbError.message);
      setStatus("error");
    } else {
      setStatus("sent");
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

        {status === "sent" ? (
          <div className="flex flex-col items-center text-center gap-5 p-8 bg-surface border border-green/20 rounded-2xl">
            <div className="w-14 h-14 rounded-full bg-green/10 flex items-center justify-center">
              <CheckCircle size={28} className="text-green" />
            </div>
            <div>
              <p className="font-semibold text-lg">Vérifiez votre email !</p>
              <p className="text-muted text-sm mt-2 leading-relaxed">
                Un lien de connexion vient d&apos;être envoyé à<br />
                <span className="text-white font-medium">{email}</span>
              </p>
            </div>
            <button
              onClick={() => setStatus("idle")}
              className="text-orange text-sm hover:underline focus:outline-none focus-visible:underline"
            >
              Changer d&apos;email
            </button>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl p-8">
            <h1 className="text-xl font-bold mb-1">Connexion</h1>
            <p className="text-muted text-sm mb-6">
              Entrez votre email pour vous connecter à votre dashboard.
            </p>

            {authError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm" role="alert">
                Lien expiré ou invalide. Réessayez.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-muted/70">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-background"
                />
              </div>

              {status === "error" && error && (
                <p className="text-red-400 text-sm" role="alert">{error}</p>
              )}

              <Button type="submit" size="default" className="w-full gap-2" disabled={status === "loading"}>
                <Mail size={16} />
                {status === "loading" ? "Envoi en cours…" : "Recevoir le lien de connexion"}
              </Button>
            </form>

            <p className="text-center text-muted/60 text-xs mt-6">
              Pas encore de compte ?{" "}
              <Link href="/#waitlist" className="text-orange hover:underline">
                Rejoindre la liste d&apos;attente →
              </Link>
            </p>
          </div>
        )}
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
