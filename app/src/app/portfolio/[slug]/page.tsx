import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import type { Profile, Project, Experience } from "@/lib/types";
import { PortfolioPage } from "@/components/portfolio/portfolio-page";
import type { Metadata } from "next";

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
  return {
    title: `${profile.full_name} — ${profile.title || "Développeur"} | ivoire.io`,
    description:
      profile.bio ||
      `Portfolio de ${profile.full_name} sur ivoire.io — ${profile.title || "Développeur"} basé(e) à ${profile.city || "Côte d'Ivoire"}`,
    openGraph: {
      title: `${profile.full_name} | ivoire.io`,
      description: profile.bio || `Portfolio de ${profile.full_name}`,
      url: `https://${profile.slug}.ivoire.io`,
    },
  };
}

export default async function PortfolioSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getProfile(slug);

  if (!data) {
    notFound();
  }

  return (
    <PortfolioPage
      profile={data.profile}
      projects={data.projects}
      experiences={data.experiences}
    />
  );
}
