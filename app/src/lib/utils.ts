import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Sous-domaines réservés (ne peuvent pas être pris par un utilisateur)
export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "mail",
  "api",
  "admin",
  "app",
  "devs",
  "startups",
  "jobs",
  "learn",
  "health",
  "data",
  "events",
  "invest",
  "blog",
  "docs",
  "status",
]);

// Extraire le sous-domaine à partir du hostname
export function getSubdomain(hostname: string): string | null {
  // Local dev: slug.localhost:3000 or slug.lvh.me:3000
  const cleanHost = hostname.replace(/:\d+$/, "");

  // Prod: slug.ivoire.io
  const parts = cleanHost.split(".");

  // localhost → pas de sous-domaine
  if (parts.length === 1) return null;

  // lvh.me (2 parts) → pas de sous-domaine, slug.lvh.me (3 parts) → slug
  if (cleanHost.endsWith("lvh.me")) {
    return parts.length >= 3 ? parts[0] : null;
  }

  // ivoire.io (2 parts) → pas de sous-domaine
  // slug.ivoire.io (3 parts) → slug
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

// Valider un slug (lettres, chiffres, tirets, 3-30 caractères)
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(slug);
}

// Préfixe table Supabase
export const TABLE_PREFIX = "ivoireio_";

// Noms de tables
export const TABLES = {
  profiles: `${TABLE_PREFIX}profiles`,
  projects: `${TABLE_PREFIX}projects`,
  experiences: `${TABLE_PREFIX}experiences`,
  waitlist: `${TABLE_PREFIX}waitlist`,
  contact_messages: `${TABLE_PREFIX}contact_messages`,
} as const;
