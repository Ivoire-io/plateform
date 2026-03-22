import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET: list published blog posts (public)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "true";

  if (admin) {
    const guard = await adminGuard();
    if (!guard.authorized) return guard.response;

    const { data, error } = await supabase
      .from(TABLES.blog_posts)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    return NextResponse.json({ posts: data ?? [] });
  }

  const { data, error } = await supabase
    .from(TABLES.blog_posts)
    .select("id, slug, title, excerpt, category, tags, published_at, cover_image_url")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}

// POST: create a new blog post (admin only)
export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const body = await request.json();
  const { title, slug, excerpt, content, category, tags, cover_image_url, seo_title, seo_description, seo_keywords, is_published } = body;

  if (!title || !slug || !content) {
    return NextResponse.json({ error: "Titre, slug et contenu requis" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLES.blog_posts)
    .insert({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      category: category || "general",
      tags: tags || [],
      cover_image_url: cover_image_url || null,
      seo_title: seo_title || null,
      seo_description: seo_description || null,
      seo_keywords: seo_keywords || [],
      is_published: is_published || false,
      published_at: is_published ? new Date().toISOString() : null,
      author_id: guard.userId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ce slug existe déjà" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }

  return NextResponse.json({ post: data }, { status: 201 });
}
