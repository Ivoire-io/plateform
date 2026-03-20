/**
 * Tests composants — StartupsDirectory
 */
import type { Startup } from "@/lib/types";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const mockStartups: Startup[] = [
  {
    id: "1",
    profile_id: "p1",
    name: "TechStartup CI",
    slug: "techstartup",
    tagline: "La meilleure startup tech",
    description: "Une description",
    logo_url: null,
    cover_url: null,
    website_url: "https://techstartup.ci",
    sector: "tech",
    stage: "mvp",
    city: "Abidjan",
    team_size: 5,
    founded_year: 2025,
    tech_stack: ["React", "Node.js", "PostgreSQL"],
    social_links: {},
    is_hiring: true,
    status: "approved",
    upvotes_count: 42,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    profile: { full_name: "Dev Test", slug: "devtest", avatar_url: null },
  },
  {
    id: "2",
    profile_id: "p2",
    name: "FinTech Abidjan",
    slug: "fintechabidjan",
    tagline: "Finance pour tous",
    description: null,
    logo_url: null,
    cover_url: null,
    website_url: null,
    sector: "fintech",
    stage: "seed",
    city: "Abidjan",
    team_size: 10,
    founded_year: 2024,
    tech_stack: ["Python", "Django"],
    social_links: {},
    is_hiring: false,
    status: "approved",
    upvotes_count: 15,
    created_at: "2024-06-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
  },
];

describe("StartupsDirectory", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, upvotes: 43 }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => vi.clearAllMocks());

  it("affiche le titre de la page", async () => {
    const { StartupsDirectory } = await import("@/components/startups/startups-directory");
    render(<StartupsDirectory startups={mockStartups} />);
    expect(screen.getByText("startups.ivoire.io")).toBeTruthy();
  });

  it("affiche toutes les startups", async () => {
    const { StartupsDirectory } = await import("@/components/startups/startups-directory");
    render(<StartupsDirectory startups={mockStartups} />);

    expect(screen.getByText("TechStartup CI")).toBeTruthy();
    expect(screen.getByText("FinTech Abidjan")).toBeTruthy();
  });

  it("affiche le nombre de startups", async () => {
    const { StartupsDirectory } = await import("@/components/startups/startups-directory");
    render(<StartupsDirectory startups={mockStartups} />);
    expect(screen.getByText("2 startups")).toBeTruthy();
  });

  it("affiche le tag 'Recrute' pour les startups qui recrutent", async () => {
    const { StartupsDirectory } = await import("@/components/startups/startups-directory");
    render(<StartupsDirectory startups={mockStartups} />);
    expect(screen.getByText("Recrute")).toBeTruthy();
  });

  it("filtre par recherche textuelle", async () => {
    const { StartupsDirectory } = await import("@/components/startups/startups-directory");
    render(<StartupsDirectory startups={mockStartups} />);

    const searchInput = screen.getByPlaceholderText("Rechercher une startup...");
    fireEvent.change(searchInput, { target: { value: "FinTech" } });

    expect(screen.getByText("FinTech Abidjan")).toBeTruthy();
    expect(screen.queryByText("TechStartup CI")).toBeNull();
    expect(screen.getByText("1 startup")).toBeTruthy();
  });

  it("affiche le tech stack", async () => {
    const { StartupsDirectory } = await import("@/components/startups/startups-directory");
    render(<StartupsDirectory startups={mockStartups} />);

    expect(screen.getByText("React")).toBeTruthy();
    expect(screen.getByText("Node.js")).toBeTruthy();
  });

  it("affiche le nombre de votes", async () => {
    const { StartupsDirectory } = await import("@/components/startups/startups-directory");
    render(<StartupsDirectory startups={mockStartups} />);

    expect(screen.getByText("42")).toBeTruthy();
    expect(screen.getByText("15")).toBeTruthy();
  });

  it("affiche un message vide quand aucune startup", async () => {
    const { StartupsDirectory } = await import("@/components/startups/startups-directory");
    render(<StartupsDirectory startups={[]} />);
    expect(screen.getByText("Aucune startup trouvée.")).toBeTruthy();
  });
});
