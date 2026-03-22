import { FadeUp } from "@/components/ui/fade-up";
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
    <main className="relative pt-32 pb-24 px-4 overflow-hidden min-h-screen">
      {/* Background Glows */}
      <div className="pointer-events-none absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-orange/10 blur-[120px] opacity-50" />
      <div className="pointer-events-none absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 h-[600px] w-[600px] rounded-full bg-orange/5 blur-[100px] opacity-50" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <FadeUp delay={0.1}>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Blog <span className="text-orange">ivoire.io</span>
            </h1>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Guides, analyses et ressources sur la tech en Côte d&apos;Ivoire.
              Données sourcées, pas de fluff.
            </p>
          </div>
        </FadeUp>

        {/* Category filters */}
        <FadeUp delay={0.2}>
          <div className="flex flex-wrap gap-2 justify-center mb-12 relative z-20">
            <Link
              href={buildUrl({ categorie: null, page: 1 })}
              className={`px-5 py-2 rounded-full border text-sm capitalize transition-all duration-300 ${!activeCategory
                ? "bg-orange text-white border-orange shadow-[0_0_20px_rgba(249,115,22,0.3)] font-medium"
                : "bg-surface/50 backdrop-blur-sm border-border text-muted hover:border-orange/50 hover:bg-white/5"
                }`}
            >
              Tous
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={buildUrl({ categorie: cat, page: 1 })}
                className={`px-5 py-2 rounded-full border text-sm capitalize transition-all duration-300 ${activeCategory === cat
                  ? "bg-orange text-white border-orange shadow-[0_0_20px_rgba(249,115,22,0.3)] font-medium"
                  : "bg-surface/50 backdrop-blur-sm border-border text-muted hover:border-orange/50 hover:bg-white/5"
                  }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </FadeUp>

        {/* Active filter indicator */}
        {activeCategory && (
          <FadeUp delay={0.3}>
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-muted">
                <span className="font-medium text-white capitalize">{activeCategory}</span>
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
          </FadeUp>
        )}

        {/* Featured article */}
        {featured && (
          <FadeUp delay={0.4}>
            <Link
              href={`/blog/${featured.slug}`}
              className="block mb-12 bg-surface/50 backdrop-blur-md border border-border rounded-2xl p-8 md:p-10 hover:border-orange/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group relative overflow-hidden"
            >
              {/* Subtle hover gradient inside featured card */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange/0 via-orange/5 to-orange/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
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
              </div>
            </Link>
          </FadeUp>
        )}

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedArticles.map((article, idx) => (
            <FadeUp key={article.slug} delay={0.1 * (idx + 1)}>
              <Link
                href={`/blog/${article.slug}`}
                className="bg-surface/50 backdrop-blur-md border border-border/60 rounded-2xl p-6 hover:border-orange/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 group flex flex-col h-full relative overflow-hidden"
              >
                {/* Glow hint */}
                <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-orange/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[11px] text-white bg-orange/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {article.category}
                  </span>
                  <span className="text-muted/40 text-[11px]">·</span>
                  <span className="text-muted/70 text-[11px] font-medium">
                    {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <h2 className="text-lg font-bold mb-3 group-hover:text-orange transition-colors line-clamp-2 leading-tight text-white">
                  {article.title}
                </h2>
                <p className="text-muted/80 text-sm line-clamp-3 flex-1 mb-4">{article.excerpt}</p>
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/30">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2.5 py-1 rounded bg-white/5 text-muted/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <FadeUp delay={0.2}>
            <div className="text-center py-20 bg-surface/50 backdrop-blur-sm rounded-2xl border border-border/50 mt-8">
              <p className="text-muted text-lg">Aucun article pour le moment.</p>
            </div>
          </FadeUp>
        )}

        {/* Pagination - Add fadeup */}
        {totalPages > 1 && (
          <FadeUp delay={0.5}>
            <nav className="flex items-center justify-center gap-3 mt-16 pt-10 border-t border-border/50">
              {/* Previous */}
              {safePage > 1 ? (
                <Link
                  href={buildUrl({ page: safePage - 1 })}
                  className="px-5 py-2.5 rounded-xl bg-surface/50 backdrop-blur-sm border border-border text-sm text-muted font-medium hover:border-orange/50 hover:bg-orange/5 hover:text-white transition-all duration-300"
                >
                  ← Précédent
                </Link>
              ) : (
                <span className="px-5 py-2.5 rounded-xl text-sm text-muted/30 font-medium cursor-not-allowed border border-transparent">
                  ← Précédent
                </span>
              )}

              {/* Page numbers */}
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={buildUrl({ page: p })}
                    className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 ${p === safePage
                      ? "bg-orange text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] border border-orange"
                      : "bg-surface/50 backdrop-blur-sm border border-border text-muted hover:border-orange/50 hover:bg-white/5 hover:text-white"
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
                  className="px-5 py-2.5 rounded-xl bg-surface/50 backdrop-blur-sm border border-border text-sm text-muted font-medium hover:border-orange/50 hover:bg-orange/5 hover:text-white transition-all duration-300"
                >
                  Suivant →
                </Link>
              ) : (
                <span className="px-5 py-2.5 rounded-xl text-sm text-muted/30 font-medium cursor-not-allowed border border-transparent">
                  Suivant →
                </span>
              )}
            </nav>
          </FadeUp>
        )}
      </div>
    </main>
  );
}
