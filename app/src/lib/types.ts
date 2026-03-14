// ─── Profiles ───

export interface Profile {
  id: string;
  slug: string;
  email: string;
  full_name: string;
  title: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  skills: string[];
  is_available: boolean;
  type: "developer" | "startup" | "enterprise" | "other";
  created_at: string;
  updated_at: string;
}

// ─── Projects ───

export interface Project {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  tech_stack: string[];
  github_url: string | null;
  demo_url: string | null;
  stars: number;
  sort_order: number;
  created_at: string;
}

// ─── Experiences ───

export interface Experience {
  id: string;
  profile_id: string;
  role: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}

// ─── Waitlist ───

export interface WaitlistEntry {
  id: string;
  email: string;
  full_name: string | null;
  desired_slug: string | null;
  whatsapp: string | null;
  type: "developer" | "startup" | "enterprise" | "other";
  created_at: string;
}

// ─── Contact Messages ───

export interface ContactMessage {
  id: string;
  profile_id: string;
  sender_name: string;
  sender_email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─── Subdomain routing ───

export type SubdomainType = "main" | "devs" | "startups" | "portfolio";

// ─── API responses ───

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
