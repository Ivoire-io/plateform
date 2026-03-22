/**
 * Tests unitaires — Routes admin secondaires
 * config, logs, flags, reports, broadcasts, templates, analytics, certifications
 */
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

// ─── Mock supabaseAdmin (singleton, module-level) ─────────────────────────

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: { from: (...args: unknown[]) => mockFrom(...args) },
}));

vi.mock("@/lib/admin-guard", () => ({
  adminGuard: vi.fn(),
}));

import { adminGuard } from "@/lib/admin-guard";

const mockAdminGuard = vi.mocked(adminGuard);

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new Request(url, options));
}

function makeAuthorized(userId = "admin-1") {
  mockAdminGuard.mockResolvedValue({
    authorized: true,
    userId,
  } as unknown as Awaited<ReturnType<typeof adminGuard>>);
}

function makeUnauthorized() {
  mockAdminGuard.mockResolvedValueOnce({
    authorized: false,
    userId: "",
    response: new Response(null, { status: 403 }),
  } as unknown as Awaited<ReturnType<typeof adminGuard>>);
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeKeyParams(key: string) {
  return { params: Promise.resolve({ key }) };
}

// ─── Chain builder ────────────────────────────────────────────────────────

function chain(resolved: Record<string, unknown> = { data: null, error: null }) {
  const c: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const m of ["select", "eq", "or", "gte", "range", "order", "ilike", "update", "upsert", "insert", "delete", "single", "head"]) {
    c[m] = vi.fn().mockReturnValue(c);
  }
  (c as Record<string, unknown>).then = (
    resolve: (v: typeof resolved) => void,
    reject: (e: unknown) => void
  ) => Promise.resolve(resolved).then(resolve, reject);
  return c;
}

function setupFrom(handlers: Record<string, Record<string, ReturnType<typeof vi.fn>>>) {
  mockFrom.mockImplementation((table: string) => handlers[table] ?? chain());
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════

describe("GET /api/admin/config", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { GET } = await import("@/app/api/admin/config/route");
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("renvoie la configuration", async () => {
    makeAuthorized();
    const ch = chain({ data: [{ key: "site_name", value: "Ivoire.io" }], error: null });
    mockFrom.mockReturnValue(ch);

    const { GET } = await import("@/app/api/admin/config/route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.config).toHaveLength(1);
  });
});

describe("PUT /api/admin/config", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { PUT } = await import("@/app/api/admin/config/route");
    const req = makeRequest("http://localhost/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_name: "Test" }),
    });
    const res = await PUT(req);
    expect(res.status).toBe(403);
  });

  it("upsert la config et logue", async () => {
    makeAuthorized();
    const configChain = chain({ error: null });
    const logChain = chain({ error: null });
    setupFrom({ ivoireio_platform_config: configChain, ivoireio_admin_logs: logChain });

    const { PUT } = await import("@/app/api/admin/config/route");
    const req = makeRequest("http://localhost/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_name: "Test" }),
    });
    const res = await PUT(req);

    expect(res.status).toBe(200);
    expect(configChain.upsert).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// LOGS
// ═══════════════════════════════════════════════════════════════════════════

describe("GET /api/admin/logs", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { GET } = await import("@/app/api/admin/logs/route");
    const req = makeRequest("http://localhost/api/admin/logs");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("renvoie les logs avec filtrage par période", async () => {
    makeAuthorized();
    const ch = chain({ data: [{ id: "1", action: "test" }], count: 1, error: null });
    mockFrom.mockReturnValue(ch);

    const { GET } = await import("@/app/api/admin/logs/route");
    const req = makeRequest("http://localhost/api/admin/logs?period=30d");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("logs");
    expect(json).toHaveProperty("total");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// FLAGS
// ═══════════════════════════════════════════════════════════════════════════

describe("GET /api/admin/flags", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { GET } = await import("@/app/api/admin/flags/route");
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("renvoie les feature flags", async () => {
    makeAuthorized();
    const ch = chain({ data: [{ key: "ai_chat", state: "public" }], error: null });
    mockFrom.mockReturnValue(ch);

    const { GET } = await import("@/app/api/admin/flags/route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
  });
});

describe("PUT /api/admin/flags/[key]", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { PUT } = await import("@/app/api/admin/flags/[key]/route");
    const req = makeRequest("http://localhost/api/admin/flags/ai_chat", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "beta" }),
    });
    const res = await PUT(req, makeKeyParams("ai_chat"));
    expect(res.status).toBe(403);
  });

  it("met à jour le flag et logue le changement", async () => {
    makeAuthorized();
    const flagChain = chain({ data: { key: "ai_chat", state: "beta" }, error: null });
    const oldFlagChain = chain({ data: { state: "off" }, error: null });
    const historyChain = chain({ error: null });
    const logChain = chain({ error: null });

    let callCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === "ivoireio_flag_history") return historyChain;
      if (table === "ivoireio_admin_logs") return logChain;
      // First call to feature_flags = old value, second = update
      callCount++;
      return callCount === 1 ? oldFlagChain : flagChain;
    });

    const { PUT } = await import("@/app/api/admin/flags/[key]/route");
    const req = makeRequest("http://localhost/api/admin/flags/ai_chat", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "beta" }),
    });
    const res = await PUT(req, makeKeyParams("ai_chat"));

    expect(res.status).toBe(200);
    expect(flagChain.update).toHaveBeenCalled();
    expect(historyChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ old_state: "off", new_state: "beta" })
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// REPORTS (Modération)
// ═══════════════════════════════════════════════════════════════════════════

