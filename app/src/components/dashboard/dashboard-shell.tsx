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
  Blocks,
  Briefcase,
  BriefcaseBusiness,
  Calendar,
  Clock,
  Code,
  CreditCard,
  ExternalLink,
  Gift,
  Home,
  Layers,
  Lightbulb,
  LogOut,
  Mail,
  MessageSquare,
  Moon,
  Rocket,
  Settings,
  Sun,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppointmentsTab } from "./appointments-tab";
import { ConversationsTab } from "./conversations-tab";
import { DevOutsourcingTab } from "./dev-outsourcing-tab";
import { ExperiencesTab } from "./experiences-tab";
import { FundraisingTab } from "./fundraising-tab";
import { JobsTab } from "./jobs-tab";
import { MessagesTab } from "./messages-tab";
import { OnboardingWizard } from "./onboarding-wizard";
import { OverviewTab } from "./overview-tab";
import { ProductsTab } from "./products-tab";
import { ProfileTab } from "./profile-tab";
import { ProjectBuilderTab } from "./project-builder-tab";
import { ProjectsTab } from "./projects-tab";
import { ReferralTab } from "./referral-tab";
import { SettingsTab } from "./settings-tab";
import { StartupTab } from "./startup-tab";
import { StatsTab } from "./stats-tab";
import { SubscriptionTab } from "./subscription-tab";
import { TeamTab } from "./team-tab";
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
  | "startup"
  | "team"
  | "products"
  | "fundraising"
  | "settings"
  | "project-builder"
  | "subscription"
  | "referral"
  | "dev-outsourcing"
  | "conversations"
  | "appointments";

