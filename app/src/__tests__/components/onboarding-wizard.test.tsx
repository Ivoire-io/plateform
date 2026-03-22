/**
 * Tests — OnboardingWizard (composant)
 *
 * Vérifie que le wizard affiche les étapes correctes selon le type de profil,
 * et que les données de registration_extra pré-remplissent les champs.
 */
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// ─── Mocks globaux ──────────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  Toaster: () => null,
}));

vi.mock("@/hooks/use-dynamic-fields", () => ({
  useDynamicFields: vi.fn().mockReturnValue({
    options: [],
    loading: false,
    error: null,
  }),
}));

// ─── Profils de test ────────────────────────────────────────────────────────

function makeProfile(
  type: "developer" | "startup" | "enterprise" | "other",
  registrationExtra: Record<string, unknown> | null = null
) {
  return {
    id: "test-id",
    slug: "test",
    email: "test@test.com",
    full_name: "Test User",
    type,
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
    registration_extra: registrationExtra,
    notif_messages: true,
    notif_weekly_report: false,
    notif_news: true,
    notif_whatsapp: true,
    notif_inapp: true,
    privacy_visible_in_directory: true,
    privacy_show_email: false,
    template_id: "minimal-dark",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// ─── Suite : Wizard developer ───────────────────────────────────────────────

describe("OnboardingWizard — developer", () => {
  afterEach(() => { vi.clearAllMocks(); });

  it("affiche les étapes profil, compétences, projet, template", async () => {
    const { OnboardingWizard } = await import(
      "@/components/dashboard/onboarding-wizard"
    );
    const profile = makeProfile("developer");
    render(<OnboardingWizard profile={profile} onComplete={vi.fn()} />);

    // Les labels des étapes doivent être visibles dans la barre de progression
    // (getAllByText car le label peut apparaître dans la nav ET dans le contenu)
    expect(screen.getAllByText("Profil").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Compétences").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Premier projet").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Template").length).toBeGreaterThan(0);
  });

  it("n'affiche pas les étapes startup pour un developer", async () => {
    const { OnboardingWizard } = await import(
      "@/components/dashboard/onboarding-wizard"
    );
    const profile = makeProfile("developer");
    render(<OnboardingWizard profile={profile} onComplete={vi.fn()} />);

    expect(screen.queryByText("Ma Startup")).not.toBeInTheDocument();
    expect(screen.queryByText("Mon Entreprise")).not.toBeInTheDocument();
  });
});

// ─── Suite : Wizard startup ─────────────────────────────────────────────────

describe("OnboardingWizard — startup", () => {
  afterEach(() => { vi.clearAllMocks(); });

  it("affiche les étapes startup_info, besoins, template", async () => {
    const { OnboardingWizard } = await import(
      "@/components/dashboard/onboarding-wizard"
    );
    const profile = makeProfile("startup");
    render(<OnboardingWizard profile={profile} onComplete={vi.fn()} />);

    expect(screen.getAllByText("Ma Startup").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Besoins").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Template").length).toBeGreaterThan(0);
  });

  it("n'affiche pas les étapes developer pour un startup", async () => {
    const { OnboardingWizard } = await import(
      "@/components/dashboard/onboarding-wizard"
    );
    const profile = makeProfile("startup");
    render(<OnboardingWizard profile={profile} onComplete={vi.fn()} />);

    expect(screen.queryByText("Compétences")).not.toBeInTheDocument();
    expect(screen.queryByText("Premier projet")).not.toBeInTheDocument();
    expect(screen.queryByText("Mon Entreprise")).not.toBeInTheDocument();
  });

  it("pré-remplit startup_name depuis registration_extra", async () => {
    const { OnboardingWizard } = await import(
      "@/components/dashboard/onboarding-wizard"
    );
    const profile = makeProfile("startup", {
      startup_name: "MonStartup CI",
      sector: "fintech",
      stage: "mvp",
    });
    render(<OnboardingWizard profile={profile} onComplete={vi.fn()} />);

    // L'input du nom de la startup doit être pré-rempli
    const startupNameInput = screen.getByDisplayValue("MonStartup CI");
    expect(startupNameInput).toBeInTheDocument();
  });
});

// ─── Suite : Wizard enterprise ──────────────────────────────────────────────

describe("OnboardingWizard — enterprise", () => {
  afterEach(() => { vi.clearAllMocks(); });

  it("affiche les étapes company_info, recrutement, template", async () => {
    const { OnboardingWizard } = await import(
      "@/components/dashboard/onboarding-wizard"
    );
    const profile = makeProfile("enterprise");
    render(<OnboardingWizard profile={profile} onComplete={vi.fn()} />);

    expect(screen.getAllByText("Mon Entreprise").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Recrutement").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Template").length).toBeGreaterThan(0);
  });

  it("n'affiche pas les étapes developer pour une enterprise", async () => {
    const { OnboardingWizard } = await import(
      "@/components/dashboard/onboarding-wizard"
    );
    const profile = makeProfile("enterprise");
    render(<OnboardingWizard profile={profile} onComplete={vi.fn()} />);

    expect(screen.queryByText("Compétences")).not.toBeInTheDocument();
    expect(screen.queryByText("Ma Startup")).not.toBeInTheDocument();
  });

  it("pré-remplit company_name depuis registration_extra", async () => {
    const { OnboardingWizard } = await import(
      "@/components/dashboard/onboarding-wizard"
    );
    const profile = makeProfile("enterprise", {
      company_name: "TechCorp CI",
      sector: "banking",
      company_size: "51-200",
    });
    render(<OnboardingWizard profile={profile} onComplete={vi.fn()} />);

    const companyInput = screen.getByDisplayValue("TechCorp CI");
    expect(companyInput).toBeInTheDocument();
  });
});

// ─── Suite : Wizard other ────────────────────────────────────────────────────

describe("OnboardingWizard — other", () => {
  afterEach(() => { vi.clearAllMocks(); });

  it("affiche seulement profil et template", async () => {
    const { OnboardingWizard } = await import(
      "@/components/dashboard/onboarding-wizard"
    );
    const profile = makeProfile("other");
    render(<OnboardingWizard profile={profile} onComplete={vi.fn()} />);

    expect(screen.getAllByText("Profil").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Template").length).toBeGreaterThan(0);

    expect(screen.queryByText("Compétences")).not.toBeInTheDocument();
    expect(screen.queryByText("Ma Startup")).not.toBeInTheDocument();
    expect(screen.queryByText("Mon Entreprise")).not.toBeInTheDocument();
    expect(screen.queryByText("Premier projet")).not.toBeInTheDocument();
  });
});
