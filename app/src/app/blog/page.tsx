import { STATIC_ARTICLES } from "@/lib/blog-static";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/types";
import { TABLES } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

const ARTICLES_PER_PAGE = 9;

export const metadata: Metadata = {
  title: "Blog — ivoire.io",
  description:
    "Articles, guides et analyses sur la tech en Côte d'Ivoire : développeurs, startups, emploi, freelance, Mobile Money et transformation digitale.",
  keywords: [
    "blog tech côte d'ivoire",
    "développeur ivoirien blog",
    "startups CI actualités",
    "emploi tech abidjan",
  ],
};

interface BlogPageProps {
  searchParams: Promise<{ categorie?: string; page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { categorie, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const activeCategory = categorie || null;

  const supabase = await createClient();
  const { data: dynamicPosts } = await supabase
    .from(TABLES.blog_posts)
    .select("id, slug, title, excerpt, category, tags, published_at, cover_image_url")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const allArticles = [
    ...STATIC_ARTICLES.map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      category: a.category,
      tags: a.tags,
      publishedAt: a.publishedAt,
      isStatic: true as const,
    })),
    ...((dynamicPosts as BlogPost[]) || []).map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || "",
      category: p.category,
      tags: p.tags,
      publishedAt: p.published_at || p.created_at,
      isStatic: false as const,
    })),
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const categories = [...new Set(allArticles.map((a) => a.category))];

  // Filter by category
  const filtered = activeCategory
    ? allArticles.filter((a) => a.category === activeCategory)
    : allArticles;

  // Featured = first article (only on page 1 with no filter)
  const showFeatured = currentPage === 1 && !activeCategory;
  const featured = showFeatured ? filtered[0] : null;
  const articlesForGrid = showFeatured ? filtered.slice(1) : filtered;

  // Pagination
  const totalArticles = articlesForGrid.length;
  const totalPages = Math.max(1, Math.ceil(totalArticles / ARTICLES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ARTICLES_PER_PAGE;
  const paginatedArticles = articlesForGrid.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

  function buildUrl(params: { categorie?: string | null; page?: number }) {
    const sp = new URLSearchParams();
    const cat = params.categorie !== undefined ? params.categorie : activeCategory;
    if (cat) sp.set("categorie", cat);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    const qs = sp.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  }

  return (
    <main className="pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Blog <span className="text-orange">ivoire.io</span>
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Guides, analyses et ressources sur la tech en Côte d&apos;Ivoire.
            Données sourcées, pas de fluff.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <Link
            href={buildUrl({ categorie: null, page: 1 })}
            className={`px-4 py-1.5 rounded-full border text-sm capitalize transition-colors ${
              !activeCategory
                ? "bg-orange text-white border-orange font-medium"
                : "bg-surface border-border text-muted hover:border-orange/30"
            }`}
          >
            Tous
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={buildUrl({ categorie: cat, page: 1 })}
              className={`px-4 py-1.5 rounded-full border text-sm capitalize transition-colors ${
                activeCategory === cat
                  ? "bg-orange text-white border-orange font-medium"
                  : "bg-surface border-border text-muted hover:border-orange/30"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Active filter indicator */}
        {activeCategory && (
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted">
              <span className="font-medium text-foreground capitalize">{activeCategory}</span>
              {" — "}
              {filtered.length} article{filtered.length > 1 ? "s" : ""}
            </p>
            <Link
              href="/blog"
              className="text-sm text-orange hover:underline"
            >
              Effacer le filtre
            </Link>
          </div>
        )}

        {/* Featured article */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="block mb-12 bg-surface border border-border rounded-2xl p-8 md:p-10 hover:border-orange/30 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-orange font-semibold uppercase tracking-wider">
                {featured.category}
              </span>
              <span className="text-muted/50 text-xs">
                {new Date(featured.publishedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-orange transition-colors leading-tight">
              {featured.title}
            </h2>
            <p className="text-muted text-base md:text-lg leading-relaxed max-w-2xl">
              {featured.excerpt}
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {featured.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-border/50 text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        )}

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="bg-surface border border-border rounded-2xl p-6 hover:border-orange/30 transition-colors group flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] text-orange font-semibold uppercase tracking-wider">
                  {article.category}
                </span>
                <span className="text-muted/40 text-[11px]">·</span>
                <span className="text-muted/50 text-[11px]">
                  {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <h2 className="text-base font-semibold mb-2 group-hover:text-orange transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h2>
              <p className="text-muted text-sm line-clamp-3 flex-1">{article.excerpt}</p>
              <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border/50">
                {article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded bg-border/50 text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <p className="text-center text-muted py-12">Aucun article pour le moment.</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-border">
            {/* Previous */}
            {safePage > 1 ? (
              <Link
                href={buildUrl({ page: safePage - 1 })}
                className="px-4 py-2 rounded-lg bg-surface border border-border text-sm text-muted hover:border-orange/30 hover:text-foreground transition-colors"
              >
                ← Précédent
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-lg text-sm text-muted/30 cursor-not-allowed">
                ← Précédent
              </span>
            )}

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl({ page: p })}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
                    p === safePage
                      ? "bg-orange text-white font-medium"
                      : "bg-surface border border-border text-muted hover:border-orange/30"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>

            {/* Next */}
            {safePage < totalPages ? (
              <Link
                href={buildUrl({ page: safePage + 1 })}
                className="px-4 py-2 rounded-lg bg-surface border border-border text-sm text-muted hover:border-orange/30 hover:text-foreground transition-colors"
              >
                Suivant →
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-lg text-sm text-muted/30 cursor-not-allowed">
                Suivant →
              </span>
            )}
          </nav>
        )}
      </div>
    </main>
  );
}
