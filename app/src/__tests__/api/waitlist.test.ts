/**
 * Tests — API /api/waitlist (POST + GET)
 */
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock supabase admin
const mockFrom = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

// Mock resend
vi.mock("resend", () => {
  class MockResend {
    emails = { send: vi.fn().mockResolvedValue({ id: "ok" }) };
  }
  return { Resend: MockResend };
});

describe("POST /api/waitlist", () => {
  afterEach(() => vi.clearAllMocks());

  it("rejette les champs manquants", async () => {
    const { POST } = await import("@/app/api/waitlist/route");
    const request = new Request("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("rejette un slug invalide", async () => {
    const { POST } = await import("@/app/api/waitlist/route");
    const request = new Request("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@test.com",
        full_name: "Test",
        desired_slug: "-invalid-", // commence et finit par un tiret
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("rejette un slug réservé", async () => {
    const { POST } = await import("@/app/api/waitlist/route");
    const request = new Request("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@test.com",
        full_name: "Test",
        desired_slug: "admin",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("rejette un slug déjà pris dans la waitlist", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table.includes("waitlist")) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { id: "existing" }, error: null }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    const { POST } = await import("@/app/api/waitlist/route");
    const request = new Request("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "new@test.com",
        full_name: "Test User",
        desired_slug: "taken-slug",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
  });
});

describe("GET /api/waitlist", () => {
  afterEach(() => vi.clearAllMocks());

  it("retourne le nombre d'inscrits", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ count: 42, error: null }),
    });

    const { GET } = await import("@/app/api/waitlist/route");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.count).toBe(42);
  });
});
