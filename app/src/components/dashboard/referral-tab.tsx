"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  Copy,
  Gift,
  Link2,
  Loader2,
  MessageCircle,
  Share2,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ReferralData {
  referral_code: string;
  referral_url: string;
  total_referrals: number;
  converted_referrals: number;
  credit_balance: number;
}

export function ReferralTab() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    async function fetchReferral() {
      try {
        const res = await fetch("/api/dashboard/referral");
        if (!res.ok) throw new Error("Erreur chargement");
        const json = await res.json();
        setData(json);
      } catch {
        toast.error("Impossible de charger les informations de parrainage");
      } finally {
        setLoading(false);
      }
    }
    fetchReferral();
  }, []);

  async function copyCode() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.referral_code);
      setCodeCopied(true);
      toast.success("Code de parrainage copie !");
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le code");
    }
  }

  async function copyLink() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.referral_url);
      setLinkCopied(true);
      toast.success("Lien de parrainage copie !");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  }

  function shareWhatsApp() {
    if (!data) return;
    const text = encodeURIComponent(
      `Rejoins ivoire.io, la plateforme des developpeurs et startups ivoiriens ! Utilise mon lien de parrainage pour t'inscrire : ${data.referral_url}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Impossible de charger les donnees de parrainage. Veuillez reessayer.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Parrainage</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Invitez vos amis et gagnez des credits
        </p>
      </div>

      {/* Credit balance */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "var(--color-orange)", color: "#fff" }}
            >
              <Wallet className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Vos credits gagnes</p>
              <p className="text-3xl font-bold">
                {data.credit_balance.toLocaleString("fr-FR")}{" "}
                <span className="text-base font-medium text-muted-foreground">
                  FCFA
                </span>
              </p>
            </div>
            <Sparkles className="w-6 h-6 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Referral code */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Gift className="w-4 h-4" style={{ color: "var(--color-orange)" }} />
            Votre code de parrainage
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div
            className="flex items-center justify-between rounded-lg p-4"
            style={{ background: "var(--color-surface)" }}
          >
            <span className="text-2xl font-bold font-mono tracking-widest">
              {data.referral_code}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={copyCode}
              className="shrink-0"
            >
              {codeCopied ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-green-500" />
                  Copie
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" />
                  Copier
                </>
              )}
            </Button>
          </div>

          {/* Referral link */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground font-medium">
              Lien de parrainage
            </label>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 rounded-lg px-3 py-2 text-sm font-mono truncate"
                style={{ background: "var(--color-surface)" }}
              >
                {data.referral_url}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyLink}
                className="shrink-0"
              >
                {linkCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "var(--color-orange)", color: "#fff" }}
            >
              <Users className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold">{data.total_referrals}</span>
            <span className="text-xs text-muted-foreground text-center">
              Total filleuls
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "#22c55e20", color: "#22c55e" }}
            >
              <Check className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold">{data.converted_referrals}</span>
            <span className="text-xs text-muted-foreground text-center">
              Convertis
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center gap-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "#f59e0b20", color: "#f59e0b" }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold">
              {data.credit_balance.toLocaleString("fr-FR")}
            </span>
            <span className="text-xs text-muted-foreground text-center">
              Credits gagnes (FCFA)
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Share buttons */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Share2 className="w-4 h-4" style={{ color: "var(--color-orange)" }} />
            Partager
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={copyLink}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Copier le lien
          </Button>
          <Button
            className="flex-1"
            onClick={shareWhatsApp}
            style={{ background: "#25D366", color: "#fff" }}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Partager sur WhatsApp
          </Button>
        </CardContent>
      </Card>

      {/* Reward system explanation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Gift className="w-4 h-4" style={{ color: "var(--color-orange)" }} />
            Comment ca marche ?
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Parrainez vos amis developpeurs et startups. Quand ils souscrivent a
            un plan payant, vous recevez des credits utilisables pour votre
            propre abonnement.
          </p>

          <div className="flex flex-col gap-3">
            <div
              className="flex items-center gap-4 rounded-lg p-4"
              style={{ background: "var(--color-surface)" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--color-orange)", color: "#fff" }}
              >
                1
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Parrainez un Starter
                </p>
                <p className="text-xs text-muted-foreground">
                  Votre filleul souscrit au plan Starter (5 000 FCFA/mois)
                </p>
              </div>
              <span className="text-sm font-bold" style={{ color: "#22c55e" }}>
                +1 000 FCFA
              </span>
            </div>

            <div
              className="flex items-center gap-4 rounded-lg p-4"
              style={{ background: "var(--color-surface)" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--color-orange)", color: "#fff" }}
              >
                2
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Parrainez un Pro
                </p>
                <p className="text-xs text-muted-foreground">
                  Votre filleul souscrit au plan Pro (35 000 FCFA/an)
                </p>
              </div>
              <span className="text-sm font-bold" style={{ color: "#22c55e" }}>
                +5 000 FCFA
              </span>
            </div>
          </div>

          <div
            className="rounded-lg p-3 text-sm"
            style={{
              background: "color-mix(in srgb, var(--color-orange) 10%, transparent)",
            }}
          >
            <p className="font-medium mb-1" style={{ color: "var(--color-orange)" }}>
              Astuce
            </p>
            <p className="text-muted-foreground text-xs">
              Les credits accumules peuvent etre utilises pour payer votre propre
              abonnement. Parrainez 5 amis Starter et obtenez un mois de Starter
              gratuit !
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
