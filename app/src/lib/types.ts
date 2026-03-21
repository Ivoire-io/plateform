// ─── Plan Tiers ───

export type PlanTier = "free" | "starter" | "pro" | "enterprise" | "student";

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
  plan: PlanTier;
  referral_code: string | null;
  referred_by: string | null;
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
  plan: PlanTier;
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

// ─── Subscriptions ───

export interface Subscription {
  id: string;
  profile_id: string;
  plan: PlanTier;
  payment_method: "manual" | "paypal" | "wave" | "orange_money" | "credit" | "admin" | null;
  status: "active" | "pending" | "expired" | "cancelled" | "suspended";
  amount: number;
  currency: string;
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  profile?: Pick<Profile, "full_name" | "slug" | "avatar_url" | "email" | "type">;
}

// ─── Payments ───

export interface Payment {
  id: string;
  profile_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  payment_method: "manual" | "paypal" | "wave" | "orange_money" | "credit";
  status: "pending" | "completed" | "failed" | "refunded" | "cancelled";
  proof_url: string | null;
  proof_file_name: string | null;
  bank_reference: string | null;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  profile?: Pick<Profile, "full_name" | "slug" | "email">;
}

// ─── Referrals ───

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  status: "pending" | "converted" | "rewarded";
  reward_type: "credit" | "upgrade" | "regeneration" | null;
  reward_amount: number | null;
  created_at: string;
  converted_at: string | null;
  referrer?: Pick<Profile, "full_name" | "slug" | "avatar_url">;
  referred?: Pick<Profile, "full_name" | "slug" | "avatar_url">;
}

// ─── Credits ───

export interface Credit {
  id: string;
  profile_id: string;
  amount: number;
  source: "referral" | "purchase" | "promo" | "admin" | "refund";
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

// ─── AI Usage ───

export interface AIUsageRecord {
  id: string;
  profile_id: string;
  task: string;
  provider: "openai" | "anthropic" | "crunai";
  model: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  cost_fcfa: number;
  cached: boolean;
  cache_key: string | null;
  duration_ms: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ─── Dev Outsourcing ───

export interface DevRequest {
  id: string;
  startup_id: string;
  profile_id: string;
  title: string;
  description: string | null;
  cahier_charges_ref: string | null;
  required_roles: string[];
  budget_min: number | null;
  budget_max: number | null;
  timeline: string | null;
  payment_type: "one_shot" | "installments" | "partnership";
  installments_count: number;
  partnership_percentage: number | null;
  discount_percentage: number;
  status: "draft" | "submitted" | "reviewing" | "quoted" | "accepted" | "in_progress" | "completed" | "cancelled";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  startup?: Pick<Startup, "name" | "slug" | "logo_url">;
  quotes?: DevQuote[];
}

export interface DevQuote {
  id: string;
  dev_request_id: string;
  amount: number;
  currency: string;
  timeline: string | null;
  scope: string | null;
  tech_stack: string[];
  team_composition: Array<{ role: string; count: number }>;
  payment_schedule: Array<{ milestone: string; amount: number; due: string }>;
  discount_applied: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  valid_until: string | null;
  admin_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DevProject {
  id: string;
  dev_request_id: string;
  dev_quote_id: string;
  startup_id: string;
  title: string;
  status: "setup" | "in_progress" | "review" | "completed" | "paused" | "cancelled";
  progress: number;
  total_amount: number;
  paid_amount: number;
  current_milestone: string | null;
  milestones: Array<{
    name: string;
    amount: number;
    status: "pending" | "in_progress" | "completed" | "paid";
    due: string;
  }>;
  team_assigned: Array<{ name: string; role: string; profile_slug?: string }>;
  started_at: string | null;
  completed_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  startup?: Pick<Startup, "name" | "slug" | "logo_url">;
}

// ─── Payment Provider Config ───

export interface PaymentProviderConfig {
  manual: {
    enabled: boolean;
    bank_name: string;
    account_number: string;
    account_name: string;
    instructions: string;
  };
  paypal: {
    enabled: boolean;
    mode: "sandbox" | "live";
  };
  wave: { enabled: boolean };
  orange_money: { enabled: boolean };
}

// ─── Plan Feature Limits ───

export interface PlanLimits {
  max_projects: number | null;
  max_team_members: number | null;
  max_products: number | null;
  max_job_listings: number | null;
  max_ai_generations_per_day: number | null;
  max_logo_variations: number;
  max_regenerations: number | null;
  allowed_templates: "free" | "free+1" | "all" | "all+corporate";
  features: {
    pitch_deck: boolean;
    cahier_charges: boolean;
    business_plan: boolean;
    one_pager: boolean;
    cgu: boolean;
    roadmap: boolean;
    competitors_analysis: boolean;
    oapi_check: boolean;
    timestamp: boolean;
    export_pdf: boolean;
    fundraising: boolean;
    advanced_stats: boolean;
    verified_badge: boolean;
    priority_visibility: boolean;
    homepage_featured: boolean;
    dev_outsourcing: boolean;
  };
}
