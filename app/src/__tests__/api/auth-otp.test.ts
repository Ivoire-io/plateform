import { afterEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ───
const mockFrom = vi.fn();
const mockCreateUser = vi.fn();
const mockGenerateLink = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      admin: {
        createUser: (...args: unknown[]) => mockCreateUser(...args),
        generateLink: (...args: unknown[]) => mockGenerateLink(...args),
        deleteUser: vi.fn().mockResolvedValue({}),
      },
    },
  },
}));

vi.mock("@/lib/wasender", () => ({
  checkWhatsAppNumber: vi.fn().mockResolvedValue(true),
  sendOTP: vi.fn().mockResolvedValue(true),
  generateOTP: vi.fn().mockReturnValue("123456"),
  sendWhatsAppMessage: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/notifications", () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("resend", () => {
  class MockResend {
    emails = { send: vi.fn().mockResolvedValue({ id: "ok" }) };
  }
  return { Resend: MockResend };
});

function chainMock(finalValue: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "insert", "update", "delete", "eq", "neq", "not", "gte", "lt", "lte", "in", "order", "limit", "range", "maybeSingle", "single"];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.maybeSingle = vi.fn().mockResolvedValue(finalValue);
  chain.single = vi.fn().mockResolvedValue(finalValue);
  return chain;
}

// ─── Tests OTP Send ───
describe("POST /api/auth/otp/send", () => {
  afterEach(() => vi.clearAllMocks());

  function makeRequest(body: Record<string, unknown>) {
    return new Request("http://localhost:3000/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("rejette un numero invalide", async () => {
    const { POST } = await import("@/app/api/auth/otp/send/route");
    const res = await POST(makeRequest({ phone_number: "123", purpose: "login" }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("rejette un numero trop court", async () => {
    const { POST } = await import("@/app/api/auth/otp/send/route");
    const res = await POST(makeRequest({ phone_number: "+22501010", purpose: "login" }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("envoie un OTP avec un numero valide", async () => {
    // Mock: no rate limit hits
    const countChain = chainMock({ data: null, count: 0, error: null });
    countChain.select = vi.fn().mockReturnValue(countChain);
    // Mock: insert works
    const insertChain = chainMock({ data: { id: "abc" }, error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table.includes("phone_verifications")) {
        return {
          select: vi.fn().mockReturnValue({
            ...countChain,
            eq: vi.fn().mockReturnValue({
              ...countChain,
              gte: vi.fn().mockResolvedValue({ data: null, count: 0, error: null }),
            }),
          }),
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table.includes("whatsapp_logs")) {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      return chainMock({ data: null, error: null });
    });

    const { POST } = await import("@/app/api/auth/otp/send/route");
    const res = await POST(makeRequest({ phone_number: "+2250101010101", purpose: "login" }));
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.session_token).toBeDefined();
  });
});

// ─── Tests OTP Verify ───
describe("POST /api/auth/otp/verify", () => {
  afterEach(() => vi.clearAllMocks());

  function makeRequest(body: Record<string, unknown>) {
    return new Request("http://localhost:3000/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("rejette sans session_token", async () => {
    const { POST } = await import("@/app/api/auth/otp/verify/route");
    const res = await POST(makeRequest({ phone_number: "+2250101010101", otp_code: "123456" }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("rejette si aucune verification trouvee", async () => {
    const chain = chainMock({ data: null, error: null });
    mockFrom.mockReturnValue(chain);

    const { POST } = await import("@/app/api/auth/otp/verify/route");
    const res = await POST(makeRequest({
      phone_number: "+2250101010101",
      otp_code: "123456",
      session_token: "abc123",
    }));
    const data = await res.json();
    expect(res.status).toBe(404);
  });
});

// ─── Tests Phone Login ───
describe("POST /api/auth/phone-login", () => {
  afterEach(() => vi.clearAllMocks());

  function makeRequest(body: Record<string, unknown>) {
    return new Request("http://localhost:3000/api/auth/phone-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("rejette sans session_token", async () => {
    const { POST } = await import("@/app/api/auth/phone-login/route");
    const res = await POST(makeRequest({ phone_number: "+2250101010101" }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("rejette si session non verifiee", async () => {
    mockFrom.mockReturnValue(chainMock({ data: null, error: null }));

    const { POST } = await import("@/app/api/auth/phone-login/route");
    const res = await POST(makeRequest({
      phone_number: "+2250101010101",
      session_token: "abc123",
    }));
    const data = await res.json();
    expect(res.status).toBe(403);
  });
});
