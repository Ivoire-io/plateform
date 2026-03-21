"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  DollarSign,
  Loader2,
  Users,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Period = "7" | "30" | "90";

interface ProviderCost {
  name: string;
  cost: number;
  requests: number;
}

interface TaskCost {
  task: string;
  requests: number;
  total_cost: number;
  avg_cost: number;
}

interface TopUser {
  user_name: string;
  requests: number;
  total_cost: number;
  plan: string;
}

interface AIUsageData {
  total_cost: number;
  total_requests: number;
  avg_cost_per_request: number;
  cache_hit_rate: number;
  providers: ProviderCost[];
  tasks: TaskCost[];
  top_users: TopUser[];
}

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "Gratuit", color: "#a0a0a0" },
  premium: { label: "Premium", color: "#eab308" },
  enterprise: { label: "Enterprise", color: "#8b5cf6" },
};

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: "#10b981",
  Anthropic: "#8b5cf6",
  "crun.ai": "#3b82f6",
};

export function AdminAIUsageTab() {
  const [period, setPeriod] = useState<Period>("30");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AIUsageData | null>(null);

  const fetchData = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ai-usage?period=${p}`);
      if (!res.ok) throw new Error();
      const json: AIUsageData = await res.json();
      setData(json);
    } catch {
      toast.error("Erreur lors du chargement des donnees IA");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [fetchData, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-sm text-muted-foreground">
        Aucune donnee disponible
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold">Utilisation IA & Couts</h2>
        <div className="flex gap-1">
          {([
            { value: "7" as Period, label: "7j" },
            { value: "30" as Period, label: "30j" },
            { value: "90" as Period, label: "90j" },
          ]).map((p) => (
            <Button
              key={p.value}
              size="sm"
              variant={period === p.value ? "default" : "outline"}
              onClick={() => setPeriod(p.value)}
              style={period === p.value ? { background: "var(--color-orange)" } : {}}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Total cout ce mois", value: `${data.total_cost.toLocaleString("fr-FR")} FCFA`, color: "#ef4444" },
          { icon: Zap, label: "Total requetes", value: data.total_requests.toLocaleString("fr-FR"), color: "#3b82f6" },
          { icon: BarChart3, label: "Cout moyen/requete", value: `${data.avg_cost_per_request.toLocaleString("fr-FR")} FCFA`, color: "#eab308" },
          { icon: Zap, label: "Requetes en cache", value: `${data.cache_hit_rate.toFixed(1)}%`, color: "#10b981" },
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

      {/* Cout par provider */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Cout par provider</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data.providers ?? []).map((provider) => {
            const color = PROVIDER_COLORS[provider.name] ?? "#a0a0a0";
            return (
              <Card key={provider.name} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-3 w-3 rounded-full" style={{ background: color }} />
                    <span className="font-semibold text-sm">{provider.name}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Cout</span>
                      <span className="font-semibold" style={{ color }}>{provider.cost.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Requetes</span>
                      <span className="font-semibold">{provider.requests.toLocaleString("fr-FR")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Cout par tache */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Cout par tache</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left p-3 pl-4">Tache</th>
                  <th className="text-left p-3">Requetes</th>
                  <th className="text-left p-3">Cout total</th>
                  <th className="text-left p-3">Cout moyen</th>
                </tr>
              </thead>
              <tbody>
                {(data.tasks ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">Aucune donnee</td>
                  </tr>
                ) : (
                  (data.tasks ?? []).map((task) => (
                    <tr key={task.task} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                      <td className="p-3 pl-4 font-medium">{task.task}</td>
                      <td className="p-3 text-muted-foreground">{task.requests.toLocaleString("fr-FR")}</td>
                      <td className="p-3 font-semibold" style={{ color: "var(--color-orange)" }}>
                        {task.total_cost.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {task.avg_cost.toLocaleString("fr-FR")} FCFA
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top 10 utilisateurs */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" style={{ color: "var(--color-orange)" }} />
            Top 10 utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left p-3 pl-4">#</th>
                  <th className="text-left p-3">Utilisateur</th>
                  <th className="text-left p-3">Requetes</th>
                  <th className="text-left p-3">Cout total</th>
                  <th className="text-left p-3">Plan</th>
                </tr>
              </thead>
              <tbody>
                {(data.top_users ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">Aucune donnee</td>
                  </tr>
                ) : (
                  (data.top_users ?? []).map((user, index) => {
                    const planStyle = PLAN_LABELS[user.plan] ?? PLAN_LABELS.free;
                    return (
                      <tr key={user.user_name} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                        <td className="p-3 pl-4 text-xs text-muted-foreground">{index + 1}</td>
                        <td className="p-3 font-medium">{user.user_name}</td>
                        <td className="p-3 text-muted-foreground">{user.requests.toLocaleString("fr-FR")}</td>
                        <td className="p-3 font-semibold" style={{ color: "var(--color-orange)" }}>
                          {user.total_cost.toLocaleString("fr-FR")} FCFA
                        </td>
                        <td className="p-3">
                          <Badge
                            className="text-xs"
                            style={{
                              background: `color-mix(in srgb,${planStyle.color} 15%,transparent)`,
                              color: planStyle.color,
                              border: `1px solid color-mix(in srgb,${planStyle.color} 30%,transparent)`,
                            }}
                          >
                            {planStyle.label}
                          </Badge>
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
