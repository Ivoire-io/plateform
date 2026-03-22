import { afterEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ───
const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

vi.mock("@/lib/wasender", () => ({
  sendWhatsAppMessage: vi.fn().mockResolvedValue(true),
}));

function mockAdminGuard(authorized: boolean) {
  vi.doMock("@/lib/admin-guard", () => ({
    adminGuard: vi.fn().mockResolvedValue(
      authorized
        ? { authorized: true, userId: "admin-123" }
        : {
          authorized: false,
          response: new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }),
        }
    ),
  }));
}

describe("Admin WhatsApp routes", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("GET /api/admin/whatsapp/status", () => {
    it("rejette les non-admin", async () => {
      mockAdminGuard(false);
      const { GET } = await import("@/app/api/admin/whatsapp/status/route");
      const res = await GET();
      expect(res.status).toBe(403);
    });

    it("retourne not_configured sans API key", async () => {
      const originalKey = process.env.WASENDER_API_KEY;
      delete process.env.WASENDER_API_KEY;

      mockAdminGuard(true);
      const { GET } = await import("@/app/api/admin/whatsapp/status/route");
      const res = await GET();
      const data = await res.json();
      expect(data.status).toBe("not_configured");

      if (originalKey) process.env.WASENDER_API_KEY = originalKey;
    });
  });

  describe("POST /api/admin/whatsapp/send", () => {
    it("rejette les non-admin", async () => {
      mockAdminGuard(false);
      const { POST } = await import("@/app/api/admin/whatsapp/send/route");
      const req = new Request("http://localhost:3000/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "+2250101010101", message: "Hello" }),
      });
      const res = await POST(req as unknown as import("next/server").NextRequest);
      expect(res.status).toBe(403);
    });

    it("rejette sans phone ou message", async () => {
      mockAdminGuard(true);
      mockFrom.mockReturnValue({ insert: vi.fn().mockResolvedValue({ error: null }) });

      const { POST } = await import("@/app/api/admin/whatsapp/send/route");
      const req = new Request("http://localhost:3000/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "", message: "" }),
      });
      const res = await POST(req as unknown as import("next/server").NextRequest);
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/admin/whatsapp/logs", () => {
    it("rejette les non-admin", async () => {
      mockAdminGuard(false);
      const { GET } = await import("@/app/api/admin/whatsapp/logs/route");
      const req = new Request("http://localhost:3000/api/admin/whatsapp/logs");
      const res = await GET(req as unknown as import("next/server").NextRequest);
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/admin/whatsapp/templates", () => {
    it("rejette les non-admin", async () => {
      mockAdminGuard(false);
      const { POST } = await import("@/app/api/admin/whatsapp/templates/route");
      const req = new Request("http://localhost:3000/api/admin/whatsapp/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "test", content: "Hello {{name}}" }),
      });
      const res = await POST(req as unknown as import("next/server").NextRequest);
      expect(res.status).toBe(403);
    });

    it("rejette sans name ou content", async () => {
      mockAdminGuard(true);
      const { POST } = await import("@/app/api/admin/whatsapp/templates/route");
      const req = new Request("http://localhost:3000/api/admin/whatsapp/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "", content: "" }),
      });
      const res = await POST(req as unknown as import("next/server").NextRequest);
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/admin/whatsapp/broadcast", () => {
    it("rejette les non-admin", async () => {
      mockAdminGuard(false);
      const { POST } = await import("@/app/api/admin/whatsapp/broadcast/route");
      const req = new Request("http://localhost:3000/api/admin/whatsapp/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Hello everyone" }),
      });
      const res = await POST(req as unknown as import("next/server").NextRequest);
      expect(res.status).toBe(403);
    });
  });
});
