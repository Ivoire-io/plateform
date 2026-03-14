import { PortfolioPage } from "@/components/portfolio/portfolio-page";
import { createClient } from "@/lib/supabase/server";
import type { Experience, Profile, Project } from "@/lib/types";
import { TABLES } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProfile(slug: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from(TABLES.profiles)
    .select("*")
    .eq("slug", slug)
    .single();

  if (!profile) return null;

  const [{ data: projects }, { data: experiences }] = await Promise.all([
    supabase
      .from(TABLES.projects)
      .select("*")
      .eq("profile_id", profile.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from(TABLES.experiences)
      .select("*")
      .eq("profile_id", profile.id)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    profile: profile as Profile,
    projects: (projects || []) as Project[],
    experiences: (experiences || []) as Experience[],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProfile(slug);

  if (!data) {
    return { title: "Profil introuvable — ivoire.io" };
  }

  const { profile } = data;
  const title = `${profile.full_name} — ${profile.title || "Développeur"}`;
  const description =
    profile.bio ||
    `Portfolio de ${profile.full_name} sur ivoire.io — ${profile.title || "Développeur"} basé(e) à ${profile.city || "Côte d'Ivoire"
    }.`;
  const profileUrl = `https://${profile.slug}.ivoire.io`;
  const avatarUrl = profile.avatar_url
    ? profile.avatar_url
    : `https://ivoire.io/og-image.png`;

  return {
    title,
    description,
    alternates: { canonical: profileUrl },
    openGraph: {
      title,
      description,
      url: profileUrl,
      type: "profile",
      images: [{ url: avatarUrl, width: 400, height: 400, alt: profile.full_name }],
      siteName: "ivoire.io",
      locale: "fr_CI",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [avatarUrl],
      site: "@ivoire_io",
    },
  };
}

export default async function PortfolioSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getProfile(slug);

  if (!data) {
    notFound();
  }

  const { profile, projects, experiences } = data;

  // JSON-LD Person schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.full_name,
    url: `https://${profile.slug}.ivoire.io`,
    jobTitle: profile.title || undefined,
    description: profile.bio || undefined,
    image: profile.avatar_url || undefined,
    address: profile.city
      ? { "@type": "PostalAddress", addressLocality: profile.city, addressCountry: "CI" }
      : undefined,
    knowsAbout: profile.skills || undefined,
    sameAs: [
      profile.github_url,
      profile.linkedin_url,
      profile.twitter_url,
      profile.website_url,
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioPage
        profile={profile}
        projects={projects}
        experiences={experiences}
      />
    </>
  );
}
