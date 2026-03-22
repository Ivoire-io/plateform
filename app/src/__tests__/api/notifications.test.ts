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

vi.mock("@/lib/notifications", () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
}));

function chainMock(finalValue: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = ["select", "insert", "update", "delete", "eq", "neq", "not", "gte", "lt", "order", "limit", "range", "maybeSingle", "single"];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.maybeSingle = vi.fn().mockResolvedValue(finalValue);
  chain.single = vi.fn().mockResolvedValue(finalValue);
  return chain;
}

// ─── Notifications API ───
describe("GET /api/dashboard/notifications", () => {
  afterEach(() => vi.clearAllMocks());

  it("rejette les utilisateurs non authentifies", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { GET } = await import("@/app/api/dashboard/notifications/route");
    const req = new Request("http://localhost:3000/api/dashboard/notifications");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/dashboard/notifications", () => {
  afterEach(() => vi.clearAllMocks());

  it("rejette les utilisateurs non authentifies", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { PATCH } = await import("@/app/api/dashboard/notifications/route");
    const req = new Request("http://localhost:3000/api/dashboard/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mark_all: true }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });
});

// ─── Cron Reminders ───
describe("GET /api/cron/reminders", () => {
  afterEach(() => vi.clearAllMocks());

  it("rejette sans CRON_SECRET", async () => {
    delete process.env.CRON_SECRET;

    const { GET } = await import("@/app/api/cron/reminders/route");
    const req = new Request("http://localhost:3000/api/cron/reminders", {
      headers: { authorization: "Bearer wrong-secret" },
    });
    // Type cast for NextRequest compatible call
    const res = await GET(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(401);
  });

  it("rejette avec un secret incorrect", async () => {
    process.env.CRON_SECRET = "correct-secret";

    const { GET } = await import("@/app/api/cron/reminders/route");
    const req = new Request("http://localhost:3000/api/cron/reminders", {
      headers: { authorization: "Bearer wrong-secret" },
    });
    const res = await GET(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(401);
  });
});
