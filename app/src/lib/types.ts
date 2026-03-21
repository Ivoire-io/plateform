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
  is_admin: boolean;
  is_suspended: boolean;
  plan: "free" | "premium" | "enterprise";
  admin_notes: string | null;
  verified_badge: boolean;
  // Notifications & confidentialité
  notif_messages: boolean;
  notif_weekly_report: boolean;
  notif_news: boolean;
  privacy_visible_in_directory: boolean;
  privacy_show_email: boolean;
  template_id: string;
  created_at: string;
  updated_at: string;
}

// ─── Admin — Statistics ───

export interface AdminStats {
  total_profiles: number;
  total_startups: number;
  total_enterprises: number;
  total_jobs: number;
  waitlist_pending: number;
  messages_unread: number;
  reports_pending: number;
  mrr: number;
  new_this_month: number;
}

// ─── Admin — Feature Flags ───

export interface FeatureFlag {
  key: string;
  state: "off" | "beta" | "public";
  allowed_types: string[];
  allowed_emails: string[];
  coming_soon_message: string;
  updated_by: string | null;
  updated_at: string;
}

// ─── Admin — Broadcast ───

export interface Broadcast {
  id: string;
  subject: string;
  message: string;
  channels: string[];
  target_types: string[];
  target_plans: string[];
  target_cities: string[];
  schedule_at: string | null;
  status: "draft" | "scheduled" | "sent" | "cancelled";
  recipients_count: number;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
}

// ─── Admin — Report ───

export interface Report {
  id: string;
  reported_profile_id: string;
  reporter_id: string | null;
  reason: string;
  details: string | null;
  status: "pending" | "reviewed" | "ignored" | "actioned";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  reported_profile?: Profile;
}

// ─── Admin — Certification ───

export interface Certification {
  id: string;
  profile_id: string;
  documents: string[];
  status: "pending" | "approved" | "rejected";
  reviewer_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  profile?: Profile;
}

// ─── Admin — Log ───

export interface AdminLog {
  id: string;
  type: "profile" | "content" | "payment" | "waitlist" | "moderation" | "system" | "admin";
  description: string;
  actor_id: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ─── Admin — Template ───

export interface AdminTemplate {
  id: number;
  slug: string;
  name: string;
  icon: string;
  state: "off" | "beta" | "active";
  plan: "free" | "premium" | "enterprise";
  allowed_types: string[];
  usage_count: number;
  created_at: string;
}

// ─── Admin — Platform config ───

export interface PlatformConfig {
  key: string;
  value: unknown;
  updated_by: string | null;
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
  invited?: boolean;
  invited_at?: string | null;
  converted_profile_id?: string | null;
  converted_at?: string | null;
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

// ─── Startups ───

export interface Startup {
  id: string;
  profile_id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  website_url: string | null;
  sector: string;
  stage: string;
  city: string | null;
  team_size: number;
  founded_year: number | null;
  tech_stack: string[];
  social_links: Record<string, string>;
  is_hiring: boolean;
  status: "pending" | "approved" | "rejected" | "suspended";
  upvotes_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  profile?: Pick<Profile, "full_name" | "slug" | "avatar_url">;
}

export interface StartupUpvote {
  id: string;
  startup_id: string;
  voter_ip_hash: string;
  voter_profile_id: string | null;
  vote_date: string;
  created_at: string;
}

// ─── Team Members ───

export interface TeamMember {
  id: string;
  startup_id: string;
  name: string;
  role: string;
  email: string | null;
  linkedin: string | null;
  ivoireio_slug: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Products ───

export interface Product {
  id: string;
  startup_id: string;
  name: string;
  short_desc: string | null;
  long_desc: string | null;
  category: string;
  tech_stack: string[];
  website_url: string | null;
  app_store_url: string | null;
  play_store_url: string | null;
  docs_url: string | null;
  github_url: string | null;
  launch_date: string | null;
  publish_on_portal: boolean;
  votes_count: number;
  created_at: string;
  updated_at: string;
}

// ─── Fundraising ───

export interface Fundraising {
  id: string;
  startup_id: string;
  is_raising: "yes" | "no" | "hidden";
  raise_type: string;
  target_amount: number;
  raised_amount: number;
  show_progress_on_profile: boolean;
  created_at: string;
  updated_at: string;
  investors?: Investor[];
  documents?: FundraisingDocument[];
}

export interface Investor {
  id: string;
  fundraising_id: string;
  name: string;
  amount: number;
  status: "confirmed" | "negotiating" | "refused";
  created_at: string;
}

export interface FundraisingDocument {
  id: string;
  fundraising_id: string;
  doc_type: "pitch_deck" | "business_plan" | "one_pager";
  file_url: string;
  file_name: string;
  created_at: string;
}

// ─── Job Listings ───

export interface JobListing {
  id: string;
  startup_id: string | null;
  profile_id: string;
  title: string;
  company: string;
  location: string | null;
  type: "cdi" | "cdd" | "freelance" | "stage";
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  description: string | null;
  requirements: string[];
  tech_tags: string[];
  remote_ok: boolean;
  expires_at: string | null;
  status: "active" | "closed" | "draft";
  created_at: string;
  updated_at: string;
  startup?: Pick<Startup, "name" | "slug" | "logo_url">;
}

// ─── API responses ───

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
