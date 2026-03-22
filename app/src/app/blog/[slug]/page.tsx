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
    <div className="mt-16 p-8 md:p-10 rounded-2xl bg-orange/5 border border-orange/20 text-center">
      <h2 className="text-2xl font-bold mb-3">Rejoins la communauté tech ivoirienne</h2>
      <p className="text-muted mb-6 max-w-md mx-auto">
        Crée ton portfolio gratuit, sois visible dans l&apos;annuaire et connecte-toi avec l&apos;écosystème.
      </p>
      <Link
        href="/?utm_source=blog&utm_medium=article&utm_campaign=cta"
        className="inline-flex items-center gap-2 px-6 py-3 bg-orange text-white font-medium rounded-lg hover:bg-orange/90 transition-colors"
      >
        S&apos;inscrire gratuitement sur ivoire.io
      </Link>
    </div>
  );
}

function ArticleTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-border">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-xs px-3 py-1 rounded-full bg-surface border border-border text-muted"
        >
          {tag}
        </span>
      ))}
    </div>
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
    <>
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-muted hover:text-orange text-sm transition-colors"
        >
          <span>←</span> Retour au blog
        </Link>
      </div>

      <header className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-orange font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-orange/10 border border-orange/20">
            {category}
          </span>
          <span className="text-muted text-sm">
            {new Date(date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-[1.15] tracking-tight">
          {title}
        </h1>
        <p className="text-muted text-lg md:text-xl leading-relaxed border-l-2 border-orange/30 pl-4">
          {excerpt}
        </p>
      </header>

      <hr className="border-border mb-10" />
    </>
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
      <main className="pt-24 pb-16 px-4">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="max-w-3xl mx-auto">
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
    <main className="pt-24 pb-16 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto">
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
