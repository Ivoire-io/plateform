"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Calendar,
  Github,
  Globe,
  Lightbulb,
  Loader2,
  Pencil,
  Plus,
  Smartphone,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface Product {
  id: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  category: string;
  techStack: string[];
  websiteUrl: string;
  appStoreUrl: string;
  playStoreUrl: string;
  docsUrl: string;
  githubUrl: string;
  votes: number;
  launchDate: string;
  publishOnPortal: boolean;
}

const CATEGORIES = [
  { value: "app_mobile", label: "App mobile" },
  { value: "api", label: "API" },
  { value: "saas", label: "SaaS" },
  { value: "autre", label: "Autre" },
];

const CATEGORY_LABELS: Record<string, string> = {
  app_mobile: "App mobile",
  api: "API",
  saas: "SaaS",
  autre: "Autre",
};

// ---------------------------------------------------------------------------
// Empty form helper
// ---------------------------------------------------------------------------

function emptyForm() {
  return {
    name: "",
    shortDesc: "",
    longDesc: "",
    category: "app_mobile",
    techStack: [] as string[],
    websiteUrl: "",
    appStoreUrl: "",
    playStoreUrl: "",
    docsUrl: "",
    githubUrl: "",
    launchDate: "",
    publishOnPortal: false,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:border-orange-400 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function LinkIcon({
  url,
  icon: Icon,
  label,
  className,
}: {
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
}) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border hover:border-orange-400/50 transition-colors ${className ?? ""}`}
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// ProductCard
// ---------------------------------------------------------------------------

function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const hasLinks =
    product.websiteUrl ||
    product.appStoreUrl ||
    product.playStoreUrl ||
    product.docsUrl ||
    product.githubUrl;

  return (
    <Card
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <CardContent className="space-y-4">
        {/* Header: icon + name + actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-xl border border-border flex items-center justify-center shrink-0"
              style={{ background: "var(--color-surface)" }}
            >
              <Lightbulb
                className="h-6 w-6"
                style={{ color: "var(--color-orange)" }}
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                {product.shortDesc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onEdit}
              title="Modifier"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onDelete}
              title="Supprimer"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tech stack badges */}
        {product.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.techStack.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="text-xs"
              >
                {tech}
              </Badge>
            ))}
          </div>
        )}

        {/* Category + votes + date row */}
        <div className="flex items-center flex-wrap gap-3 text-sm">
          <Badge
            className="text-xs border border-orange-500/30 bg-orange-500/10 text-orange-400"
          >
            {CATEGORY_LABELS[product.category] ?? product.category}
          </Badge>

          <span className="flex items-center gap-1 text-muted-foreground">
            <Star className="h-3.5 w-3.5 text-yellow-500" />
            <span className="font-medium">{product.votes}</span>
          </span>

          {product.launchDate && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(product.launchDate)}</span>
            </span>
          )}

          {product.publishOnPortal && (
            <Badge className="text-xs border border-green-500/30 bg-green-500/10 text-green-400">
              Publie
            </Badge>
          )}
        </div>

        {/* Links */}
        {hasLinks && (
          <div className="flex flex-wrap gap-2 pt-1">
            <LinkIcon
              url={product.websiteUrl}
              icon={Globe}
              label="Site web"
            />
            <LinkIcon
              url={product.appStoreUrl}
              icon={Smartphone}
              label="App Store"
              className="text-gray-400"
            />
            <LinkIcon
              url={product.playStoreUrl}
              icon={Smartphone}
              label="Play Store"
              className="text-green-400"
            />
            <LinkIcon
              url={product.docsUrl}
              icon={BookOpen}
              label="Documentation"
            />
            <LinkIcon
              url={product.githubUrl}
              icon={Github}
              label="GitHub"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// ProductFormSheet
// ---------------------------------------------------------------------------

function ProductFormSheet({
  open,
  onOpenChange,
  editingProduct,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  onSave: (data: Omit<Product, "id" | "votes">) => void;
}) {
  const isEdit = !!editingProduct;
  const [form, setForm] = useState(emptyForm);
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset form when sheet opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      if (editingProduct) {
        setForm({
          name: editingProduct.name,
          shortDesc: editingProduct.shortDesc,
          longDesc: editingProduct.longDesc,
          category: editingProduct.category,
          techStack: [...editingProduct.techStack],
          websiteUrl: editingProduct.websiteUrl,
          appStoreUrl: editingProduct.appStoreUrl,
          playStoreUrl: editingProduct.playStoreUrl,
          docsUrl: editingProduct.docsUrl,
          githubUrl: editingProduct.githubUrl,
          launchDate: editingProduct.launchDate,
          publishOnPortal: editingProduct.publishOnPortal,
        });
      } else {
        setForm(emptyForm());
      }
      setTechInput("");
    }
    onOpenChange(nextOpen);
  };

  function setField(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addTech(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && techInput.trim()) {
      e.preventDefault();
      const t = techInput.trim().replace(/,/g, "");
      if (t && !form.techStack.includes(t)) {
        setField("techStack", [...form.techStack, t]);
      }
      setTechInput("");
    }
  }

  function removeTech(tech: string) {
    setField(
      "techStack",
      form.techStack.filter((t) => t !== tech)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.shortDesc.trim()) {
      toast.error("Le nom et la description courte sont requis.");
      return;
    }
    setSaving(true);
    onSave({
      name: form.name.trim(),
      shortDesc: form.shortDesc.trim(),
      longDesc: form.longDesc.trim(),
      category: form.category,
      techStack: form.techStack,
      websiteUrl: form.websiteUrl.trim(),
      appStoreUrl: form.appStoreUrl.trim(),
      playStoreUrl: form.playStoreUrl.trim(),
      docsUrl: form.docsUrl.trim(),
      githubUrl: form.githubUrl.trim(),
      launchDate: form.launchDate,
      publishOnPortal: form.publishOnPortal,
    });
    setSaving(false);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-lg overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Modifier le produit" : "Ajouter un produit"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifiez les informations de votre produit."
              : "Remplissez les informations pour publier un nouveau produit."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-4 pb-6">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="product-name">
              Nom du produit <span className="text-orange-400">*</span>
            </Label>
            <Input
              id="product-name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="PayEasy, MonApp..."
              required
            />
          </div>

          {/* Short description */}
          <div className="space-y-1.5">
            <Label htmlFor="product-short-desc">
              Description courte <span className="text-orange-400">*</span>{" "}
              <span className="text-xs text-muted-foreground">
                ({form.shortDesc.length}/120)
              </span>
            </Label>
            <Input
              id="product-short-desc"
              value={form.shortDesc}
              onChange={(e) => setField("shortDesc", e.target.value)}
              placeholder="Le mobile banking simplifie pour la CI"
              maxLength={120}
              required
            />
          </div>

          {/* Long description */}
          <div className="space-y-1.5">
            <Label htmlFor="product-long-desc">
              Description longue{" "}
              <span className="text-xs text-muted-foreground">
                ({form.longDesc.length}/1000)
              </span>
            </Label>
            <Textarea
              id="product-long-desc"
              value={form.longDesc}
              onChange={(e) => setField("longDesc", e.target.value)}
              placeholder="Decrivez votre produit en detail..."
              rows={4}
              maxLength={1000}
            />
          </div>

          {/* Category */}
          <SelectField
            id="product-category"
            label="Categorie"
            value={form.category}
            onChange={(v) => setField("category", v)}
            options={CATEGORIES}
          />

          {/* Tech stack */}
          <div className="space-y-1.5">
            <Label>Stack technique</Label>
            <div className="flex flex-wrap gap-2 min-h-[28px]">
              {form.techStack.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-border bg-background"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTech(t)}
                    className="text-muted-foreground hover:text-foreground ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <Input
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={addTech}
              placeholder="Flutter, Firebase... (Entree ou virgule pour ajouter)"
            />
          </div>

          {/* Links */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Liens
            </Label>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                type="url"
                value={form.websiteUrl}
                onChange={(e) => setField("websiteUrl", e.target.value)}
                placeholder="https://monproduit.ci"
              />
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 shrink-0 text-gray-400" />
              <Input
                type="url"
                value={form.appStoreUrl}
                onChange={(e) => setField("appStoreUrl", e.target.value)}
                placeholder="App Store — https://apps.apple.com/..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 shrink-0 text-green-400" />
              <Input
                type="url"
                value={form.playStoreUrl}
                onChange={(e) => setField("playStoreUrl", e.target.value)}
                placeholder="Play Store — https://play.google.com/..."
              />
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                type="url"
                value={form.docsUrl}
                onChange={(e) => setField("docsUrl", e.target.value)}
                placeholder="https://docs.monproduit.ci"
              />
            </div>
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 shrink-0" />
              <Input
                type="url"
                value={form.githubUrl}
                onChange={(e) => setField("githubUrl", e.target.value)}
                placeholder="https://github.com/monproduit"
              />
            </div>
          </div>

          {/* Launch date */}
          <div className="space-y-1.5">
            <Label htmlFor="product-launch-date">Date de lancement</Label>
            <Input
              id="product-launch-date"
              type="date"
              value={form.launchDate}
              onChange={(e) => setField("launchDate", e.target.value)}
            />
          </div>

          {/* Publish checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${form.publishOnPortal
                ? "border-orange-400 bg-orange-500"
                : "border-border bg-background"
                }`}
              onClick={() => setField("publishOnPortal", !form.publishOnPortal)}
            >
              {form.publishOnPortal && (
                <svg
                  className="h-3 w-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="text-sm">Publier sur startups.ivoire.io</span>
          </label>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
              style={{ background: "var(--color-orange)", color: "white" }}
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Enregistrer" : "Ajouter le produit"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// DeleteConfirmDialog
// ---------------------------------------------------------------------------

function DeleteConfirmDialog({
  open,
  onOpenChange,
  productName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Supprimer le produit</DialogTitle>
          <DialogDescription>
            Voulez-vous vraiment supprimer{" "}
            <strong>{productName}</strong> ? Cette action est
            irreversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
          <DialogClose
            render={<Button variant="outline" />}
          >
            Annuler
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProductsTab({ startupId }: { startupId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  /* ---- Fetch products ---- */

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/products");
      if (!res.ok) throw new Error("Erreur chargement");
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      toast.error("Impossible de charger les produits.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleAdd() {
    setEditingProduct(null);
    setSheetOpen(true);
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setSheetOpen(true);
  }

  function handleDeleteRequest(product: Product) {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!productToDelete) return;
    try {
      const res = await fetch(`/api/dashboard/products/${productToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur suppression");
      toast.success(`"${productToDelete.name}" a ete supprime.`);
      setProductToDelete(null);
      await fetchProducts();
    } catch {
      toast.error("Impossible de supprimer ce produit.");
    }
  }

  async function handleSave(data: Omit<Product, "id" | "votes">) {
    try {
      const url = editingProduct
        ? `/api/dashboard/products/${editingProduct.id}`
        : "/api/dashboard/products";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur serveur");

      if (editingProduct) {
        toast.success(`"${data.name}" a ete mis a jour.`);
      } else {
        toast.success(`"${data.name}" a ete ajoute.`);
      }
      await fetchProducts();
    } catch {
      toast.error("Une erreur est survenue.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lightbulb
              className="h-5 w-5"
              style={{ color: "var(--color-orange)" }}
            />
            Produits
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Listez vos produits sur le portail startups.ivoire.io — le
            Product Hunt ivoirien.
          </p>
        </div>
        <Button
          onClick={handleAdd}
          style={{ background: "var(--color-orange)", color: "white" }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Product grid or empty state */}
      {products.length === 0 ? (
        <div
          className="rounded-xl border border-dashed border-border flex flex-col items-center justify-center py-16 gap-4 text-center"
          style={{ background: "var(--color-surface)" }}
        >
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <Lightbulb className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">Aucun produit pour le moment</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Ajoutez votre premier produit pour le publier sur
              startups.ivoire.io et recevoir des votes de la communaute.
            </p>
          </div>
          <Button
            onClick={handleAdd}
            style={{ background: "var(--color-orange)", color: "white" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => handleEdit(product)}
              onDelete={() => handleDeleteRequest(product)}
            />
          ))}
        </div>
      )}

      {/* Sheet for add/edit */}
      <ProductFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingProduct={editingProduct}
        onSave={handleSave}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        productName={productToDelete?.name ?? ""}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
