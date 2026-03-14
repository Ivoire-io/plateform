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
  if (parts.length >= 3) {
    const sub = parts[0];
    return sub === "www" ? null : sub;
  }
  return null;
}
