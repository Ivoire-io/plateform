"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CreditCard,
  Globe,
  Loader2,
  Save,
  Smartphone,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ManualConfig {
  enabled: boolean;
  bank_name: string;
  account_number: string;
  account_name: string;
  instructions: string;
}

interface PayPalConfig {
  enabled: boolean;
  mode: "sandbox" | "live";
}

interface MobileMoneyConfig {
  enabled: boolean;
  phone_number: string;
}

interface ProvidersConfig {
  manual: ManualConfig;
  paypal: PayPalConfig;
  wave: MobileMoneyConfig;
  orange_money: MobileMoneyConfig;
  moov: MobileMoneyConfig;
}

const DEFAULT_CONFIG: ProvidersConfig = {
  manual: { enabled: false, bank_name: "", account_number: "", account_name: "", instructions: "" },
  paypal: { enabled: false, mode: "sandbox" },
  wave: { enabled: false, phone_number: "" },
  orange_money: { enabled: false, phone_number: "" },
  moov: { enabled: false, phone_number: "" },
};

const MOBILE_PROVIDERS: { key: keyof Pick<ProvidersConfig, "wave" | "orange_money" | "moov">; label: string; color: string; placeholder: string }[] = [
  { key: "wave", label: "Wave", color: "#1DC3E2", placeholder: "Ex: 07 00 00 00 00" },
  { key: "orange_money", label: "Orange Money", color: "#FF6600", placeholder: "Ex: 07 00 00 00 00" },
  { key: "moov", label: "Moov Money", color: "#003DA5", placeholder: "Ex: 01 00 00 00 00" },
];

export function AdminPaymentProvidersTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ProvidersConfig>(DEFAULT_CONFIG);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payment-providers");
      if (!res.ok) throw new Error();
      const data: ProvidersConfig = await res.json();
      setConfig({
        ...DEFAULT_CONFIG,
        ...data,
        wave: { ...DEFAULT_CONFIG.wave, ...(data.wave ?? {}) },
        orange_money: { ...DEFAULT_CONFIG.orange_money, ...(data.orange_money ?? {}) },
        moov: { ...DEFAULT_CONFIG.moov, ...(data.moov ?? {}) },
      });
    } catch {
      toast.error("Erreur lors du chargement de la configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/payment-providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Configuration sauvegardee avec succes");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  function updateManual(field: keyof ManualConfig, value: string | boolean) {
    setConfig((prev) => ({
      ...prev,
      manual: { ...prev.manual, [field]: value },
    }));
  }

  function updatePaypal(field: keyof PayPalConfig, value: string | boolean) {
    setConfig((prev) => ({
      ...prev,
      paypal: { ...prev.paypal, [field]: value },
    }));
  }

  function updateMobile(key: keyof Pick<ProvidersConfig, "wave" | "orange_money" | "moov">, field: keyof MobileMoneyConfig, value: string | boolean) {
    setConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Fournisseurs de Paiement</h2>
        <Button
          className="gap-2"
          style={{ background: "var(--color-orange)" }}
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Sauvegarder
        </Button>
      </div>

      {/* Manuel / Virement bancaire */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" style={{ color: "var(--color-orange)" }} />
              Paiement Manuel / Virement Bancaire
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${config.manual.enabled ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
                {config.manual.enabled ? "Actif" : "Inactif"}
              </Badge>
              <button
                type="button"
                role="switch"
                aria-checked={config.manual.enabled}
                onClick={() => updateManual("enabled", !config.manual.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.manual.enabled ? "" : "bg-gray-600"}`}
                style={config.manual.enabled ? { background: "var(--color-orange)" } : {}}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.manual.enabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Nom de la banque</Label>
              <Input
                className="mt-1"
                placeholder="Ex: BICICI, SIB, SGBCI..."
                value={config.manual.bank_name}
                onChange={(e) => updateManual("bank_name", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Numero de compte</Label>
              <Input
                className="mt-1"
                placeholder="Numero de compte bancaire"
                value={config.manual.account_number}
                onChange={(e) => updateManual("account_number", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Nom du titulaire</Label>
            <Input
              className="mt-1"
              placeholder="Nom complet du titulaire du compte"
              value={config.manual.account_name}
              onChange={(e) => updateManual("account_name", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Instructions de paiement</Label>
            <Textarea
              className="mt-1 text-sm resize-none"
              placeholder="Instructions detaillees pour le paiement par virement..."
              rows={3}
              value={config.manual.instructions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateManual("instructions", e.target.value)}
              style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile Money (Wave, Orange Money, Moov) */}
      {MOBILE_PROVIDERS.map(({ key, label, color, placeholder }) => {
        const provider = config[key];
        return (
          <Card key={key} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Smartphone className="h-4 w-4" style={{ color }} />
                  {label}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${provider.enabled ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
                    {provider.enabled ? "Actif" : "Inactif"}
                  </Badge>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={provider.enabled}
                    onClick={() => updateMobile(key, "enabled", !provider.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${provider.enabled ? "" : "bg-gray-600"}`}
                    style={provider.enabled ? { background: color } : {}}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${provider.enabled ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-xs text-muted-foreground">Numero de telephone</Label>
                <Input
                  className="mt-1"
                  placeholder={placeholder}
                  value={provider.phone_number}
                  onChange={(e) => updateMobile(key, "phone_number", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Ce numero sera affiche aux utilisateurs pour effectuer le paiement.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* PayPal */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4" style={{ color: "#3b82f6" }} />
              PayPal
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${config.paypal.enabled ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
                {config.paypal.enabled ? "Actif" : "Inactif"}
              </Badge>
              <button
                type="button"
                role="switch"
                aria-checked={config.paypal.enabled}
                onClick={() => updatePaypal("enabled", !config.paypal.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.paypal.enabled ? "" : "bg-gray-600"}`}
                style={config.paypal.enabled ? { background: "var(--color-orange)" } : {}}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.paypal.enabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Mode</Label>
            <div className="flex gap-2 mt-2">
              {(["sandbox", "live"] as const).map((mode) => (
                <Button
                  key={mode}
                  size="sm"
                  variant={config.paypal.mode === mode ? "default" : "outline"}
                  onClick={() => updatePaypal("mode", mode)}
                  style={config.paypal.mode === mode ? { background: "var(--color-orange)" } : {}}
                >
                  {mode === "sandbox" ? "Sandbox" : "Live"}
                </Button>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-lg text-xs text-muted-foreground" style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}>
            Configurez <code className="px-1 py-0.5 rounded" style={{ background: "var(--color-border)" }}>PAYPAL_CLIENT_ID</code> et{" "}
            <code className="px-1 py-0.5 rounded" style={{ background: "var(--color-border)" }}>PAYPAL_CLIENT_SECRET</code> dans les variables d&apos;environnement.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
