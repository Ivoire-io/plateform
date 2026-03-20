/**
 * Tests composants — Social Proof, Landing Page
 */
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mocks
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

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "dark" }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("SocialProof", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ waitlist: 42, portfolios: 15, startups: 3 }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => vi.clearAllMocks());

  it("affiche les compteurs après chargement", async () => {
    const { SocialProof } = await import("@/components/landing/social-proof");
    render(<SocialProof />);

    await waitFor(() => {
      expect(screen.getByText("Inscrits")).toBeTruthy();
      expect(screen.getByText("Portfolios")).toBeTruthy();
      expect(screen.getByText("Startups")).toBeTruthy();
    });
  });

  it("ne s'affiche pas si les stats sont à 0", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ waitlist: 0, portfolios: 0, startups: 0 }),
    }) as unknown as typeof fetch;

    const { SocialProof } = await import("@/components/landing/social-proof");
    const { container } = render(<SocialProof />);

    // Attendre le fetch
    await new Promise((r) => setTimeout(r, 100));
    expect(container.innerHTML).toBe("");
  });

  it("appelle /api/stats", async () => {
    const { SocialProof } = await import("@/components/landing/social-proof");
    render(<SocialProof />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/stats");
    });
  });
});

describe("HeroSection", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ available: true }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => vi.clearAllMocks());

  it("affiche le titre principal", async () => {
    const { HeroSection } = await import("@/components/landing/hero");
    render(<HeroSection />);

    expect(screen.getByText(/La porte d'entrée digitale/)).toBeTruthy();
  });

  it("affiche le suffixe .ivoire.io", async () => {
    const { HeroSection } = await import("@/components/landing/hero");
    render(<HeroSection />);

    expect(screen.getByText(".ivoire.io")).toBeTruthy();
  });

  it("affiche le bouton CTA", async () => {
    const { HeroSection } = await import("@/components/landing/hero");
    render(<HeroSection />);

    expect(screen.getByText("Réclamer mon domaine")).toBeTruthy();
  });
});

describe("FeaturesSection", () => {
  it("affiche les 3 features", async () => {
    const { FeaturesSection } = await import("@/components/landing/features");
    render(<FeaturesSection />);

    expect(screen.getByText("Talents")).toBeTruthy();
    expect(screen.getByText("Startups")).toBeTruthy();
    expect(screen.getByText("Services")).toBeTruthy();
  });
});
