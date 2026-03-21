"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Loader2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Referral {
  id: string;
  referrer_name: string;
  referee_name: string;
  code: string;
  status: string;
  reward_amount: number;
  created_at: string;
}

interface ReferralsResponse {
  referrals: Referral[];
  stats: {
    total_referrals: number;
    converted: number;
    total_rewards: number;
  };
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30", label: "En attente" },
  converted: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", label: "Converti" },
  rewarded: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30", label: "Recompense" },
};

export function AdminReferralsTab() {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState({ total_referrals: 0, converted: 0, total_rewards: 0 });

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/referrals");
      if (!res.ok) throw new Error();
      const data: ReferralsResponse = await res.json();
      setReferrals(data.referrals ?? []);
      setStats(data.stats ?? { total_referrals: 0, converted: 0, total_rewards: 0 });
    } catch {
      toast.error("Erreur lors du chargement des parrainages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Parrainages</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Total parrainages", value: stats.total_referrals.toLocaleString("fr-FR"), color: "#3b82f6" },
          { icon: Users, label: "Convertis", value: stats.converted.toLocaleString("fr-FR"), color: "#8b5cf6" },
          { icon: DollarSign, label: "Total recompenses", value: `${stats.total_rewards.toLocaleString("fr-FR")} FCFA`, color: "#10b981" },
        ].map((m) => (
          <Card key={m.label} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <m.icon className="h-4 w-4" style={{ color: m.color }} />
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table des parrainages */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Liste des parrainages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left p-3 pl-4">Parrain</th>
                  <th className="text-left p-3">Filleul</th>
                  <th className="text-left p-3">Code</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Recompense</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">Aucun parrainage trouve</td>
                  </tr>
                ) : (
                  referrals.map((referral) => {
                    const statusStyle = STATUS_STYLES[referral.status] ?? STATUS_STYLES.pending;
                    return (
                      <tr key={referral.id} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                        <td className="p-3 pl-4 font-medium">{referral.referrer_name}</td>
                        <td className="p-3 text-sm">{referral.referee_name}</td>
                        <td className="p-3">
                          <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--color-border)" }}>
                            {referral.code}
                          </code>
                        </td>
                        <td className="p-3">
                          <Badge className={`text-xs ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            {statusStyle.label}
                          </Badge>
                        </td>
                        <td className="p-3 font-semibold" style={{ color: "var(--color-orange)" }}>
                          {referral.reward_amount > 0 ? `${referral.reward_amount.toLocaleString("fr-FR")} FCFA` : "--"}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {new Date(referral.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
