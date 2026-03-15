"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import type { Profile } from "@/lib/types";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Briefcase,
  ChevronRight,
  Clock,
  CreditCard,
  Flag,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Palette,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminAnalyticsTab } from "./tabs/analytics-tab";
import { AdminBroadcastingTab } from "./tabs/broadcasting-tab";
import { AdminConfigTab } from "./tabs/config-tab";
import { AdminFeatureFlagsTab } from "./tabs/feature-flags-tab";
import { AdminLogsTab } from "./tabs/logs-tab";
import { AdminMessagesTab } from "./tabs/messages-tab";
import { AdminModerationTab } from "./tabs/moderation-tab";
import { AdminOverviewTab } from "./tabs/overview-tab";
import { AdminSubscriptionsTab } from "./tabs/subscriptions-tab";
import { AdminTemplatesTab } from "./tabs/templates-tab";
import { AdminUsersTab } from "./tabs/users-tab";
import { AdminWaitlistTab } from "./tabs/waitlist-tab";

export type AdminTab =
  | "overview"
  | "users"
  | "waitlist"
  | "startups"
  | "jobs"
  | "messages"
  | "moderation"
  | "analytics"
  | "subscriptions"
  | "config"
  | "logs"
  | "flags"
  | "broadcasting"
  | "templates";

interface AdminShellProps {
  adminEmail: string;
  adminProfile: Profile | null;
}

const tabTitles: Record<AdminTab, string> = {
  overview: "Dashboard",
  users: "Profils",
  waitlist: "Waitlist",
  startups: "Startups",
  jobs: "Offres d'emploi",
  messages: "Messages Contact",
  moderation: "Modération",
  analytics: "Analytics",
  subscriptions: "Abonnements & Revenus",
  config: "Configuration",
  logs: "Logs d'activité",
  flags: "Feature Flags",
  broadcasting: "Broadcasting",
  templates: "Templates",
};

