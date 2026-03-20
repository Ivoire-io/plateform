/**
 * Tests — API /api/startups et /api/startups/[slug]
 */
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock supabase admin
const mockFrom = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

/** Crée un chain Supabase simulé: chaque méthode retourne this, et le tout est thenable */
function makeChain(data: unknown = [], error: unknown = null, count: number | null = null) {
  const result = { data, error, count };
  const chain: Record<string, unknown> = {};
  for (const m of ["select", "eq", "ilike", "order", "range", "single", "maybeSingle"]) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  // Rendre le chain awaitable
  chain.then = (resolve: (v: typeof result) => void) => Promise.resolve(resolve(result));
  return chain;
}

describe("GET /api/startups", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("retourne une liste de startups approuvées", async () => {
    const mockStartups = [
      { id: "1", name: "MyStartup", slug: "mystartup", status: "approved", upvotes_count: 10 },
    ];
    mockFrom.mockReturnValue(makeChain(mockStartups, null, 1));

    const { GET } = await import("@/app/api/startups/route");
    const request = new Request("http://localhost:3000/api/startups");
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].name).toBe("MyStartup");
  });

  it("filtre par secteur", async () => {
    const chain = makeChain([], null, 0);
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/startups/route");
    const request = new Request("http://localhost:3000/api/startups?sector=fintech");
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(chain.eq).toHaveBeenCalledWith("sector", "fintech");
  });

  it("gère les erreurs serveur", async () => {
    mockFrom.mockReturnValue(makeChain(null, new Error("DB error")));

    const { GET } = await import("@/app/api/startups/route");
    const request = new Request("http://localhost:3000/api/startups");
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});

describe("GET /api/startups/[slug]", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("retourne une startup par slug", async () => {
    const mockStartup = { id: "1", name: "TestCo", slug: "testco", status: "approved" };
    mockFrom.mockReturnValue(makeChain(mockStartup));

    const { GET } = await import("@/app/api/startups/[slug]/route");
    const response = await GET(
      new Request("http://localhost:3000/api/startups/testco"),
      { params: Promise.resolve({ slug: "testco" }) }
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.name).toBe("TestCo");
  });

  it("retourne 404 pour un slug inexistant", async () => {
    mockFrom.mockReturnValue(makeChain(null));

    const { GET } = await import("@/app/api/startups/[slug]/route");
    const response = await GET(
      new Request("http://localhost:3000/api/startups/nope"),
      { params: Promise.resolve({ slug: "nope" }) }
    );

    expect(response.status).toBe(404);
  });
});
