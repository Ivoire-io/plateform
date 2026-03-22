"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlogPost } from "@/lib/types";
import {
  Eye,
  EyeOff,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  cover_image_url: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  is_published: boolean;
}

const EMPTY_FORM: PostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "general",
  tags: "",
  cover_image_url: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  is_published: false,
};

export function AdminBlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blog?admin=true");
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      category: post.category,
      tags: (post.tags || []).join(", "),
      cover_image_url: post.cover_image_url || "",
      seo_title: post.seo_title || "",
      seo_description: post.seo_description || "",
      seo_keywords: (post.seo_keywords || []).join(", "),
      is_published: post.is_published,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title || !form.slug || !form.content) {
      toast.error("Titre, slug et contenu requis");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        seo_keywords: form.seo_keywords.split(",").map((t) => t.trim()).filter(Boolean),
      };

      const url = editingId ? `/api/blog/${editingId}` : "/api/blog";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erreur");
        return;
      }

      toast.success(editingId ? "Article mis à jour" : "Article créé");
      setDialogOpen(false);
      fetchPosts();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(post: BlogPost) {
    try {
      const res = await fetch(`/api/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !post.is_published }),
      });
      if (!res.ok) throw new Error();
      toast.success(post.is_published ? "Dépublié" : "Publié");
      fetchPosts();
    } catch {
      toast.error("Erreur");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Article supprimé");
      fetchPosts();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Articles de blog</h2>
          <p className="text-sm text-muted-foreground">
            {posts.length} article{posts.length !== 1 ? "s" : ""} —{" "}
            {posts.filter((p) => p.is_published).length} publié{posts.filter((p) => p.is_published).length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPosts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Nouvel article
          </Button>
        </div>
      </div>

      {/* Posts list */}
      <div className="grid gap-3">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{post.title}</span>
                    <Badge variant={post.is_published ? "default" : "secondary"} className="text-[10px]">
                      {post.is_published ? "Publié" : "Brouillon"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{post.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    /blog/{post.slug}
                    {post.published_at && ` — ${new Date(post.published_at).toLocaleDateString("fr-FR")}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(post)} title={post.is_published ? "Dépublier" : "Publier"}>
                  {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(post)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {posts.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Aucun article de blog. Créez le premier !
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier l'article" : "Nouvel article"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Modifiez les champs ci-dessous" : "Remplissez les champs pour créer un article"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Titre *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  placeholder="mon-article"
                />
              </div>
            </div>

            <div>
              <Label>Extrait</Label>
              <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Résumé court..." />
            </div>

            <div>
              <Label>Contenu (HTML) *</Label>
              <textarea
                className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Catégorie</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <Label>Tags (séparés par virgule)</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </div>
            </div>

            <div>
              <Label>URL image de couverture</Label>
              <Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} />
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Titre SEO</Label>
                  <Input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
                </div>
                <div>
                  <Label>Description SEO</Label>
                  <Input value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} />
                </div>
                <div>
                  <Label>Mots-clés SEO (séparés par virgule)</Label>
                  <Input value={form.seo_keywords} onChange={(e) => setForm({ ...form, seo_keywords: e.target.value })} />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_published">Publier immédiatement</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Sauvegarde..." : editingId ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