interface NavItemProps {
  id: AdminTab;
  label: string;
  Icon: React.ElementType;
  badge?: number;
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

function NavItem({ id, label, Icon, badge, activeTab, setActiveTab }: NavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={activeTab === id} onClick={() => setActiveTab(id)}>
        <Icon className="h-4 w-4" />
        <span>{label}</span>
        {badge ? (
          <Badge
            className="ml-auto h-5 min-w-5 justify-center px-1 text-[10px]"
            style={{ background: "var(--color-orange)", color: "white", border: "none" }}
          >
            {badge}
          </Badge>
        ) : null}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AdminShell({ adminEmail, adminProfile }: AdminShellProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);
  const [stats, setStats] = useState<{
    totalProfiles: number;
    waitlistPending: number;
    startups: number;
    messages: number;
    reports: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => { });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <SidebarProvider>
      <Toaster position="top-right" richColors theme={mounted && resolvedTheme === "light" ? "light" : "dark"} />

      {/* ─── Sidebar Admin ─── */}
      <Sidebar>
        <SidebarHeader>
          <div className="px-1 py-1">
            <Link href="/" className="flex items-center gap-0.5 mb-3">
              <span className="text-sm font-bold text-foreground">ivoire</span>
              <span className="text-sm font-bold" style={{ color: "var(--color-orange)" }}>.io</span>
              <Badge
                className="ml-2 text-[9px] h-4 px-1.5"
                style={{ background: "color-mix(in srgb, var(--color-orange) 15%, transparent)", color: "var(--color-orange)", border: "1px solid color-mix(in srgb,var(--color-orange) 30%,transparent)" }}
              >
                ADMIN
              </Badge>
            </Link>

            <div className="flex items-center gap-3">
              <Avatar size="default">
                {adminProfile?.avatar_url && (
                  <AvatarImage src={adminProfile.avatar_url} alt={adminProfile.full_name} />
                )}
                <AvatarFallback
                  className="font-semibold text-sm"
                  style={{ background: "var(--color-surface)", color: "var(--color-orange)" }}
                >
                  {(adminProfile?.full_name ?? adminEmail).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  {adminProfile?.full_name ?? "Admin"}
                </span>
                <span className="text-xs text-muted-foreground truncate">{adminEmail}</span>
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Vue générale */}
          <SidebarGroup>
            <SidebarGroupLabel>Vue Générale</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem id="overview" label="Dashboard" Icon={LayoutDashboard} activeTab={activeTab} setActiveTab={setActiveTab} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Utilisateurs */}
          <SidebarGroup>
            <SidebarGroupLabel>Utilisateurs</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem id="users" label="Profils" Icon={Users} badge={stats?.totalProfiles || undefined} activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavItem id="waitlist" label="Waitlist" Icon={Clock} badge={stats?.waitlistPending || undefined} activeTab={activeTab} setActiveTab={setActiveTab} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Contenu */}
          <SidebarGroup>
            <SidebarGroupLabel>Contenu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem id="startups" label="Startups" Icon={Activity} badge={stats?.startups || undefined} activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavItem id="jobs" label="Offres d&apos;emploi" Icon={Briefcase} activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavItem id="messages" label="Messages" Icon={MessageSquare} badge={stats?.messages || undefined} activeTab={activeTab} setActiveTab={setActiveTab} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Modération */}
          <SidebarGroup>
            <SidebarGroupLabel>Modération</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem id="moderation" label="Signalements" Icon={AlertTriangle} badge={stats?.reports || undefined} activeTab={activeTab} setActiveTab={setActiveTab} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Business */}
          <SidebarGroup>
            <SidebarGroupLabel>Business</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem id="analytics" label="Analytics" Icon={BarChart3} activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavItem id="subscriptions" label="Abonnements" Icon={CreditCard} activeTab={activeTab} setActiveTab={setActiveTab} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Contrôle */}
          <SidebarGroup>
            <SidebarGroupLabel>Contrôle</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem id="flags" label="Feature Flags" Icon={Flag} activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavItem id="broadcasting" label="Broadcasting" Icon={Bell} activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavItem id="templates" label="Templates" Icon={Palette} activeTab={activeTab} setActiveTab={setActiveTab} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Système */}
          <SidebarGroup>
            <SidebarGroupLabel>Système</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem id="config" label="Configuration" Icon={Settings} activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavItem id="logs" label="Logs d&apos;activité" Icon={ShieldAlert} activeTab={activeTab} setActiveTab={setActiveTab} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/dashboard" />}
              >
                <ChevronRight className="h-4 w-4" />
                <span>Dashboard utilisateur</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
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
            <span className="text-muted-foreground">admin</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="font-medium">{tabTitles[activeTab]}</span>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Badge
              style={{ background: "color-mix(in srgb,#ef4444 15%,transparent)", color: "#ef4444", border: "1px solid color-mix(in srgb,#ef4444 30%,transparent)" }}
              className="text-xs"
            >
              🔴 Administration
            </Badge>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {activeTab === "overview" && <AdminOverviewTab onNavigate={setActiveTab} />}
          {activeTab === "users" && <AdminUsersTab />}
          {activeTab === "waitlist" && <AdminWaitlistTab />}
          {activeTab === "startups" && <AdminUsersTab filterType="startup" />}
          {activeTab === "jobs" && <AdminUsersTab filterType="enterprise" showJobsMode />}
          {activeTab === "messages" && <AdminMessagesTab />}
          {activeTab === "moderation" && <AdminModerationTab />}
          {activeTab === "analytics" && <AdminAnalyticsTab />}
          {activeTab === "subscriptions" && <AdminSubscriptionsTab />}
          {activeTab === "config" && <AdminConfigTab />}
          {activeTab === "logs" && <AdminLogsTab />}
          {activeTab === "flags" && <AdminFeatureFlagsTab />}
          {activeTab === "broadcasting" && <AdminBroadcastingTab />}
          {activeTab === "templates" && <AdminTemplatesTab />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
