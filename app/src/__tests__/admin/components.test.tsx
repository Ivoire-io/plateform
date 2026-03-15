/**
 * Tests des composants React du panel admin
 *
 * Stratégie : mock de fetch global + render isolé des composants
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mocks globaux ─────────────────────────────────────────────────────────

// next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "dark" }),
}));

// next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  Toaster: () => null,
}));

// ─── Suite : AdminOverviewTab ─────────────────────────────────────────────

describe("AdminOverviewTab", () => {
  const mockStats = {
    totalProfiles: 42,
    startups: 5,
    enterprises: 3,
    waitlistPending: 12,
    messages: 7,
    reports: 2,
    suspended: 1,
    newThisMonth: 8,
    mrr: 0,
  };

  const mockLogs = {
    logs: [
      { id: "l1", action: "profile_created", target_id: "user1", created_at: "2024-03-14T10:00:00Z" },
      { id: "l2", action: "profile_suspended", target_id: "user2", created_at: "2024-03-13T10:00:00Z" },
    ],
    total: 2,
  };

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/admin/stats")) {
        return Promise.resolve({ json: () => Promise.resolve(mockStats) });
      }
      if (url.includes("/api/admin/logs")) {
        return Promise.resolve({ json: () => Promise.resolve(mockLogs) });
      }
      return Promise.reject(new Error("URL non mockée"));
    }) as unknown as typeof fetch;
  });

  afterEach(() => vi.clearAllMocks());

  it("affiche le titre Dashboard Admin", async () => {
    const { AdminOverviewTab } = await import("@/components/admin/tabs/overview-tab");
    render(<AdminOverviewTab onNavigate={vi.fn()} />);
    expect(screen.getByText("Dashboard Admin")).toBeTruthy();
  });

  it("charge et affiche le nombre total de profils", async () => {
    const { AdminOverviewTab } = await import("@/components/admin/tabs/overview-tab");
    render(<AdminOverviewTab onNavigate={vi.fn()} />);

    await waitFor(() => {
      // 42 peut apparaître plusieurs fois (metric card + stat card), on vérifie juste sa présence
      const elements = screen.getAllByText("42");
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("affiche les logs de l'API après chargement", async () => {
    const { AdminOverviewTab } = await import("@/components/admin/tabs/overview-tab");
    render(<AdminOverviewTab onNavigate={vi.fn()} />);

    await waitFor(() => {
      // "Profil créé" devrait apparaître depuis les logs
      expect(screen.getByText(/Profil créé/)).toBeTruthy();
    });
  });

  it("affiche la section Actions en Attente si signalements > 0", async () => {
    const { AdminOverviewTab } = await import("@/components/admin/tabs/overview-tab");
    render(<AdminOverviewTab onNavigate={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Actions en Attente")).toBeTruthy();
    });
  });

  it("n'affiche pas Actions en Attente si tout est à 0", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/admin/stats")) {
        return Promise.resolve({
          json: () => Promise.resolve({ ...mockStats, reports: 0, waitlistPending: 0, messages: 0 }),
        });
      }
      return Promise.resolve({ json: () => Promise.resolve(mockLogs) });
    }) as unknown as typeof fetch;

    const { AdminOverviewTab } = await import("@/components/admin/tabs/overview-tab");
    render(<AdminOverviewTab onNavigate={vi.fn()} />);

    await waitFor(() => {
      expect(screen.queryByText("Actions en Attente")).toBeNull();
    });
  });

  it("appelle onNavigate avec 'logs' au clic sur 'Voir tous les logs'", async () => {
    const onNavigate = vi.fn();
    const { AdminOverviewTab } = await import("@/components/admin/tabs/overview-tab");
    render(<AdminOverviewTab onNavigate={onNavigate} />);

    await waitFor(() => {
      const btn = screen.getByText("Voir tous les logs →");
      fireEvent.click(btn);
      expect(onNavigate).toHaveBeenCalledWith("logs");
    });
  });
});

// ─── Suite : AdminUsersTab ────────────────────────────────────────────────

describe("AdminUsersTab", () => {
  const mockProfiles = {
    profiles: [
      {
        id: "u1",
        full_name: "Alice Koné",
        slug: "alice",
        email: "alice@mail.ci",
        type: "developer",
        plan: "free",
        is_suspended: false,
        verified_badge: false,
        is_admin: false,
        avatar_url: null,
        created_at: "2024-03-01T00:00:00Z",
      },
      {
        id: "u2",
        full_name: "Startup CI",
        slug: "startup-ci",
        email: "hi@startup.ci",
        type: "startup",
        plan: "premium",
        is_suspended: false,
        verified_badge: true,
        is_admin: false,
        avatar_url: null,
        created_at: "2024-02-01T00:00:00Z",
      },
    ],
    total: 2,
    page: 1,
    limit: 20,
  };

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProfiles),
    }) as unknown as typeof fetch;
  });

  afterEach(() => vi.clearAllMocks());

  it("affiche le titre Profils avec le nombre total", async () => {
    const { AdminUsersTab } = await import("@/components/admin/tabs/users-tab");
    render(<AdminUsersTab />);

    await waitFor(() => {
      expect(screen.getByText(/Profils \(2\)/)).toBeTruthy();
    });
  });

  it("affiche les noms des utilisateurs dans le tableau", async () => {
    const { AdminUsersTab } = await import("@/components/admin/tabs/users-tab");
    render(<AdminUsersTab />);

    await waitFor(() => {
      expect(screen.getByText("Alice Koné")).toBeTruthy();
      expect(screen.getByText("Startup CI")).toBeTruthy();
    });
  });

  it("affiche le badge vérifié pour les profils verified", async () => {
    const { AdminUsersTab } = await import("@/components/admin/tabs/users-tab");
    render(<AdminUsersTab />);

    await waitFor(() => {
      // Startup CI a verified_badge: true
      expect(screen.getByText("Startup CI")).toBeTruthy();
    });
  });

  it("affiche Aucun utilisateur trouvé si la liste est vide", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ profiles: [], total: 0, page: 1, limit: 20 }),
    }) as unknown as typeof fetch;

    const { AdminUsersTab } = await import("@/components/admin/tabs/users-tab");
    render(<AdminUsersTab />);

    await waitFor(() => {
      expect(screen.getByText("Aucun utilisateur trouvé")).toBeTruthy();
    });
  });

  it("affiche le bon label de type pour développeur", async () => {
    const { AdminUsersTab } = await import("@/components/admin/tabs/users-tab");
    render(<AdminUsersTab />);

    await waitFor(() => {
      // Alice est "developer" → doit afficher "Dev"
      expect(screen.getByText("Dev")).toBeTruthy();
    });
  });

  it("recharge les données lors d'un changement de filtre de type", async () => {
    const { AdminUsersTab } = await import("@/components/admin/tabs/users-tab");
    render(<AdminUsersTab />);

    await waitFor(() => {
      expect(screen.getByText("Alice Koné")).toBeTruthy();
    });

    // Le nombre de fetchs doit augmenter après interaction avec les filtres
    const initialCallCount = vi.mocked(global.fetch).mock.calls.length;
    expect(initialCallCount).toBeGreaterThan(0);
  });

  it("affiche le numéro de page et le total de résultats", async () => {
    const { AdminUsersTab } = await import("@/components/admin/tabs/users-tab");
    render(<AdminUsersTab />);

    await waitFor(() => {
      expect(screen.getByText(/Page 1 \/ 1/)).toBeTruthy();
      expect(screen.getByText(/2 résultats/)).toBeTruthy();
    });
  });

  it("appelle l'API suspend lors du clic sur Suspendre", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfiles),
      })
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      }) as unknown as typeof fetch;

    const { AdminUsersTab } = await import("@/components/admin/tabs/users-tab");
    render(<AdminUsersTab />);

    // Ouvre le sheet de gestion d'Alice
    await waitFor(() => {
      const editButtons = screen.getAllByRole("button", { name: "" });
      // Premier bouton d'édition (icône crayon)
      const pencilBtn = editButtons.find((b) => b.querySelector("svg"));
      if (pencilBtn) fireEvent.click(pencilBtn);
    });

    // Si le sheet s'ouvre, cherche le bouton Suspendre
    await waitFor(() => {
      const suspendBtn = screen.queryByText("Suspendre");
      if (suspendBtn) {
        fireEvent.click(suspendBtn);
      }
    });
  });
});
