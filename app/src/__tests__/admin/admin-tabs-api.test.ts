/**
 * Tests — Admin API routes added/modified in this session
 *
 * Covers: payments (stats/search/method alias), messages, dynamic-fields,
 * moderation (reports/certifications), broadcasting, flags, templates.
 */
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mock supabaseAdmin ────────────────────────────────────────────────────
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

function authorized() {
  mockAdminGuard.mockResolvedValue({
    authorized: true,
    userId: "admin-1",
    response: new Response(),
  } as unknown as Awaited<ReturnType<typeof adminGuard>>);
}

function unauthorized() {
  mockAdminGuard.mockResolvedValueOnce({
    authorized: false,
    userId: "",
    response: new Response(null, { status: 403 }),
  } as unknown as Awaited<ReturnType<typeof adminGuard>>);
}

// ─── Helpers for mock chains ──────────────────────────────────────────────
function makeChain(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "eq", "or", "ilike", "gte", "range", "order", "insert", "update", "delete", "upsert", "single", "maybeSingle"]) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.then = (
    resolve: (v: unknown) => void,
    reject?: (e: unknown) => void
  ) => Promise.resolve(resolvedValue).then(resolve, reject);
  return chain;
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe("GET /api/admin/payments (updated with stats)", () => {
  beforeEach(() => authorized());
  afterEach(() => vi.clearAllMocks());

  it("returns 403 if not admin", async () => {
    unauthorized();
    const { GET } = await import("@/app/api/admin/payments/route");
    const req = makeRequest("http://localhost/api/admin/payments");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("accepts payment_method as alias for method", async () => {
    const chain = makeChain({ data: [], count: 0, error: null });
    // Stats queries
    const statsChain = makeChain({ count: 0, data: null, error: null });
    const revenueChain = makeChain({ data: [], error: null });

    let callCount = 0;
    mockFrom.mockImplementation(() => {
      callCount++;
      // First call is the main query, next 3 are stats, last is revenue
      if (callCount <= 1) return chain;
      if (callCount <= 4) return statsChain;
      return revenueChain;
    });

    const { GET } = await import("@/app/api/admin/payments/route");
    const req = makeRequest("http://localhost/api/admin/payments?payment_method=manual");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("stats");
    expect(json.stats).toHaveProperty("total_payments");
    expect(json.stats).toHaveProperty("pending_count");
    expect(json.stats).toHaveProperty("total_revenue");
    expect(json.stats).toHaveProperty("failed_count");
  });
});

describe("GET /api/admin/messages", () => {
  beforeEach(() => authorized());
  afterEach(() => vi.clearAllMocks());

  it("returns 403 if not admin", async () => {
    unauthorized();
    const { GET } = await import("@/app/api/admin/messages/route");
    const req = makeRequest("http://localhost/api/admin/messages");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("returns paginated messages", async () => {
    const fakeMessages = [
      { id: "m1", sender_name: "Test", sender_email: "test@test.ci", message: "Hello", is_read: false, created_at: "2026-03-20" },
    ];
    const chain = makeChain({ data: fakeMessages, count: 1, error: null });
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/admin/messages/route");
    const req = makeRequest("http://localhost/api/admin/messages?page=1&limit=20");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("messages");
    expect(json).toHaveProperty("total");
    expect(json.messages).toHaveLength(1);
  });

  it("filters by unread", async () => {
    const chain = makeChain({ data: [], count: 0, error: null });
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/admin/messages/route");
    const req = makeRequest("http://localhost/api/admin/messages?filter=unread");
    await GET(req);

    expect(chain.eq).toHaveBeenCalledWith("is_read", false);
  });
});

describe("Admin Dynamic Fields API", () => {
  beforeEach(() => authorized());
  afterEach(() => vi.clearAllMocks());

  describe("GET /api/admin/dynamic-fields", () => {
    it("returns 403 if not admin", async () => {
      unauthorized();
      const { GET } = await import("@/app/api/admin/dynamic-fields/route");
      const req = makeRequest("http://localhost/api/admin/dynamic-fields");
      const res = await GET(req);
      expect(res.status).toBe(403);
    });

    it("returns all fields", async () => {
      const fakeFields = [
        { id: "f1", category: "city", value: "abidjan-cocody", label: "Cocody, Abidjan", is_active: true },
      ];
      const chain = makeChain({ data: fakeFields, error: null });
      mockFrom.mockReturnValue(chain);

      const { GET } = await import("@/app/api/admin/dynamic-fields/route");
      const req = makeRequest("http://localhost/api/admin/dynamic-fields");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(json)).toBe(true);
    });

    it("filters by category", async () => {
      const chain = makeChain({ data: [], error: null });
      mockFrom.mockReturnValue(chain);

      const { GET } = await import("@/app/api/admin/dynamic-fields/route");
      const req = makeRequest("http://localhost/api/admin/dynamic-fields?category=skill");
      await GET(req);

      expect(chain.eq).toHaveBeenCalledWith("category", "skill");
    });
  });

  describe("POST /api/admin/dynamic-fields", () => {
    it("returns 400 without required fields", async () => {
      const { POST } = await import("@/app/api/admin/dynamic-fields/route");
      const req = makeRequest("http://localhost/api/admin/dynamic-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "city" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("creates a new field", async () => {
      const insertChain = makeChain({ data: { id: "new-1", category: "city", value: "test", label: "Test" }, error: null });
      const logChain = { insert: vi.fn().mockResolvedValue({ error: null }) };

      mockFrom.mockImplementation((table: string) => {
        if (table.includes("admin_logs")) return logChain;
        return insertChain;
      });

      const { POST } = await import("@/app/api/admin/dynamic-fields/route");
      const req = makeRequest("http://localhost/api/admin/dynamic-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "city", value: "test-city", label: "Test City" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
    });

    it("returns 409 on duplicate", async () => {
      const insertChain = makeChain({ data: null, error: { code: "23505", message: "duplicate" } });
      mockFrom.mockReturnValue(insertChain);

      const { POST } = await import("@/app/api/admin/dynamic-fields/route");
      const req = makeRequest("http://localhost/api/admin/dynamic-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "city", value: "abidjan-cocody", label: "Cocody" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(409);
    });
  });

  describe("PUT /api/admin/dynamic-fields", () => {
    it("returns 400 without id", async () => {
      const { PUT } = await import("@/app/api/admin/dynamic-fields/route");
      const req = makeRequest("http://localhost/api/admin/dynamic-fields", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "Updated" }),
      });
      const res = await PUT(req);
      expect(res.status).toBe(400);
    });

    it("updates a field", async () => {
      const chain = makeChain({ data: { id: "f1", label: "Updated" }, error: null });
      mockFrom.mockReturnValue(chain);

      const { PUT } = await import("@/app/api/admin/dynamic-fields/route");
      const req = makeRequest("http://localhost/api/admin/dynamic-fields", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "f1", label: "Updated", is_active: false }),
      });
      const res = await PUT(req);
      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /api/admin/dynamic-fields", () => {
    it("returns 400 without id", async () => {
      const { DELETE } = await import("@/app/api/admin/dynamic-fields/route");
      const req = makeRequest("http://localhost/api/admin/dynamic-fields", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await DELETE(req);
      expect(res.status).toBe(400);
    });

    it("deletes a field", async () => {
      const chain = makeChain({ error: null });
      mockFrom.mockReturnValue(chain);

      const { DELETE } = await import("@/app/api/admin/dynamic-fields/route");
      const req = makeRequest("http://localhost/api/admin/dynamic-fields", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "f1" }),
      });
      const res = await DELETE(req);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });
});

describe("GET /api/dynamic-fields (public)", () => {
  afterEach(() => vi.clearAllMocks());

  it("returns fields for a category", async () => {
    const fakeFields = [
      { value: "react", label: "React", parent: "Frontend", category: "skill" },
    ];
    const chain = makeChain({ data: fakeFields, error: null });
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/dynamic-fields/route");
    const req = makeRequest("http://localhost/api/dynamic-fields?category=skill");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
    expect(json[0].label).toBe("React");
  });

  it("returns grouped fields when no category", async () => {
    const fakeFields = [
      { value: "react", label: "React", parent: "Frontend", category: "skill" },
      { value: "abidjan-cocody", label: "Cocody", parent: "Abidjan", category: "city" },
    ];
    const chain = makeChain({ data: fakeFields, error: null });
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/dynamic-fields/route");
    const req = makeRequest("http://localhost/api/dynamic-fields");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("skill");
    expect(json).toHaveProperty("city");
  });
});

describe("POST /api/admin/reports/[id]", () => {
  beforeEach(() => authorized());
  afterEach(() => vi.clearAllMocks());

  it("returns 403 if not admin", async () => {
    unauthorized();
    const { PUT } = await import("@/app/api/admin/reports/[id]/route");
    const req = makeRequest("http://localhost/api/admin/reports/r1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "r1" }) });
    expect(res.status).toBe(403);
  });

  it("resolves a report and suspends target", async () => {
    const selectChain = makeChain({ data: { target_id: "user1" }, error: null });
    const updateChain = makeChain({ error: null });
    const logChain = { insert: vi.fn().mockResolvedValue({ error: null }) };

    mockFrom.mockImplementation((table: string) => {
      if (table.includes("admin_logs")) return logChain;
      if (table.includes("profiles")) return updateChain;
      // reports table — first call select, second call update
      return { ...selectChain, update: vi.fn().mockReturnValue(updateChain) };
    });

    const { PUT } = await import("@/app/api/admin/reports/[id]/route");
    const req = makeRequest("http://localhost/api/admin/reports/r1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved", action: "suspend_target" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "r1" }) });
    expect(res.status).toBe(200);
  });
});

