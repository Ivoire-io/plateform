"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/client";
import type { Experience, Profile, Project } from "@/lib/types";
import { Briefcase, Clock, ExternalLink, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExperiencesTab } from "./experiences-tab";
import { ProfileTab } from "./profile-tab";
import { ProjectsTab } from "./projects-tab";

type Tab = "profile" | "projects" | "experiences";

interface DashboardShellProps {
  userId: string;
  userEmail: string;
  profile: Profile | null;
  initialProjects: Project[];
  initialExperiences: Experience[];
}

export function DashboardShell({
  userId,
  userEmail,
  profile,
  initialProjects,
  initialExperiences,
}: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const navItems: { id: Tab; label: string; Icon: typeof User }[] = [
    { id: "profile", label: "Mon Profil", Icon: User },
    { id: "projects", label: "Projets", Icon: Briefcase },
    { id: "experiences", label: "Expériences", Icon: Clock },
  ];

  const tabTitles: Record<Tab, string> = {
    profile: "Mon Profil",
    projects: "Projets",
    experiences: "Expériences",
  };

  return (
    <SidebarProvider>
      <Toaster position="top-right" richColors theme="dark" />

      {/* ─── Sidebar ─── */}
      <Sidebar>
        <SidebarHeader>
          <div className="px-1 py-1">
            <Link href="/" className="flex items-center gap-0.5 mb-4">
              <span className="text-sm font-bold text-foreground">ivoire</span>
              <span className="text-sm font-bold" style={{ color: "var(--color-orange)" }}>.io</span>
            </Link>

            <div className="flex items-center gap-3">
              <Avatar size="default">
                {profile?.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                )}
                <AvatarFallback
                  className="font-semibold text-sm"
                  style={{ background: "var(--color-surface)", color: "var(--color-orange)" }}
                >
                  {(profile?.full_name ?? userEmail).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  {profile?.full_name ?? "Mon profil"}
                </span>
                <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(({ id, label, Icon }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={activeTab === id}
                      onClick={() => setActiveTab(id)}
                    >
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            {profile && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <a
                      href={`https://${profile.slug}.ivoire.io`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <ExternalLink />
                  <span>Voir mon portfolio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut />
                <span>Déconnexion</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* ─── Contenu principal ─── */}
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/90 backdrop-blur-md px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <nav className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">dashboard</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="font-medium">{tabTitles[activeTab]}</span>
          </nav>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {!profile && (
            <div
              className="rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor: "color-mix(in srgb, var(--color-orange) 30%, transparent)",
                background: "color-mix(in srgb, var(--color-orange) 10%, transparent)",
                color: "var(--color-orange)",
              }}
            >
              Votre profil n&apos;est pas encore disponible. Contactez l&apos;équipe ivoire.io pour l&apos;activation.
            </div>
          )}

          {profile && activeTab === "profile" && (
            <ProfileTab profile={profile} userId={userId} />
          )}
          {profile && activeTab === "projects" && (
            <ProjectsTab profileId={profile.id} initialProjects={initialProjects} />
          )}
          {profile && activeTab === "experiences" && (
            <ExperiencesTab profileId={profile.id} initialExperiences={initialExperiences} />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

