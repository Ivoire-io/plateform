/**
 * Tests composants — PortfolioRenderer & Templates
 */
import type { Experience, Profile, Project } from "@/lib/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string;[key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string;[key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const baseProfile: Profile = {
  id: "p1",
  slug: "john-doe",
  email: "john@test.com",
  full_name: "John Doe",
  title: "Développeur Full-Stack",
  city: "Abidjan",
  bio: "Passionné de code",
  avatar_url: null,
  github_url: "https://github.com/john",
  linkedin_url: "https://linkedin.com/in/john",
  twitter_url: null,
  website_url: null,
  skills: ["TypeScript", "React", "Node.js"],
  is_available: true,
  type: "developer",
  is_admin: false,
  is_suspended: false,
  plan: "free",
  referral_code: null,
  referred_by: null,
  admin_notes: null,
  verified_badge: false,
  phone_verified: false,
  verified_phone: null,
  onboarding_completed: false,
  registration_extra: null,
  notif_messages: true,
  notif_weekly_report: true,
  notif_news: true,
  notif_whatsapp: true,
  notif_inapp: true,
  privacy_visible_in_directory: true,
  privacy_show_email: false,
  template_id: "minimal-dark",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockProjects: Project[] = [
  {
    id: "prj1",
    profile_id: "p1",
    name: "Mon Projet",
    description: "Un super projet",
    image_url: null,
    tech_stack: ["React", "TypeScript"],
    github_url: "https://github.com/john/projet",
    demo_url: null,
    stars: 10,
    sort_order: 0,
    created_at: "2025-01-01T00:00:00Z",
  },
];

const mockExperiences: Experience[] = [
  {
    id: "exp1",
    profile_id: "p1",
    role: "Senior Dev",
    company: "TechCorp",
    start_date: "2023-01-01",
    end_date: null,
    description: "Lead developer",
    sort_order: 0,
    created_at: "2025-01-01T00:00:00Z",
  },
];

describe("PortfolioRenderer", () => {
  it("rend le template minimal-dark par défaut", async () => {
    const { PortfolioRenderer } = await import("@/components/portfolio/portfolio-renderer");
    render(
      <PortfolioRenderer
        profile={baseProfile}
        projects={mockProjects}
        experiences={mockExperiences}
      />
    );

    expect(screen.getByText("John Doe")).toBeTruthy();
    expect(screen.getByText("Développeur Full-Stack")).toBeTruthy();
  });

  it("rend le template classic-light quand spécifié", async () => {
    const { PortfolioRenderer } = await import("@/components/portfolio/portfolio-renderer");
    const profile = { ...baseProfile, template_id: "classic-light" };
    render(
      <PortfolioRenderer
        profile={profile}
        projects={mockProjects}
        experiences={mockExperiences}
      />
    );

    expect(screen.getByText("John Doe")).toBeTruthy();
  });

  it("rend le template terminal quand spécifié", async () => {
    const { PortfolioRenderer } = await import("@/components/portfolio/portfolio-renderer");
    const profile = { ...baseProfile, template_id: "terminal" };
    render(
      <PortfolioRenderer
        profile={profile}
        projects={mockProjects}
        experiences={mockExperiences}
      />
    );

    expect(screen.getByText("John Doe")).toBeTruthy();
  });

  it("fallback sur minimal-dark si template_id inconnu", async () => {
    const { PortfolioRenderer } = await import("@/components/portfolio/portfolio-renderer");
    const profile = { ...baseProfile, template_id: "unknown-template" };
    render(
      <PortfolioRenderer
        profile={profile}
        projects={mockProjects}
        experiences={mockExperiences}
      />
    );

    expect(screen.getByText("John Doe")).toBeTruthy();
  });
});

describe("MinimalDarkTemplate", () => {
  it("affiche le nom, titre et bio", async () => {
    const { MinimalDarkTemplate } = await import("@/components/portfolio/templates");
    render(
      <MinimalDarkTemplate
        profile={baseProfile}
        projects={mockProjects}
        experiences={mockExperiences}
      />
    );

    expect(screen.getByText("John Doe")).toBeTruthy();
    expect(screen.getByText("Développeur Full-Stack")).toBeTruthy();
    expect(screen.getByText("Passionné de code")).toBeTruthy();
  });

  it("affiche les compétences", async () => {
    const { MinimalDarkTemplate } = await import("@/components/portfolio/templates");
    render(
      <MinimalDarkTemplate
        profile={baseProfile}
        projects={mockProjects}
        experiences={mockExperiences}
      />
    );

    // Les compétences peuvent apparaître plusieurs fois (skills + tech stack du projet)
    expect(screen.getAllByText("TypeScript").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("React").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Node.js")).toBeTruthy();
  });

  it("affiche les projets", async () => {
    const { MinimalDarkTemplate } = await import("@/components/portfolio/templates");
    render(
      <MinimalDarkTemplate
        profile={baseProfile}
        projects={mockProjects}
        experiences={mockExperiences}
      />
    );

    expect(screen.getByText("Mon Projet")).toBeTruthy();
    expect(screen.getByText("Un super projet")).toBeTruthy();
  });

  it("affiche les expériences", async () => {
    const { MinimalDarkTemplate } = await import("@/components/portfolio/templates");
    render(
      <MinimalDarkTemplate
        profile={baseProfile}
        projects={mockProjects}
        experiences={mockExperiences}
      />
    );

    expect(screen.getByText("Senior Dev")).toBeTruthy();
    expect(screen.getByText("TechCorp")).toBeTruthy();
  });

  it("affiche la ville", async () => {
    const { MinimalDarkTemplate } = await import("@/components/portfolio/templates");
    render(
      <MinimalDarkTemplate
        profile={baseProfile}
        projects={mockProjects}
        experiences={mockExperiences}
      />
    );

    // La ville peut être dans un texte composé (ex: "Abidjan, Côte d'Ivoire")
    expect(screen.getByText(/Abidjan/)).toBeTruthy();
  });
});

describe("ClassicLightTemplate", () => {
  it("affiche le profil et les projets", async () => {
    const { ClassicLightTemplate } = await import("@/components/portfolio/templates");
    render(
      <ClassicLightTemplate
        profile={{ ...baseProfile, template_id: "classic-light" }}
        projects={mockProjects}
        experiences={mockExperiences}
      />
    );

    expect(screen.getByText("John Doe")).toBeTruthy();
    expect(screen.getByText("Mon Projet")).toBeTruthy();
    expect(screen.getByText("Senior Dev")).toBeTruthy();
  });
});

describe("TerminalTemplate", () => {
  it("affiche le profil en style terminal", async () => {
    const { TerminalTemplate } = await import("@/components/portfolio/templates");
    render(
      <TerminalTemplate
        profile={{ ...baseProfile, template_id: "terminal" }}
        projects={mockProjects}
        experiences={mockExperiences}
      />
    );

    expect(screen.getByText("John Doe")).toBeTruthy();
    expect(screen.getByText("Mon Projet")).toBeTruthy();
  });
});
