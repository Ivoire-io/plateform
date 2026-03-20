/**
 * Tests unitaires — Types TypeScript
 * Vérifie que les types sont cohérents et exhaustifs.
 */
import type {
  AdminLog,
  AdminStats,
  AdminTemplate,
  Broadcast,
  Certification,
  ContactMessage,
  Experience,
  FeatureFlag,
  PlatformConfig,
  Profile,
  Project,
  Report,
  Startup,
  StartupUpvote,
  WaitlistEntry,
} from "@/lib/types";
import { describe, expect, it } from "vitest";

describe("Type definitions", () => {
  it("Profile contient tous les champs requis", () => {
    const profile: Profile = {
      id: "uuid",
      slug: "test",
      email: "test@test.com",
      full_name: "Test User",
      title: null,
      city: null,
      bio: null,
      avatar_url: null,
      github_url: null,
      linkedin_url: null,
      twitter_url: null,
      website_url: null,
      skills: [],
      is_available: true,
      type: "developer",
      is_admin: false,
      is_suspended: false,
      plan: "free",
      admin_notes: null,
      verified_badge: false,
      notif_messages: true,
      notif_weekly_report: true,
      notif_news: true,
      privacy_visible_in_directory: true,
      privacy_show_email: false,
      template_id: "minimal-dark",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(profile.type).toBe("developer");
    expect(profile.plan).toBe("free");
  });

  it("Startup contient tous les champs requis", () => {
    const startup: Startup = {
      id: "uuid",
      profile_id: "uuid",
      name: "TestStartup",
      slug: "teststartup",
      tagline: "A test startup",
      description: null,
      logo_url: null,
      cover_url: null,
      website_url: null,
      sector: "tech",
      stage: "mvp",
      city: "Abidjan",
      team_size: 3,
      founded_year: 2025,
      tech_stack: ["React", "Node.js"],
      social_links: {},
      is_hiring: false,
      status: "pending",
      upvotes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    expect(startup.status).toBe("pending");
    expect(startup.tech_stack).toHaveLength(2);
  });

  it("StartupUpvote contient tous les champs", () => {
    const upvote: StartupUpvote = {
      id: "uuid",
      startup_id: "uuid",
      voter_ip_hash: "abc123",
      voter_profile_id: null,
      created_at: new Date().toISOString(),
    };
    expect(upvote.voter_profile_id).toBeNull();
  });

  it("FeatureFlag a les bons types d'état", () => {
    const flag: FeatureFlag = {
      key: "startups",
      state: "beta",
      allowed_types: ["developer"],
      allowed_emails: [],
      coming_soon_message: "Bientôt",
      updated_by: null,
      updated_at: new Date().toISOString(),
    };
    expect(["off", "beta", "public"]).toContain(flag.state);
  });

  it("WaitlistEntry a les bons types", () => {
    const entry: WaitlistEntry = {
      id: "uuid",
      email: "test@test.com",
      full_name: "Test",
      desired_slug: "test",
      whatsapp: null,
      type: "developer",
      created_at: new Date().toISOString(),
    };
    expect(["developer", "startup", "enterprise", "other"]).toContain(entry.type);
  });

  it("tous les types de plan profil existent", () => {
    const plans: Profile["plan"][] = ["free", "premium", "enterprise"];
    expect(plans).toHaveLength(3);
  });

  it("tous les statuts de startup existent", () => {
    const statuses: Startup["status"][] = ["pending", "approved", "rejected", "suspended"];
    expect(statuses).toHaveLength(4);
  });

  // Vérification de cohérence des types non-utilisés (compile-time check)
  it("AdminStats, AdminLog, AdminTemplate, Broadcast, etc. sont exportés", () => {
    const stats: AdminStats = {
      total_profiles: 0, total_startups: 0, total_enterprises: 0, total_jobs: 0,
      waitlist_pending: 0, messages_unread: 0, reports_pending: 0, mrr: 0, new_this_month: 0,
    };
    expect(stats).toBeDefined();

    const log: AdminLog = {
      id: "uuid", type: "system", description: "test", actor_id: null,
      target_id: null, metadata: {}, created_at: new Date().toISOString(),
    };
    expect(log).toBeDefined();

    const template: AdminTemplate = {
      id: 1, slug: "test", name: "Test", icon: "🔥", state: "active",
      plan: "free", allowed_types: [], usage_count: 0, created_at: new Date().toISOString(),
    };
    expect(template).toBeDefined();

    const broadcast: Broadcast = {
      id: "uuid", subject: "test", message: "test", channels: [], target_types: [],
      target_plans: [], target_cities: [], schedule_at: null, status: "draft",
      recipients_count: 0, sent_at: null, created_by: null, created_at: new Date().toISOString(),
    };
    expect(broadcast).toBeDefined();

    const report: Report = {
      id: "uuid", reported_profile_id: "uuid", reporter_id: null, reason: "spam",
      details: null, status: "pending", reviewed_by: null, reviewed_at: null,
      created_at: new Date().toISOString(),
    };
    expect(report).toBeDefined();

    const cert: Certification = {
      id: "uuid", profile_id: "uuid", documents: [], status: "pending",
      reviewer_id: null, reviewed_at: null, created_at: new Date().toISOString(),
    };
    expect(cert).toBeDefined();

    const config: PlatformConfig = {
      key: "test", value: {}, updated_by: null, updated_at: new Date().toISOString(),
    };
    expect(config).toBeDefined();

    const msg: ContactMessage = {
      id: "uuid", profile_id: "uuid", sender_name: "Test", sender_email: "t@t.com",
      message: "Hello", is_read: false, created_at: new Date().toISOString(),
    };
    expect(msg).toBeDefined();

    const exp: Experience = {
      id: "uuid", profile_id: "uuid", role: "Dev", company: "Corp",
      start_date: "2024-01-01", end_date: null, description: null,
      sort_order: 0, created_at: new Date().toISOString(),
    };
    expect(exp).toBeDefined();

    const proj: Project = {
      id: "uuid", profile_id: "uuid", name: "Proj", description: null,
      image_url: null, tech_stack: [], github_url: null, demo_url: null,
      stars: 0, sort_order: 0, created_at: new Date().toISOString(),
    };
    expect(proj).toBeDefined();
  });
});
