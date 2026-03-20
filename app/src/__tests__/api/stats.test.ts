/**
 * Tests — API /api/stats (social proof)
 */
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock supabase admin
const mockFrom = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

describe("GET /api/stats", () => {
  afterEach(() => vi.clearAllMocks());

  it("retourne les compteurs de social proof", async () => {
    const counts = [42, 15, 3]; // waitlist, profiles, startups
    let callIndex = 0;

    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: counts[callIndex++], error: null }),
        then: function (resolve: (val: { count: number; error: null }) => void) {
          return resolve({ count: counts[callIndex++], error: null });
        },
        [Symbol.toStringTag]: "Promise",
      }),
    }));

    // Re-mock pour simplifier
    let idx = 0;
    mockFrom.mockImplementation(() => {
      const count = counts[idx++];
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count, error: null }),
          count,
          error: null,
          then: (cb: (v: { count: number; error: null }) => void) => Promise.resolve(cb({ count, error: null })),
        }),
      };
    });

    const { GET } = await import("@/app/api/stats/route");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty("waitlist");
    expect(json).toHaveProperty("portfolios");
    expect(json).toHaveProperty("startups");
  });
});
