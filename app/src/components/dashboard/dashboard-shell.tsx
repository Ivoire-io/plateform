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
import {
  BarChart2,
  Briefcase,
  BriefcaseBusiness,
  Clock,
  ExternalLink,
  Home,
  Layers,
  LogOut,
  Mail,
  Moon,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ExperiencesTab } from "./experiences-tab";
import { JobsTab } from "./jobs-tab";
import { MessagesTab } from "./messages-tab";
import { OverviewTab } from "./overview-tab";
import { ProfileTab } from "./profile-tab";
import { ProjectsTab } from "./projects-tab";
import { SettingsTab } from "./settings-tab";
import { StatsTab } from "./stats-tab";
import { TemplateTab } from "./template-tab";

type Tab =
  | "overview"
  | "profile"
  | "template"
  | "projects"
  | "experiences"
  | "messages"
  | "stats"
  | "jobs"
  | "settings";

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
  profile: initialProfile,
  initialProjects,
  initialExperiences,
}: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [profile, setProfile] = useState(initialProfile);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

  // Callback pour les mises à jour partielles du profil (depuis ProfileTab, avatar, etc.)
  // Met à jour l'état local sans re-fetch SSR
  function handleProfileUpdate(fields: Partial<typeof initialProfile & Record<string, unknown>>) {
    setProfile((prev) => prev ? { ...prev, ...fields } as typeof prev : prev);
  }

  const fetchUnread = useCallback(async () => {
    if (!profile) return;
    try {
      const res = await fetch("/api/dashboard/messages");
      if (res.ok) {
        const data = await res.json();
        const count = (data.messages ?? []).filter((m: { is_read: boolean }) => !m.is_read).length;
        setUnreadMessages(count);
      }
    } catch {
      // non bloquant
    }
  }, [profile]);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const tabTitles: Record<Tab, string> = {
    overview: "Vue d'ensemble",
    profile: "Mon Profil",
    template: "Template",
    projects: "Projets",
    experiences: "Expériences",
    messages: "Messages",
    stats: "Statistiques",
    jobs: "Emploi",
    settings: "Paramètres",
  };

  return (
    <SidebarProvider>
      <Toaster position="top-right" richColors theme={mounted && resolvedTheme === "light" ? "light" : "dark"} />

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
          {/* GÉNÉRAL */}
          <SidebarGroup>
            <SidebarGroupLabel>Général</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
                    <Home />
                    <span>Vue d&apos;ensemble</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "profile"} onClick={() => setActiveTab("profile")}>
                    <User />
                    <span>Mon Profil</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "template"} onClick={() => setActiveTab("template")}>
                    <Layers />
                    <span>Template</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* CONTENU */}
          <SidebarGroup>
            <SidebarGroupLabel>Contenu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "projects"} onClick={() => setActiveTab("projects")}>
                    <Briefcase />
                    <span>Projets</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "experiences"} onClick={() => setActiveTab("experiences")}>
                    <Clock />
                    <span>Expériences</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* INTERACTIONS */}
          <SidebarGroup>
            <SidebarGroupLabel>Interactions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "messages"} onClick={() => setActiveTab("messages")}>
                    <Mail />
                    <span>Messages</span>
                    {unreadMessages > 0 && (
                      <span
                        className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: "var(--color-orange)", color: "#fff" }}
                      >
                        {unreadMessages}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "stats"} onClick={() => setActiveTab("stats")}>
                    <BarChart2 />
                    <span>Statistiques</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* EMPLOI */}
          <SidebarGroup>
            <SidebarGroupLabel>Emploi</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "jobs"} onClick={() => setActiveTab("jobs")}>
                    <BriefcaseBusiness />
                    <span>Offres & Candidatures</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* COMPTE */}
          <SidebarGroup>
            <SidebarGroupLabel>Compte</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
                    <Settings />
                    <span>Paramètres</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
          <div className="ml-auto">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border hover:border-orange-400 transition-colors"
              title={mounted ? (resolvedTheme === "dark" ? "Passer en mode clair" : "Passer en mode sombre") : "Thème"}
              suppressHydrationWarning
            >
              {!mounted || resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4" style={{ color: "var(--color-orange)" }} />
              ) : (
                <Moon className="w-4 h-4" style={{ color: "var(--color-orange)" }} />
              )}
            </button>
          </div>
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

          {profile && activeTab === "overview" && (
            <OverviewTab
              profile={profile}
              projects={initialProjects}
              experiences={initialExperiences}
              unreadMessages={unreadMessages}
              onNavigate={(tab) => setActiveTab(tab as Tab)}
            />
          )}
          {profile && activeTab === "profile" && (
            <ProfileTab
              profile={profile}
              onProfileUpdate={handleProfileUpdate}
            />
          )}
          {profile && activeTab === "template" && (
            <TemplateTab profile={profile} />
          )}
          {profile && activeTab === "projects" && (
            <ProjectsTab profileId={profile.id} initialProjects={initialProjects} />
          )}
          {profile && activeTab === "experiences" && (
            <ExperiencesTab profileId={profile.id} initialExperiences={initialExperiences} />
          )}
          {profile && activeTab === "messages" && (
            <MessagesTab />
          )}
          {profile && activeTab === "stats" && (
            <StatsTab />
          )}
          {profile && activeTab === "jobs" && (
            <JobsTab profile={profile} />
          )}
          {profile && activeTab === "settings" && (
            <SettingsTab profile={profile} userEmail={userEmail} />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