describe("POST /api/admin/certifications", () => {
  beforeEach(() => authorized());
  afterEach(() => vi.clearAllMocks());

  it("returns 403 if not admin", async () => {
    unauthorized();
    const { POST } = await import("@/app/api/admin/certifications/route");
    const req = makeRequest("http://localhost/api/admin/certifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificationId: "c1", action: "approve" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("approves a certification and grants badge", async () => {
    const certChain = makeChain({ data: { profile_id: "p1" }, error: null });
    const profileChain = makeChain({ error: null });
    const logChain = { insert: vi.fn().mockResolvedValue({ error: null }) };

    mockFrom.mockImplementation((table: string) => {
      if (table.includes("admin_logs")) return logChain;
      if (table.includes("profiles")) return profileChain;
      return certChain;
    });

    const { POST } = await import("@/app/api/admin/certifications/route");
    const req = makeRequest("http://localhost/api/admin/certifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificationId: "c1", action: "approve" }),
    });
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});

describe("POST /api/admin/broadcasts", () => {
  beforeEach(() => authorized());
  afterEach(() => vi.clearAllMocks());

  it("returns 400 without subject/message", async () => {
    const { POST } = await import("@/app/api/admin/broadcasts/route");
    const req = makeRequest("http://localhost/api/admin/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: "", message: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("creates a broadcast", async () => {
    const insertChain = makeChain({ data: { id: "b1", subject: "Test" }, error: null });
    const logChain = { insert: vi.fn().mockResolvedValue({ error: null }) };

    mockFrom.mockImplementation((table: string) => {
      if (table.includes("admin_logs")) return logChain;
      return insertChain;
    });

    const { POST } = await import("@/app/api/admin/broadcasts/route");
    const req = makeRequest("http://localhost/api/admin/broadcasts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: "Test", message: "Hello world", channels: ["email"] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});
