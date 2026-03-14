import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import type { Experience, Profile, Project } from "@/lib/types";
import { TABLES } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard — ivoire.io",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from(TABLES.profiles)
    .select("*")
    .eq("id", user.id)
    .single();

  let projects: Project[] = [];
  let experiences: Experience[] = [];

  if (profile) {
    const [{ data: p }, { data: e }] = await Promise.all([
      supabase.from(TABLES.projects).select("*").eq("profile_id", profile.id).order("sort_order"),
      supabase.from(TABLES.experiences).select("*").eq("profile_id", profile.id).order("sort_order"),
    ]);
    projects = (p ?? []) as Project[];
    experiences = (e ?? []) as Experience[];
  }

  return (
    <DashboardShell
      userId={user.id}
      userEmail={user.email ?? ""}
      profile={profile as Profile | null}
      initialProjects={projects}
      initialExperiences={experiences}
    />
  );
}