describe("GET /api/admin/reports", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { GET } = await import("@/app/api/admin/reports/route");
    const req = makeRequest("http://localhost/api/admin/reports");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("renvoie les signalements filtrés par statut", async () => {
    makeAuthorized();
    const ch = chain({ data: [{ id: "1", reason: "spam" }], error: null });
    mockFrom.mockReturnValue(ch);

    const { GET } = await import("@/app/api/admin/reports/route");
    const req = makeRequest("http://localhost/api/admin/reports?status=pending");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(ch.eq).toHaveBeenCalledWith("status", "pending");
  });
});

describe("PUT /api/admin/reports/[id]", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { PUT } = await import("@/app/api/admin/reports/[id]/route");
    const req = makeRequest("http://localhost/api/admin/reports/r1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" }),
    });
    const res = await PUT(req, makeParams("r1"));
    expect(res.status).toBe(403);
  });

  it("résout un signalement et logue l'action", async () => {
    makeAuthorized();
    const reportReadChain = chain({ data: { target_id: "user-5" }, error: null });
    const reportUpdateChain = chain({ error: null });
    const logChain = chain({ error: null });

    let reportsCallCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === "ivoireio_admin_logs") return logChain;
      reportsCallCount++;
      return reportsCallCount === 1 ? reportReadChain : reportUpdateChain;
    });

    const { PUT } = await import("@/app/api/admin/reports/[id]/route");
    const req = makeRequest("http://localhost/api/admin/reports/r1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" }),
    });
    const res = await PUT(req, makeParams("r1"));

    expect(res.status).toBe(200);
    expect(reportUpdateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: "resolved" })
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BROADCASTS
// ═══════════════════════════════════════════════════════════════════════════

describe("GET /api/admin/broadcasts", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { GET } = await import("@/app/api/admin/broadcasts/route");
    const req = makeRequest("http://localhost/api/admin/broadcasts");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("renvoie les broadcasts paginés", async () => {
    makeAuthorized();
    const ch = chain({ data: [{ id: "1", subject: "Test" }], count: 1, error: null });
    mockFrom.mockReturnValue(ch);

    const { GET } = await import("@/app/api/admin/broadcasts/route");
    const req = makeRequest("http://localhost/api/admin/broadcasts?page=1");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("broadcasts");
    expect(json).toHaveProperty("total");
  });
});

