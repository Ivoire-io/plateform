/**
 * Tests unitaires — Routes API admin
 *
 * Stratégie : mock de `@/lib/supabase/server` et `@/lib/admin-guard`
 * pour isoler la logique de chaque route.
 */
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mock supabaseAdmin (utilisé par la route waitlist admin) ────────────
const mockAdminFrom = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: { from: (...args: unknown[]) => mockAdminFrom(...args) },
}));

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new Request(url, options));
}

// ─── Mock factories ────────────────────────────────────────────────────────

const mockSupabaseQuery = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
};

function makeMockSupabase(overrides: Record<string, unknown> = {}) {
  return {
    from: vi.fn().mockReturnValue({ ...mockSupabaseQuery, ...overrides }),
  };
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/admin-guard", () => ({
  adminGuard: vi.fn(),
}));

// ─── Imports dynamiques après les mocks ──────────────────────────────────

import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";

const mockAdminGuard = vi.mocked(adminGuard);
const mockCreateClient = vi.mocked(createClient);

// ─── Suite : /api/admin/stats ─────────────────────────────────────────────

describe("GET /api/admin/stats", () => {
  beforeEach(() => {
    mockAdminGuard.mockResolvedValue({
      authorized: true,
      userId: "admin-1",
      response: new Response(),
    } as unknown as Awaited<ReturnType<typeof adminGuard>>);
  });

  afterEach(() => vi.clearAllMocks());

  it("renvoie 403 si non autorisé", async () => {
    mockAdminGuard.mockResolvedValueOnce({
      authorized: false,
      userId: "",
      response: new Response(null, { status: 403 }),
    } as unknown as Awaited<ReturnType<typeof adminGuard>>);

    const { GET } = await import("@/app/api/admin/stats/route");
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("renvoie les statistiques correctement typées", async () => {
    // Each call to .from().select() returns a thenable chain with .eq() and .gte()
    const countResult = { count: 5, data: null, error: null };
    const makeChain = () => {
      const c: Record<string, unknown> = {};
      for (const m of ["select", "eq", "gte"]) {
        c[m] = vi.fn().mockReturnValue(c);
      }
      c.then = (
        resolve: (v: typeof countResult) => void,
        reject: (e: unknown) => void
      ) => Promise.resolve(countResult).then(resolve, reject);
      return c;
    };

    mockAdminFrom.mockImplementation(() => makeChain());

    const { GET } = await import("@/app/api/admin/stats/route");
    const res = await GET();
    const json = await res.json();

    // La réponse doit avoir les clés attendues
    expect(json).toHaveProperty("totalProfiles");
    expect(json).toHaveProperty("startups");
    expect(json).toHaveProperty("enterprises");
    expect(json).toHaveProperty("waitlistPending");
    expect(json).toHaveProperty("messages");
    expect(json).toHaveProperty("reports");
    expect(json).toHaveProperty("suspended");
    expect(json).toHaveProperty("newThisMonth");
    expect(json).toHaveProperty("mrr");
    expect(json.mrr).toBe(0);
  });
});

// ─── Suite : /api/admin/profiles ─────────────────────────────────────────

describe("GET /api/admin/profiles", () => {
  beforeEach(() => {
    mockAdminGuard.mockResolvedValue({
      authorized: true,
      userId: "admin-1",
      response: new Response(),
    } as unknown as Awaited<ReturnType<typeof adminGuard>>);
  });

  afterEach(() => vi.clearAllMocks());

  it("renvoie 403 si non autorisé", async () => {
    mockAdminGuard.mockResolvedValueOnce({
      authorized: false,
      userId: "",
      response: new Response(null, { status: 403 }),
    } as unknown as Awaited<ReturnType<typeof adminGuard>>);

    const { GET } = await import("@/app/api/admin/profiles/route");
    const req = makeRequest("http://localhost/api/admin/profiles");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("renvoie des profils paginés avec la structure correcte", async () => {
    const fakeProfiles = [
      { id: "1", full_name: "Test User", slug: "test", type: "developer", plan: "free", is_suspended: false, created_at: "2024-01-01" },
    ];

    const queryChain = {
      select: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockResolvedValue({ data: fakeProfiles, count: 1, error: null }),
    };
    queryChain.select.mockReturnValue(queryChain);
    queryChain.range.mockReturnValue(queryChain);
    queryChain.order.mockReturnValue(queryChain);
    // La résolution finale
    const resolvedQuery = { data: fakeProfiles, count: 1, error: null };
    queryChain.order.mockResolvedValue(resolvedQuery);

    mockAdminFrom.mockReturnValue(queryChain);

    const { GET } = await import("@/app/api/admin/profiles/route");
    const req = makeRequest("http://localhost/api/admin/profiles?page=1&limit=20");
    const res = await GET(req);
    const json = await res.json();

    expect(json).toHaveProperty("profiles");
    expect(json).toHaveProperty("total");
    expect(json).toHaveProperty("page");
    expect(json).toHaveProperty("limit");
    expect(json.page).toBe(1);
    expect(json.limit).toBe(20);
  });

  it("passe le filtre `type` à la query Supabase", async () => {
    const resolvedValue = { data: [], count: 0, error: null };
    const queryChain: Record<string, unknown> = {
      select: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      // Thenable so await works on the builder
      then: (resolve: (v: typeof resolvedValue) => void, reject: (e: unknown) => void) =>
        Promise.resolve(resolvedValue).then(resolve, reject),
    };
    // Make each method return the same thenable chain
    (queryChain.select as ReturnType<typeof vi.fn>).mockReturnValue(queryChain);
    (queryChain.range as ReturnType<typeof vi.fn>).mockReturnValue(queryChain);
    (queryChain.order as ReturnType<typeof vi.fn>).mockReturnValue(queryChain);
    (queryChain.eq as ReturnType<typeof vi.fn>).mockReturnValue(queryChain);

    mockAdminFrom.mockReturnValue(queryChain);

    const { GET } = await import("@/app/api/admin/profiles/route");
    const req = makeRequest("http://localhost/api/admin/profiles?type=startup");
    await GET(req);

    // Vérifie que .eq("type", "startup") a été appelé
    expect(queryChain.eq as ReturnType<typeof vi.fn>).toHaveBeenCalledWith("type", "startup");
  });
});

// ─── Suite : /api/admin/profiles/[id]/suspend ────────────────────────────

describe("POST /api/admin/profiles/[id]/suspend", () => {
  beforeEach(() => {
    mockAdminGuard.mockResolvedValue({
      authorized: true,
      userId: "admin-1",
      response: new Response(),
    } as unknown as Awaited<ReturnType<typeof adminGuard>>);
  });

  afterEach(() => vi.clearAllMocks());

  it("retourne 403 si non admin", async () => {
    mockAdminGuard.mockResolvedValueOnce({
      authorized: false,
      userId: "",
      response: new Response(null, { status: 403 }),
    } as unknown as Awaited<ReturnType<typeof adminGuard>>);

    const { POST } = await import("@/app/api/admin/profiles/[id]/suspend/route");
    const req = makeRequest("http://localhost/api/admin/profiles/abc/suspend", { method: "POST" });
    const res = await POST(req, { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(403);
  });

  it("met à jour is_suspended=true et logue l'action", async () => {
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    const insertChain = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    mockAdminFrom.mockImplementation((table: string) => {
      if (table === "ivoireio_admin_logs") return insertChain;
      return updateChain;
    });

    const { POST } = await import("@/app/api/admin/profiles/[id]/suspend/route");
    const req = makeRequest("http://localhost/api/admin/profiles/user123/suspend", { method: "POST" });
    const res = await POST(req, { params: Promise.resolve({ id: "user123" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ is_suspended: true })
    );
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ type: "profile", description: expect.any(String), actor_id: "admin-1", target_id: "user123" })
    );
  });
});

// ─── Suite : /api/admin/profiles/[id]/badge ──────────────────────────────

describe("POST /api/admin/profiles/[id]/badge", () => {
  beforeEach(() => {
    mockAdminGuard.mockResolvedValue({
      authorized: true,
      userId: "admin-1",
      response: new Response(),
    } as unknown as Awaited<ReturnType<typeof adminGuard>>);
  });

  afterEach(() => vi.clearAllMocks());

  it("retourne 403 si non admin", async () => {
    mockAdminGuard.mockResolvedValueOnce({
      authorized: false,
      userId: "",
      response: new Response(null, { status: 403 }),
    } as unknown as Awaited<ReturnType<typeof adminGuard>>);

    const { POST } = await import("@/app/api/admin/profiles/[id]/badge/route");
    const req = makeRequest("http://localhost/api/admin/profiles/abc/badge", { method: "POST" });
    const res = await POST(req, { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(403);
  });

  it("accorde le badge vérifié", async () => {
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    const insertChain = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    mockAdminFrom.mockImplementation((table: string) => {
      return table === "ivoireio_admin_logs" ? insertChain : updateChain;
    });

    const { POST } = await import("@/app/api/admin/profiles/[id]/badge/route");
    const req = makeRequest("http://localhost/api/admin/profiles/user123/badge", { method: "POST" });
    const res = await POST(req, { params: Promise.resolve({ id: "user123" }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ verified_badge: true })
    );
  });
});

// ─── Suite : /api/admin/logs ─────────────────────────────────────────────

describe("GET /api/admin/logs", () => {
  beforeEach(() => {
    mockAdminGuard.mockResolvedValue({
      authorized: true,
      userId: "admin-1",
      response: new Response(),
    } as unknown as Awaited<ReturnType<typeof adminGuard>>);
  });

  afterEach(() => vi.clearAllMocks());

  it("renvoie 403 si non autorisé", async () => {
    mockAdminGuard.mockResolvedValueOnce({
      authorized: false,
      userId: "",
      response: new Response(null, { status: 403 }),
    } as unknown as Awaited<ReturnType<typeof adminGuard>>);

    const { GET } = await import("@/app/api/admin/logs/route");
    const req = makeRequest("http://localhost/api/admin/logs");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("renvoie les logs avec la structure correcte", async () => {
    const fakeLogs = [
      { id: "log1", action: "profile_created", target_id: "user1", created_at: "2024-01-01T10:00:00Z" },
    ];

    const queryChain = {
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    queryChain.order.mockResolvedValue({ data: fakeLogs, count: 1, error: null });

    mockAdminFrom.mockReturnValue(queryChain);

    const { GET } = await import("@/app/api/admin/logs/route");
    const req = makeRequest("http://localhost/api/admin/logs?period=7d&limit=7");
    const res = await GET(req);
    const json = await res.json();

    expect(json).toHaveProperty("logs");
    expect(json).toHaveProperty("total");
    expect(Array.isArray(json.logs)).toBe(true);
  });
});

// ─── Suite : /api/admin/waitlist ─────────────────────────────────────────

describe("GET /api/admin/waitlist", () => {
  beforeEach(() => {
    mockAdminGuard.mockResolvedValue({
      authorized: true,
      userId: "admin-1",
      response: new Response(),
    } as unknown as Awaited<ReturnType<typeof adminGuard>>);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("renvoie 403 si non autorisé", async () => {
    mockAdminGuard.mockResolvedValueOnce({
      authorized: false,
      userId: "",
      response: new Response(null, { status: 403 }),
    } as unknown as Awaited<ReturnType<typeof adminGuard>>);

    const { GET } = await import("@/app/api/admin/waitlist/route");
    const req = new NextRequest("http://localhost/api/admin/waitlist");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("retourne les entrées waitlist via supabaseAdmin (contourne RLS)", async () => {
    const fakeEntries = [
      {
        id: "w1",
        email: "kouame@test.com",
        full_name: "Kouame Test",
        desired_slug: "kouame",
        type: "developer",
        invited: false,
        created_at: "2026-03-20T10:00:00Z",
      },
    ];

    const chain: Record<string, unknown> = {};
    for (const m of ["select", "eq", "order"]) {
      chain[m] = vi.fn().mockReturnValue(chain);
    }
    chain.then = (resolve: (v: { data: typeof fakeEntries; error: null; count: number }) => void) =>
      Promise.resolve(resolve({ data: fakeEntries, error: null, count: 1 }));
    mockAdminFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/admin/waitlist/route");
    const req = new NextRequest("http://localhost/api/admin/waitlist");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.entries).toHaveLength(1);
    expect(json.entries[0].email).toBe("kouame@test.com");
    expect(json.total).toBe(1);
  });

  it("filtre par type", async () => {
    const chain: Record<string, unknown> = {};
    for (const m of ["select", "eq", "order"]) {
      chain[m] = vi.fn().mockReturnValue(chain);
    }
    chain.then = (resolve: (v: { data: unknown[]; error: null; count: number }) => void) =>
      Promise.resolve(resolve({ data: [], error: null, count: 0 }));
    mockAdminFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/admin/waitlist/route");
    const req = new NextRequest("http://localhost/api/admin/waitlist?type=startup");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(chain.eq).toHaveBeenCalledWith("type", "startup");
  });
});
