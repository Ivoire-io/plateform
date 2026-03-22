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
  Code,
  Cpu,
  CreditCard,
  Database,
  FileText,
  Flag,
  Gift,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Palette,
  Phone,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminAIUsageTab } from "./tabs/ai-usage-tab";
import { AdminBlogTab } from "./tabs/blog-tab";
import { AdminDevPipelineTab } from "./tabs/dev-pipeline-tab";
import { AdminDynamicFieldsTab } from "./tabs/dynamic-fields-tab";
import { AdminPaymentProvidersTab } from "./tabs/payment-providers-tab";
import { AdminPaymentsTab } from "./tabs/payments-tab";
import { AdminReferralsTab } from "./tabs/referrals-tab";
import { AdminWhatsAppTab } from "./tabs/whatsapp-tab";

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
  | "plans"
  | "packs"
  | "config"
  | "logs"
  | "flags"
  | "broadcasting"
  | "templates"
  | "payments"
  | "ai-usage"
  | "referrals"
  | "dev-pipeline"
  | "payment-providers"
  | "blog"
  | "dynamic-fields"
  | "whatsapp";

interface AdminShellProps {
  adminEmail: string;
  adminProfile: Profile | null;
  children: React.ReactNode;
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
  plans: "Gestion des Plans",
  packs: "Gestion des Packs",
  config: "Configuration",
  logs: "Logs d'activité",
  flags: "Feature Flags",
  broadcasting: "Broadcasting",
  templates: "Templates",
  payments: "Paiements",
  "ai-usage": "Couts IA",
  referrals: "Parrainage",
  "dev-pipeline": "Dev Outsourcing",
  "payment-providers": "Providers Paiement",
  blog: "Blog",
  "dynamic-fields": "Champs Dynamiques",
  whatsapp: "WhatsApp",
};

interface NavItemProps {
  id: AdminTab;
  label: string;
  Icon: React.ElementType;
  href: string;
  badge?: number;
  activeTab: AdminTab;
}

function NavItem({ id, label, Icon, href, badge, activeTab }: NavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={activeTab === id} render={<Link href={href} />}>
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

function tabFromPath(pathname: string): AdminTab {
  const p = pathname.replace(/\/+$/, "");
  if (p === "/admin" || p === "") return "overview";
  const segment = p.split("/")[2] ?? "overview";
  const allowed: Set<AdminTab> = new Set([
    "overview",
    "users",
    "waitlist",
    "startups",
    "jobs",
    "messages",
    "moderation",
    "analytics",
    "subscriptions",
    "plans",
    "packs",
    "config",
    "logs",
    "flags",
    "broadcasting",
    "templates",
    "payments",
    "ai-usage",
    "referrals",
    "dev-pipeline",
    "payment-providers",
    "blog",
    "dynamic-fields",
    "whatsapp",
  ]);
  return allowed.has(segment as AdminTab) ? (segment as AdminTab) : "overview";
}

export function AdminShell({ adminEmail, adminProfile, children }: AdminShellProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const activeTab = tabFromPath(pathname || "/admin");

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
                <NavItem id="overview" label="Dashboard" Icon={LayoutDashboard} href="/admin/overview" activeTab={activeTab} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Utilisateurs */}
          <SidebarGroup>
            <SidebarGroupLabel>Utilisateurs</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem id="users" label="Profils" Icon={Users} href="/admin/users" badge={stats?.totalProfiles || undefined} activeTab={activeTab} />
                <NavItem id="waitlist" label="Waitlist" Icon={Clock} href="/admin/waitlist" badge={stats?.waitlistPending || undefined} activeTab={activeTab} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Contenu */}
          <SidebarGroup>
            <SidebarGroupLabel>Contenu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem id="startups" label="Startups" Icon={Activity} href="/admin/startups" badge={stats?.startups || undefined} activeTab={activeTab} />
                <NavItem id="jobs" label="Offres d&apos;emploi" Icon={Briefcase} href="/admin/jobs" activeTab={activeTab} />
                <NavItem id="messages" label="Messages" Icon={MessageSquare} href="/admin/messages" badge={stats?.messages || undefined} activeTab={activeTab} />
                <NavItem id="blog" label="Blog" Icon={FileText} href="/admin/blog" activeTab={activeTab} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Modération */}
          <SidebarGroup>
            <SidebarGroupLabel>Modération</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem id="moderation" label="Signalements" Icon={AlertTriangle} href="/admin/moderation" badge={stats?.reports || undefined} activeTab={activeTab} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Business */}
          <SidebarGroup>
            <SidebarGroupLabel>Business</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem id="analytics" label="Analytics" Icon={BarChart3} href="/admin/analytics" activeTab={activeTab} />
                <NavItem id="subscriptions" label="Abonnements" Icon={CreditCard} href="/admin/subscriptions" activeTab={activeTab} />
                <NavItem id="payments" label="Paiements" Icon={CreditCard} href="/admin/payments" activeTab={activeTab} />
                <NavItem id="ai-usage" label="Couts IA" Icon={Cpu} href="/admin/ai-usage" activeTab={activeTab} />
                <NavItem id="referrals" label="Parrainage" Icon={Gift} href="/admin/referrals" activeTab={activeTab} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Dev Outsourcing */}
          <SidebarGroup>
            <SidebarGroupLabel>Dev Outsourcing</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem id="dev-pipeline" label="Pipeline Dev" Icon={Code} href="/admin/dev-pipeline" activeTab={activeTab} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Contrôle */}
          <SidebarGroup>
            <SidebarGroupLabel>Contrôle</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem id="flags" label="Feature Flags" Icon={Flag} href="/admin/flags" activeTab={activeTab} />
                <NavItem id="broadcasting" label="Broadcasting" Icon={Bell} href="/admin/broadcasting" activeTab={activeTab} />
                <NavItem id="whatsapp" label="WhatsApp" Icon={Phone} href="/admin/whatsapp" activeTab={activeTab} />
                <NavItem id="templates" label="Templates" Icon={Palette} href="/admin/templates" activeTab={activeTab} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Système */}
          <SidebarGroup>
            <SidebarGroupLabel>Système</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem id="plans" label="Plans & Offres" Icon={Package} href="/admin/plans" activeTab={activeTab} />
                <NavItem id="packs" label="Packs" Icon={ShoppingBag} href="/admin/packs" activeTab={activeTab} />
                <NavItem id="payment-providers" label="Providers" Icon={Wallet} href="/admin/payment-providers" activeTab={activeTab} />
                <NavItem id="config" label="Configuration" Icon={Settings} href="/admin/config" activeTab={activeTab} />
                <NavItem id="dynamic-fields" label="Champs Dynamiques" Icon={Database} href="/admin/dynamic-fields" activeTab={activeTab} />
                <NavItem id="logs" label="Logs d&apos;activité" Icon={ShieldAlert} href="/admin/logs" activeTab={activeTab} />
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
          {children}
          {activeTab === "payments" && <AdminPaymentsTab />}
          {activeTab === "ai-usage" && <AdminAIUsageTab />}
          {activeTab === "referrals" && <AdminReferralsTab />}
          {activeTab === "dev-pipeline" && <AdminDevPipelineTab />}
          {activeTab === "payment-providers" && <AdminPaymentProvidersTab />}
          {activeTab === "blog" && <AdminBlogTab />}
          {activeTab === "dynamic-fields" && <AdminDynamicFieldsTab />}
          {activeTab === "whatsapp" && <AdminWhatsAppTab />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
