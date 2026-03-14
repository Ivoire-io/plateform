"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, TrendingUp } from "lucide-react";

const PLANS = [
  { name: "Dev Premium", subscribers: 23, unit_price: "3 000 FCFA", total: "69 000 F" },
  { name: "Startup Premium", subscribers: 12, unit_price: "5 000 FCFA", total: "60 000 F" },
  { name: "Enterprise", subscribers: 12, unit_price: "20 000 FCFA", total: "240 000 F" },
];

const TRANSACTIONS = [
  { date: "14/03", name: "Acme Corp", plan: "Enterprise", amount: "20 000 F", status: "paid" },
  { date: "13/03", name: "ulrich@mail.ci", plan: "Dev Premium", amount: "3 000 F", status: "paid" },
  { date: "12/03", name: "TechCI", plan: "Startup Prem.", amount: "5 000 F", status: "paid" },
  { date: "10/03", name: "fatou@mail.ci", plan: "Dev Premium", amount: "3 000 F", status: "failed" },
];

export function AdminSubscriptionsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Abonnements & Revenus</h2>

      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "MRR", value: "$2 400", sub: "↑ +18%", color: "var(--color-orange)" },
          { label: "ARR projeté", value: "$28 800", sub: "", color: "#10b981" },
          { label: "Abonnés actifs", value: "47", sub: "", color: "#3b82f6" },
        ].map((m) => (
          <Card key={m.label} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 shrink-0" style={{ color: m.color }} />
              <div>
                <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
                {m.sub && <div className="text-xs text-green-400 mt-0.5">{m.sub}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Détail par plan */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Détail par Plan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                <th className="text-left p-3 pl-4">Plan</th>
                <th className="text-left p-3">Abonnés</th>
                <th className="text-left p-3">Prix unit.</th>
                <th className="text-left p-3">Total/mois</th>
              </tr>
            </thead>
            <tbody>
              {PLANS.map((p) => (
                <tr key={p.name} className="border-b border-border/50">
                  <td className="p-3 pl-4 font-medium">{p.name}</td>
                  <td className="p-3 text-blue-400 font-semibold">{p.subscribers}</td>
                  <td className="p-3 text-xs text-muted-foreground">{p.unit_price}</td>
                  <td className="p-3 text-green-400 font-medium">{p.total}</td>
                </tr>
              ))}
              <tr className="bg-white/3">
                <td className="p-3 pl-4 font-bold">TOTAL</td>
                <td className="p-3 font-bold text-blue-400">47</td>
                <td className="p-3" />
                <td className="p-3 font-bold" style={{ color: "var(--color-orange)" }}>$2 400</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Dernières transactions */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Dernières Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                <th className="text-left p-3 pl-4">Date</th>
                <th className="text-left p-3">Utilisateur</th>
                <th className="text-left p-3">Plan</th>
                <th className="text-left p-3">Montant</th>
                <th className="text-left p-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((t, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-white/2">
                  <td className="p-3 pl-4 text-xs text-muted-foreground">{t.date}</td>
                  <td className="p-3 text-sm font-medium">{t.name}</td>
                  <td className="p-3 text-xs text-muted-foreground">{t.plan}</td>
                  <td className="p-3 text-sm font-medium" style={{ color: "var(--color-orange)" }}>{t.amount}</td>
                  <td className="p-3">
                    {t.status === "paid"
                      ? <Badge className="text-xs bg-green-500/15 text-green-400 border-green-500/30">✅ Payé</Badge>
                      : <Badge className="text-xs bg-yellow-500/15 text-yellow-400 border-yellow-500/30">⚠️ Échec</Badge>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Churn */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Churn ce mois</div>
            <div className="text-xs text-muted-foreground mt-0.5">Résiliations : 2 · Taux de churn : 4.2%</div>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export financier
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
