import { getAllStaticSlugs } from "@/lib/blog-static";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import type { MetadataRoute } from "next";

const BASE_URL = "https://ivoire.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/startups/landing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/cgu`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Static blog articles
  const staticBlogPages: MetadataRoute.Sitemap = getAllStaticSlugs().map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Dynamic blog posts
  const { data: dynamicPosts } = await supabase
    .from(TABLES.blog_posts)
    .select("slug, updated_at")
    .eq("is_published", true);

  const dynamicBlogPages: MetadataRoute.Sitemap = (dynamicPosts || []).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Dev profiles
  const { data: profiles } = await supabase
    .from(TABLES.profiles)
    .select("slug, updated_at")
    .eq("is_suspended", false)
    .limit(1000);

  const profilePages: MetadataRoute.Sitemap = (profiles || []).map((p) => ({
    url: `https://${p.slug}.ivoire.io`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...staticBlogPages, ...dynamicBlogPages, ...profilePages];
}
