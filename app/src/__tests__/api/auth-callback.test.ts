/**
 * Tests — GET /auth/callback
 *
 * Couvre : code absent, code invalide, code valide, compte suspendu
 */
import { afterEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockExchangeCodeForSession = vi.fn();
const mockGetUser = vi.fn();
const mockSignOut = vi.fn();
const mockFromAuth = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      exchangeCodeForSession: (...args: unknown[]) => mockExchangeCodeForSession(...args),
      getUser: (...args: unknown[]) => mockGetUser(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
    from: (...args: unknown[]) => mockFromAuth(...args),
  }),
}));

vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>();
  return { ...actual };
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeRequest(url: string) {
  return new Request(url);
}

function makeProfile(is_suspended: boolean) {
  return { data: { is_suspended }, error: null };
}

// ─── Suite ─────────────────────────────────────────────────────────────────

describe("GET /auth/callback", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("redirige vers /login?error=auth_failed si aucun code dans l'URL", async () => {
    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest("http://localhost:3000/auth/callback");
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?error=auth_failed");
  });

  it("redirige vers /login?error=auth_failed si l'échange du code échoue", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: { message: "invalid code" } });

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest("http://localhost:3000/auth/callback?code=bad_code");
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?error=auth_failed");
  });

  it("redirige vers /dashboard si l'échange réussit et le compte est actif", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFromAuth.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(makeProfile(false)),
    });

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest("http://localhost:3000/auth/callback?code=valid_code");
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });

  it("redirige vers /login?error=account_suspended si le compte est suspendu", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-suspended" } } });
    mockFromAuth.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(makeProfile(true)),
    });

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest("http://localhost:3000/auth/callback?code=valid_code");
    const res = await GET(req);

    expect(mockSignOut).toHaveBeenCalled();
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?error=account_suspended");
  });

  it("redirige vers /dashboard si getUser ne retourne pas d'utilisateur (session anonyme)", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { GET } = await import("@/app/auth/callback/route");
    const req = makeRequest("http://localhost:3000/auth/callback?code=valid_code");
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
  });
});
