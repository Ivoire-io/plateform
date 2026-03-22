import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Tables Supabase ───
export const TABLES = {
  profiles: "ivoireio_profiles",
  projects: "ivoireio_projects",
  experiences: "ivoireio_experiences",
  waitlist: "ivoireio_waitlist",
  contact_messages: "ivoireio_contact_messages",
  portfolio_views: "ivoireio_portfolio_views",
  link_clicks: "ivoireio_link_clicks",
  feature_flags: "ivoireio_feature_flags",
  flag_history: "ivoireio_flag_history",
  broadcasts: "ivoireio_broadcasts",
  reports: "ivoireio_reports",
  certifications: "ivoireio_certifications",
  admin_logs: "ivoireio_admin_logs",
  platform_config: "ivoireio_platform_config",
  templates: "ivoireio_templates",
  startups: "ivoireio_startups",
  startup_upvotes: "ivoireio_startup_upvotes",
  team_members: "ivoireio_team_members",
  products: "ivoireio_products",
  fundraising: "ivoireio_fundraising",
  investors: "ivoireio_investors",
  fundraising_documents: "ivoireio_fundraising_documents",
  job_listings: "ivoireio_job_listings",
  subscriptions: "ivoireio_subscriptions",
  payments: "ivoireio_payments",
  referrals: "ivoireio_referrals",
  credits: "ivoireio_credits",
  ai_usage: "ivoireio_ai_usage",
  ai_cache: "ivoireio_ai_cache",
  dev_requests: "ivoireio_dev_requests",
  dev_quotes: "ivoireio_dev_quotes",
  dev_projects: "ivoireio_dev_projects",
  plans: "ivoireio_plans",
  packs: "ivoireio_packs",
  pack_purchases: "ivoireio_pack_purchases",
} as const;

// ─── Sous-domaines réservés ───
export const RESERVED_SUBDOMAINS = new Set([
  "www", "mail", "api", "admin", "app", "devs", "startups",
  "jobs", "learn", "health", "data", "events", "invest",
  "blog", "docs", "status",
  "dashboard", "login", "auth", "logout",
]);

// ─── Validation slug ───
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$/.test(slug);
}

// ─── Extraction sous-domaine ───
export function getSubdomain(hostname: string): string | null {
  const cleanHost = hostname.replace(/:\d+$/, "");
  const parts = cleanHost.split(".");
  if (parts.length === 1) return null;
  if (cleanHost.endsWith("lvh.me")) return parts.length >= 3 ? parts[0] : null;
  if (cleanHost.endsWith(".localhost")) return parts[0];
  if (parts.length >= 3) {
    const sub = parts[0];
    return sub === "www" ? null : sub;
  }
  return null;
}
