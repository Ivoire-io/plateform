import { FadeUp } from "@/components/ui/fade-up";
import { getStaticArticleBySlug, STATIC_ARTICLES } from "@/lib/blog-static";
import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/lib/types";
import { TABLES } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return STATIC_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const staticArticle = getStaticArticleBySlug(slug);
  if (staticArticle) {
    return {
      title: staticArticle.seoTitle,
      description: staticArticle.seoDescription,
      keywords: staticArticle.seoKeywords,
      openGraph: {
        title: staticArticle.seoTitle,
        description: staticArticle.seoDescription,
        url: `https://ivoire.io/blog/${slug}`,
        type: "article",
        publishedTime: staticArticle.publishedAt,
      },
    };
  }

  const supabase = await createClient();
  const { data: post } = await supabase
    .from(TABLES.blog_posts)
    .select("title, seo_title, seo_description, seo_keywords, published_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) return { title: "Article introuvable" };

  return {
    title: (post as BlogPost).seo_title || (post as BlogPost).title,
    description: (post as BlogPost).seo_description || undefined,
    keywords: (post as BlogPost).seo_keywords || undefined,
    openGraph: {
      title: (post as BlogPost).seo_title || (post as BlogPost).title,
      description: (post as BlogPost).seo_description || undefined,
      url: `https://ivoire.io/blog/${slug}`,
      type: "article",
      publishedTime: (post as BlogPost).published_at || undefined,
    },
  };
}

function ArticleContent({ html }: { html: string }) {
  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function ArticleCTA() {
  return (
    <FadeUp delay={0.2}>
      <div className="relative mt-20 p-8 md:p-12 rounded-3xl bg-surface/50 backdrop-blur-md border border-border/60 text-center overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange/5 via-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white relative z-10">Rejoins la communauté tech ivoirienne</h2>
        <p className="text-muted text-lg mb-8 max-w-lg mx-auto relative z-10">
          Crée ton portfolio gratuit, sois visible dans l&apos;annuaire et connecte-toi avec l&apos;écosystème.
        </p>
        <Link
          href="/?utm_source=blog&utm_medium=article&utm_campaign=cta"
          className="relative z-10 inline-flex items-center justify-center gap-2 h-12 px-8 bg-orange text-white font-medium rounded-xl hover:bg-orange/90 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 transition-all duration-300"
        >
          S&apos;inscrire gratuitement
        </Link>
      </div>
    </FadeUp>
  );
}

function ArticleTags({ tags }: { tags: string[] }) {
  return (
    <FadeUp delay={0.3}>
      <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border/30">
        {tags.map((tag, idx) => (
          <span
            key={tag}
            className="text-xs px-4 py-1.5 rounded-full bg-surface/50 backdrop-blur-sm border border-border/50 text-muted/80 hover:text-white hover:border-orange/30 hover:bg-white/5 transition-all duration-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </FadeUp>
  );
}

function ArticleHeader({
  category,
  date,
  title,
  excerpt,
}: {
  category: string;
  date: string;
  title: string;
  excerpt: string;
}) {
  return (
    <FadeUp delay={0.1}>
      <div className="mb-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 backdrop-blur-sm border border-border/50 text-muted hover:text-white hover:border-orange/30 transition-all duration-300 text-sm font-medium group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Retour au blog
        </Link>
      </div>

      <header className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-[11px] text-white font-bold uppercase tracking-wider px-3.5 py-1 rounded-full bg-orange/20 border border-orange/20">
            {category}
          </span>
          <span className="text-muted/60 text-sm font-medium">
            {new Date(date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-8 leading-[1.1] tracking-tight text-white">
          {title}
        </h1>
        {excerpt && (
          <p className="text-muted/90 text-xl md:text-2xl leading-relaxed border-l-[3px] border-orange pl-6 my-6">
            {excerpt}
          </p>
        )}
      </header>

      <hr className="border-border/40 mb-12" />
    </FadeUp>
  );
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Check static articles
  const staticArticle = getStaticArticleBySlug(slug);
  if (staticArticle) {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: staticArticle.title,
      description: staticArticle.seoDescription,
      datePublished: staticArticle.publishedAt,
      author: { "@type": "Organization", name: "ivoire.io", url: "https://ivoire.io" },
      publisher: {
        "@type": "Organization",
        name: "ivoire.io",
        url: "https://ivoire.io",
        logo: { "@type": "ImageObject", url: "https://ivoire.io/logo-ivoire.io-blanc.webp" },
      },
      mainEntityOfPage: `https://ivoire.io/blog/${slug}`,
    };

    return (
      <main className="relative pt-32 pb-24 px-4 min-h-screen overflow-hidden">
        {/* Background Glows */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-orange/10 blur-[150px] opacity-40" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="max-w-3xl mx-auto relative z-10">
          <ArticleHeader
            category={staticArticle.category}
            date={staticArticle.publishedAt}
            title={staticArticle.title}
            excerpt={staticArticle.excerpt}
          />
          <ArticleContent html={staticArticle.content} />
          <ArticleCTA />
          <ArticleTags tags={staticArticle.tags} />
        </article>
      </main>
    );
  }

  // 2. Check dynamic posts
  const supabase = await createClient();
  const { data: post } = await supabase
    .from(TABLES.blog_posts)
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!post) notFound();

  const blogPost = post as BlogPost;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blogPost.title,
    description: blogPost.seo_description || blogPost.excerpt,
    datePublished: blogPost.published_at || blogPost.created_at,
    author: { "@type": "Organization", name: "ivoire.io", url: "https://ivoire.io" },
    publisher: {
      "@type": "Organization",
      name: "ivoire.io",
      url: "https://ivoire.io",
      logo: { "@type": "ImageObject", url: "https://ivoire.io/logo-ivoire.io-blanc.webp" },
    },
    mainEntityOfPage: `https://ivoire.io/blog/${slug}`,
  };

  return (
    <main className="relative pt-32 pb-24 px-4 min-h-screen overflow-hidden">
      {/* Background Glows */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-orange/10 blur-[150px] opacity-40" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto relative z-10">
        <ArticleHeader
          category={blogPost.category}
          date={blogPost.published_at || blogPost.created_at}
          title={blogPost.title}
          excerpt={blogPost.excerpt || ""}
        />
        <ArticleContent html={blogPost.content} />
        <ArticleCTA />
        <ArticleTags tags={blogPost.tags} />
      </article>
    </main>
  );
}
