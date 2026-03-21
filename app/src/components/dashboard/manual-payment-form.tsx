"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaymentProviderConfig } from "@/lib/types";
import {
  Building2,
  Copy,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ManualPaymentFormProps {
  plan: string;
  amount: number;
  bankInfo: PaymentProviderConfig["manual"];
  onSuccess: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

export function ManualPaymentForm({
  plan,
  amount,
  bankInfo,
  onSuccess,
}: ManualPaymentFormProps) {
  const [bankReference, setBankReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      toast.error("Format non supporte. Utilisez une image (JPEG, PNG, WebP) ou un PDF.");
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      toast.error("Le fichier est trop volumineux. Taille maximum : 5 Mo.");
      return;
    }

    setFile(selected);
  }

  async function handleSubmit() {
    if (!file) {
      toast.error("Veuillez joindre une preuve de paiement (capture d'ecran ou PDF).");
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Create the payment record
      const paymentRes = await fetch("/api/dashboard/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          payment_method: "manual",
          bank_reference: bankReference || undefined,
        }),
      });

      if (!paymentRes.ok) {
        const err = await paymentRes.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de la creation du paiement");
      }

      const { payment_id } = await paymentRes.json();

      // Step 2: Upload the proof
      const formData = new FormData();
      formData.append("file", file);
      formData.append("payment_id", payment_id);

      const uploadRes = await fetch("/api/dashboard/payments/upload-proof", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error || "Erreur lors de l'envoi de la preuve");
      }

      toast.success(
        "Paiement enregistre ! Votre preuve sera verifiee sous 24h.",
      );
      onSuccess();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Une erreur est survenue. Veuillez reessayer.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copie dans le presse-papier !");
    } catch {
      toast.error("Impossible de copier");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Bank details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4" style={{ color: "var(--color-orange)" }} />
            Informations bancaires
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Banque</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{bankInfo.bank_name}</span>
                <button
                  onClick={() => copyToClipboard(bankInfo.bank_name)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Numero de compte</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium font-mono">
                  {bankInfo.account_number}
                </span>
                <button
                  onClick={() => copyToClipboard(bankInfo.account_number)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Titulaire du compte</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{bankInfo.account_name}</span>
                <button
                  onClick={() => copyToClipboard(bankInfo.account_name)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Montant a transferer</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: "var(--color-orange)" }}>
                  {amount.toLocaleString("fr-FR")} FCFA
                </span>
                <button
                  onClick={() => copyToClipboard(amount.toString())}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {bankInfo.instructions && (
            <div
              className="rounded-lg p-3 text-sm"
              style={{ background: "var(--color-surface)" }}
            >
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Instructions
              </p>
              <p className="text-sm">{bankInfo.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank reference input */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="bank-reference" className="text-sm">
          Reference bancaire (optionnel)
        </Label>
        <Input
          id="bank-reference"
          type="text"
          placeholder="Ex: REF-20260321-001"
          value={bankReference}
          onChange={(e) => setBankReference(e.target.value)}
          disabled={submitting}
        />
        <p className="text-xs text-muted-foreground">
          Si votre banque genere une reference de transaction, indiquez-la ici.
        </p>
      </div>

      {/* File upload */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm">
          Preuve de paiement <span className="text-red-500">*</span>
        </Label>
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={submitting}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-8 h-8" style={{ color: "var(--color-orange)" }} />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} Mo
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Changer de fichier
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Cliquez pour telecharger votre preuve de paiement
              </p>
              <p className="text-xs text-muted-foreground">
                Image (JPEG, PNG, WebP) ou PDF — Max 5 Mo
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={submitting || !file}
        className="w-full"
        style={{ background: "var(--color-orange)", color: "#fff" }}
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Envoyer le paiement
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Votre abonnement sera active apres verification de la preuve de paiement
        (delai moyen : 24h).
      </p>
    </div>
  );
}