describe("POST /api/admin/broadcasts", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("rejette si subject ou message manquant", async () => {
    makeAuthorized();
    const { POST } = await import("@/app/api/admin/broadcasts/route");
    const req = makeRequest("http://localhost/api/admin/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: "", message: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("crée un broadcast et logue", async () => {
    makeAuthorized();
    const broadcastChain = chain({ data: { id: "b1", subject: "News" }, error: null });
    const logChain = chain({ error: null });
    setupFrom({ ivoireio_broadcasts: broadcastChain, ivoireio_admin_logs: logChain });

    const { POST } = await import("@/app/api/admin/broadcasts/route");
    const req = makeRequest("http://localhost/api/admin/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: "News", message: "Hello world", channels: ["email"] }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(broadcastChain.insert).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

describe("GET /api/admin/templates", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { GET } = await import("@/app/api/admin/templates/route");
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("renvoie les templates", async () => {
    makeAuthorized();
    const ch = chain({ data: [{ id: "t1", name: "Portfolio" }], error: null });
    mockFrom.mockReturnValue(ch);

    const { GET } = await import("@/app/api/admin/templates/route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
  });
});

describe("PUT /api/admin/templates/[id]", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { PUT } = await import("@/app/api/admin/templates/[id]/route");
    const req = makeRequest("http://localhost/api/admin/templates/t1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "active" }),
    });
    const res = await PUT(req, makeParams("t1"));
    expect(res.status).toBe(403);
  });

  it("met à jour le template et logue", async () => {
    makeAuthorized();
    const tplChain = chain({ data: { id: "t1", state: "active" }, error: null });
    const logChain = chain({ error: null });
    setupFrom({ ivoireio_templates: tplChain, ivoireio_admin_logs: logChain });

    const { PUT } = await import("@/app/api/admin/templates/[id]/route");
    const req = makeRequest("http://localhost/api/admin/templates/t1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "active" }),
    });
    const res = await PUT(req, makeParams("t1"));

    expect(res.status).toBe(200);
    expect(tplChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ state: "active" })
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

describe("GET /api/admin/analytics", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { GET } = await import("@/app/api/admin/analytics/route");
    const req = makeRequest("http://localhost/api/admin/analytics");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("renvoie les analytics avec agrégations", async () => {
    makeAuthorized();
    const ch = chain({
      data: [
        { profile_type: "developer", created_at: "2026-03-01T00:00:00Z" },
        { profile_type: "startup", created_at: "2026-03-01T00:00:00Z" },
      ],
      count: 100,
      error: null,
    });
    mockFrom.mockReturnValue(ch);

    const { GET } = await import("@/app/api/admin/analytics/route");
    const req = makeRequest("http://localhost/api/admin/analytics?period=30d");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("totalProfiles");
    expect(json).toHaveProperty("typeCounts");
    expect(json).toHaveProperty("signupsByDay");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CERTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

describe("GET /api/admin/certifications", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { GET } = await import("@/app/api/admin/certifications/route");
    const req = makeRequest("http://localhost/api/admin/certifications");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("renvoie les certifications filtrées par statut", async () => {
    makeAuthorized();
    const ch = chain({ data: [{ id: "c1", status: "pending" }], error: null });
    mockFrom.mockReturnValue(ch);

    const { GET } = await import("@/app/api/admin/certifications/route");
    const req = makeRequest("http://localhost/api/admin/certifications?status=pending");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(ch.eq).toHaveBeenCalledWith("status", "pending");
  });
});

describe("POST /api/admin/certifications (approve/reject)", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { POST } = await import("@/app/api/admin/certifications/route");
    const req = makeRequest("http://localhost/api/admin/certifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificationId: "c1", action: "approve" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("approuve une certification et met le badge sur le profil", async () => {
    makeAuthorized();
    const certChain = chain({ data: { profile_id: "user-5" }, error: null });
    const profileChain = chain({ error: null });
    const logChain = chain({ error: null });

    let certCallCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table === "ivoireio_admin_logs") return logChain;
      if (table === "ivoireio_profiles") return profileChain;
      certCallCount++;
      return certChain;
    });

    const { POST } = await import("@/app/api/admin/certifications/route");
    const req = makeRequest("http://localhost/api/admin/certifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificationId: "c1", action: "approve" }),
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(profileChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ verified_badge: true })
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BROADCAST PREVIEW
// ═══════════════════════════════════════════════════════════════════════════

describe("POST /api/admin/broadcasts/preview", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { POST } = await import("@/app/api/admin/broadcasts/preview/route");
    const req = makeRequest("http://localhost/api/admin/broadcasts/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("renvoie le nombre de destinataires", async () => {
    makeAuthorized();
    const ch = chain({ count: 42, error: null });
    mockFrom.mockReturnValue(ch);

    const { POST } = await import("@/app/api/admin/broadcasts/preview/route");
    const req = makeRequest("http://localhost/api/admin/broadcasts/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_type: "developer" }),
    });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.count).toBe(42);
  });
});
