/**
 * Tests API — Admin Startups
 */
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock admin guard
vi.mock("@/lib/admin-guard", () => ({
  adminGuard: vi.fn().mockResolvedValue({ authorized: true, userId: "admin-1" }),
}));

/** Helper : crée un faux client Supabase avec chaîne thenable */
function makeMockSupabase(result: { data?: unknown; error?: unknown; count?: number | null }) {
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "eq", "ilike", "order", "range", "single", "maybeSingle", "update", "delete", "insert"]) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.then = (resolve: (v: typeof result) => void) => Promise.resolve(resolve(result));
  return { from: vi.fn().mockReturnValue(chain), auth: { getUser: vi.fn() }, chain };
}

// Mock createClient from supabase/server
const mockCreateClient = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}));

describe("API Admin Startups — GET /api/admin/startups", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("retourne la liste des startups avec pagination", async () => {
    const mockData = [
      { id: "s1", name: "Startup 1", status: "pending" },
      { id: "s2", name: "Startup 2", status: "approved" },
    ];
    const mock = makeMockSupabase({ data: mockData, error: null, count: 2 });
    mockCreateClient.mockResolvedValue(mock);

    const { GET } = await import("@/app/api/admin/startups/route");
    const url = new URL("http://localhost/api/admin/startups?page=1");
    const request = new Request(url);
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.startups).toHaveLength(2);
    expect(json.total).toBe(2);
  });

  it("filtre par statut", async () => {
    const mock = makeMockSupabase({ data: [{ id: "s1", name: "Startup 1", status: "pending" }], error: null, count: 1 });
    mockCreateClient.mockResolvedValue(mock);

    const { GET } = await import("@/app/api/admin/startups/route");
    const url = new URL("http://localhost/api/admin/startups?status=pending");
    const request = new Request(url);
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.startups).toHaveLength(1);
  });
});

describe("API Admin Startups — PATCH /api/admin/startups/[id]", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("met à jour le statut d'une startup", async () => {
    const mockStartup = { id: "s1", name: "TestStartup", status: "approved" };
    const mock = makeMockSupabase({ data: mockStartup, error: null });
    mockCreateClient.mockResolvedValue(mock);

    const { PATCH } = await import("@/app/api/admin/startups/[id]/route");
    const request = new Request("http://localhost/api/admin/startups/s1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "s1" }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });
});

describe("API Admin Startups — DELETE /api/admin/startups/[id]", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("supprime une startup", async () => {
    const mock = makeMockSupabase({ error: null });
    mockCreateClient.mockResolvedValue(mock);

    const { DELETE } = await import("@/app/api/admin/startups/[id]/route");
    const request = new Request("http://localhost/api/admin/startups/s1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "s1" }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
