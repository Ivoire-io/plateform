/**
 * Tests composants — AdminStartupsTab
 */
import type { Startup } from "@/lib/types";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockStartups: Startup[] = [
  {
    id: "s1",
    profile_id: "p1",
    name: "Startup Pending",
    slug: "pending",
    tagline: "En attente",
    description: null,
    logo_url: null,
    cover_url: null,
    website_url: null,
    sector: "tech",
    stage: "idea",
    city: "Abidjan",
    team_size: 3,
    founded_year: 2025,
    tech_stack: [],
    social_links: {},
    is_hiring: false,
    status: "pending",
    upvotes_count: 0,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "s2",
    profile_id: "p2",
    name: "Startup Approved",
    slug: "approved",
    tagline: "Approuvée déjà",
    description: null,
    logo_url: null,
    cover_url: null,
    website_url: "https://example.com",
    sector: "fintech",
    stage: "mvp",
    city: "Bouaké",
    team_size: 7,
    founded_year: 2024,
    tech_stack: ["React"],
    social_links: {},
    is_hiring: true,
    status: "approved",
    upvotes_count: 25,
    created_at: "2024-06-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
  },
];

describe("AdminStartupsTab", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ startups: mockStartups, total: 2 }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => vi.clearAllMocks());

  it("charge et affiche les startups", async () => {
    const { AdminStartupsTab } = await import("@/components/admin/tabs/startups-tab");
    render(<AdminStartupsTab />);

    await waitFor(() => {
      expect(screen.getByText("Startup Pending")).toBeTruthy();
      expect(screen.getByText("Startup Approved")).toBeTruthy();
    });
  });

  it("affiche le titre 'Startups'", async () => {
    const { AdminStartupsTab } = await import("@/components/admin/tabs/startups-tab");
    render(<AdminStartupsTab />);

    expect(screen.getByText("Startups")).toBeTruthy();
  });

  it("affiche les badges de statut", async () => {
    const { AdminStartupsTab } = await import("@/components/admin/tabs/startups-tab");
    render(<AdminStartupsTab />);

    await waitFor(() => {
      // "En attente" apparaît à la fois dans le select et le badge
      expect(screen.getAllByText("En attente").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Approuvée").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("affiche le contenu de la table", async () => {
    const { AdminStartupsTab } = await import("@/components/admin/tabs/startups-tab");
    render(<AdminStartupsTab />);

    await waitFor(() => {
      expect(screen.getByText("tech")).toBeTruthy();
      expect(screen.getByText("fintech")).toBeTruthy();
    });
  });

  it("affiche un message si aucune startup", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ startups: [], total: 0 }),
    });

    const { AdminStartupsTab } = await import("@/components/admin/tabs/startups-tab");
    render(<AdminStartupsTab />);

    await waitFor(() => {
      expect(screen.getByText("Aucune startup trouvée.")).toBeTruthy();
    });
  });

  it("contient les en-têtes de la table", async () => {
    const { AdminStartupsTab } = await import("@/components/admin/tabs/startups-tab");
    render(<AdminStartupsTab />);

    await waitFor(() => {
      expect(screen.getByText("Startup")).toBeTruthy();
      expect(screen.getByText("Secteur")).toBeTruthy();
      expect(screen.getByText("Votes")).toBeTruthy();
      expect(screen.getByText("Statut")).toBeTruthy();
      expect(screen.getByText("Actions")).toBeTruthy();
    });
  });
});
