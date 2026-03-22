import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

// GET: single post by ID (admin)
export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLES.blog_posts)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  return NextResponse.json({ post: data });
}

// PUT: update a blog post (admin)
export async function PUT(request: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;
  const body = await request.json();
  const { title, slug, excerpt, content, category, tags, cover_image_url, seo_title, seo_description, seo_keywords, is_published } = body;

  const supabase = await createClient();

  // If publishing for the first time, set published_at
  let publishedAt: string | undefined;
  if (is_published) {
    const { data: current } = await supabase
      .from(TABLES.blog_posts)
      .select("published_at")
      .eq("id", id)
      .single();
    if (!current?.published_at) {
      publishedAt = new Date().toISOString();
    }
  }

  const updateData: Record<string, unknown> = {
    ...(title !== undefined && { title }),
    ...(slug !== undefined && { slug }),
    ...(excerpt !== undefined && { excerpt }),
    ...(content !== undefined && { content }),
    ...(category !== undefined && { category }),
    ...(tags !== undefined && { tags }),
    ...(cover_image_url !== undefined && { cover_image_url }),
    ...(seo_title !== undefined && { seo_title }),
    ...(seo_description !== undefined && { seo_description }),
    ...(seo_keywords !== undefined && { seo_keywords }),
    ...(is_published !== undefined && { is_published }),
    ...(publishedAt && { published_at: publishedAt }),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TABLES.blog_posts)
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ce slug existe déjà" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

// DELETE: delete a blog post (admin)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from(TABLES.blog_posts)
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