const tabTitles: Record<Tab, string> = {
  overview: "Tableau de bord",
  profile: "Éditer mon profil",
  template: "Template",
  projects: "Projets",
  experiences: "Experiences",
  messages: "Messages",
  stats: "Statistiques",
  jobs: "Emploi",
  startup: "Ma Startup",
  team: "Equipe",
  products: "Produits",
  fundraising: "Levee de fonds",
  settings: "Parametres",
  "project-builder": "Project Builder",
  subscription: "Abonnement",
  referral: "Parrainage",
  "dev-outsourcing": "Services Dev",
  conversations: "Conversations",
  appointments: "Rendez-vous",
};

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
  const searchParams = useSearchParams();
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Sync activeTab with URL ?tab= parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab") as Tab | null;
    if (tabParam && tabParam in tabTitles) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Update URL when tab changes
  function navigateTab(tab: Tab) {
    setActiveTab(tab);
    const url = tab === "overview" ? "/dashboard" : `/dashboard?tab=${tab}`;
    router.replace(url, { scroll: false });
  }

  useEffect(() => { setMounted(true); }, []);

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

  // Auto-apply referral code from localStorage (captured on landing/login page)
  useEffect(() => {
    if (!profile) return;
    const refCode = localStorage.getItem("ivoire_ref");
    if (!refCode) return;
    if (profile.referral_code === refCode) {
      localStorage.removeItem("ivoire_ref");
      return;
    }
    fetch("/api/dashboard/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referral_code: refCode }),
    })
      .then((res) => {
        if (res.ok) toast.success("Code de parrainage applique !");
        localStorage.removeItem("ivoire_ref");
      })
      .catch(() => {
        localStorage.removeItem("ivoire_ref");
      });
  }, [profile]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (profile && !profile.onboarding_completed) {
    return <OnboardingWizard profile={profile} onComplete={() => setProfile({ ...profile, onboarding_completed: true })} />;
  }

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
          {profile?.type === "startup" ? (
            /* ════════════════════════════════════════
               SIDEBAR STARTUP — navigation dédiée
               ════════════════════════════════════════ */
            <>
              {/* GÉNÉRAL */}
              <SidebarGroup>
                <SidebarGroupLabel>Général</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "overview"} onClick={() => navigateTab("overview")}>
                        <Home /><span>Tableau de bord</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "project-builder"} onClick={() => navigateTab("project-builder")}>
                        <Blocks /><span>Project Builder</span>
                        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-500">NEW</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "startup"} onClick={() => navigateTab("startup")}>
                        <Rocket /><span>Ma Startup</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "template"} onClick={() => navigateTab("template")}>
                        <Layers /><span>Template</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* ÉQUIPE & PRODUITS */}
              <SidebarGroup>
                <SidebarGroupLabel>Équipe &amp; Produits</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "team"} onClick={() => navigateTab("team")}>
                        <Users /><span>Équipe</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "products"} onClick={() => navigateTab("products")}>
                        <Lightbulb /><span>Produits</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* CROISSANCE */}
              <SidebarGroup>
                <SidebarGroupLabel>Croissance</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "messages"} onClick={() => navigateTab("messages")}>
                        <Mail /><span>Messages</span>
                        {unreadMessages > 0 && (
                          <span className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "var(--color-orange)", color: "#fff" }}>
                            {unreadMessages}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "stats"} onClick={() => navigateTab("stats")}>
                        <BarChart2 /><span>Statistiques</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "fundraising"} onClick={() => navigateTab("fundraising")}>
                        <TrendingUp /><span>Levée de fonds</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "dev-outsourcing"} onClick={() => navigateTab("dev-outsourcing")}>
                        <Code className="h-4 w-4" />
                        Services Dev
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "conversations"} onClick={() => navigateTab("conversations")}>
                        <MessageSquare className="h-4 w-4" />
                        <span>Conversations</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "appointments"} onClick={() => navigateTab("appointments")}>
                        <Calendar className="h-4 w-4" />
                        <span>Rendez-vous</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* RECRUTEMENT */}
              <SidebarGroup>
                <SidebarGroupLabel>Recrutement</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "jobs"} onClick={() => navigateTab("jobs")}>
                        <BriefcaseBusiness /><span>Offres &amp; Pipeline</span>
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
                      <SidebarMenuButton isActive={activeTab === "subscription"} onClick={() => navigateTab("subscription")}>
                        <CreditCard className="h-4 w-4" />
                        Abonnement
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "referral"} onClick={() => navigateTab("referral")}>
                        <Gift className="h-4 w-4" />
                        Parrainage
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "settings"} onClick={() => navigateTab("settings")}>
                        <Settings /><span>Paramètres</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          ) : (
            /* ════════════════════════════════════════
               SIDEBAR DÉVELOPPEUR / AUTRE
               ════════════════════════════════════════ */
            <>
              {/* GÉNÉRAL */}
              <SidebarGroup>
                <SidebarGroupLabel>Général</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "overview"} onClick={() => navigateTab("overview")}>
                        <Home /><span>Tableau de bord</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "profile"} onClick={() => navigateTab("profile")}>
                        <User /><span>Éditer mon profil</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "template"} onClick={() => navigateTab("template")}>
                        <Layers /><span>Template</span>
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
                      <SidebarMenuButton isActive={activeTab === "projects"} onClick={() => navigateTab("projects")}>
                        <Briefcase /><span>Projets</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "experiences"} onClick={() => navigateTab("experiences")}>
                        <Clock /><span>Expériences</span>
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
                      <SidebarMenuButton isActive={activeTab === "messages"} onClick={() => navigateTab("messages")}>
                        <Mail /><span>Messages</span>
                        {unreadMessages > 0 && (
                          <span className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "var(--color-orange)", color: "#fff" }}>
                            {unreadMessages}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "stats"} onClick={() => navigateTab("stats")}>
                        <BarChart2 /><span>Statistiques</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "conversations"} onClick={() => navigateTab("conversations")}>
                        <MessageSquare className="h-4 w-4" />
                        <span>Conversations</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "appointments"} onClick={() => navigateTab("appointments")}>
                        <Calendar className="h-4 w-4" />
                        <span>Rendez-vous</span>
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
                      <SidebarMenuButton isActive={activeTab === "jobs"} onClick={() => navigateTab("jobs")}>
                        <BriefcaseBusiness /><span>Offres &amp; Candidatures</span>
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
                      <SidebarMenuButton isActive={activeTab === "subscription"} onClick={() => navigateTab("subscription")}>
                        <CreditCard className="h-4 w-4" />
                        Abonnement
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "referral"} onClick={() => navigateTab("referral")}>
                        <Gift className="h-4 w-4" />
                        Parrainage
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive={activeTab === "settings"} onClick={() => navigateTab("settings")}>
                        <Settings /><span>Paramètres</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            {profile && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <a
                      href={profile.type === "startup"
                        ? `https://${profile.slug}.ivoire.io`
                        : `https://${profile.slug}.ivoire.io`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <ExternalLink />
                  <span>{profile.type === "startup" ? "Voir ma vitrine" : "Voir mon portfolio"}</span>
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
              onNavigate={(tab) => navigateTab(tab as Tab)}
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
          {profile && activeTab === "startup" && profile.type === "startup" && (
            <StartupTab />
          )}
          {profile && activeTab === "project-builder" && profile.type === "startup" && (
            <ProjectBuilderTab profile={profile} onNavigate={(tab) => setActiveTab(tab as Tab)} />
          )}
          {profile && activeTab === "team" && profile.type === "startup" && (
            <TeamTab startupId={profile.id} />
          )}
          {profile && activeTab === "products" && profile.type === "startup" && (
            <ProductsTab startupId={profile.id} />
          )}
          {profile && activeTab === "fundraising" && profile.type === "startup" && (
            <FundraisingTab startupId={profile.id} />
          )}
          {profile && activeTab === "settings" && (
            <SettingsTab profile={profile} userEmail={userEmail} onNavigate={(tab) => navigateTab(tab as Tab)} />
          )}
          {profile && activeTab === "subscription" && <SubscriptionTab profileType={profile.type} />}
          {profile && activeTab === "referral" && <ReferralTab />}
          {profile && activeTab === "dev-outsourcing" && profile.type === "startup" && <DevOutsourcingTab startupId={profile.id} onNavigate={(tab) => navigateTab(tab as Tab)} />}
          {profile && activeTab === "conversations" && <ConversationsTab profileId={profile.id} />}
          {profile && activeTab === "appointments" && <AppointmentsTab profileId={profile.id} />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

