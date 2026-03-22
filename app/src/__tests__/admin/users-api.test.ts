/**
 * Tests unitaires — Routes API admin/profiles (CRUD complet)
 *
 * Couvre : GET list, GET single, PUT update, DELETE, suspend, activate, badge, promote
 */
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mock factories ────────────────────────────────────────────────────────

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

function makeUnauthorized(status = 403) {
  mockAdminGuard.mockResolvedValueOnce({
    authorized: false,
    userId: "",
    response: new Response(null, { status }),
  } as unknown as Awaited<ReturnType<typeof adminGuard>>);
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

// ─── Helper: Supabase chain builder ────────────────────────────────────────

function createQueryChain(resolvedValue: Record<string, unknown> = { data: null, error: null }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of ["select", "eq", "or", "gte", "range", "order", "ilike", "update", "insert", "delete", "single"]) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }
  // Make the chain thenable so await resolves it
  (chain as Record<string, unknown>).then = (
    resolve: (v: typeof resolvedValue) => void,
    reject: (e: unknown) => void
  ) => Promise.resolve(resolvedValue).then(resolve, reject);
  return chain;
}

function setupMockFrom(tableHandlers: Record<string, Record<string, ReturnType<typeof vi.fn>>>) {
  mockFrom.mockImplementation((table: string) => {
    return tableHandlers[table] ?? createQueryChain();
  });
}

// ─── Suite : GET /api/admin/profiles (list) ────────────────────────────────

describe("GET /api/admin/profiles", () => {
  beforeEach(() => makeAuthorized());
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { GET } = await import("@/app/api/admin/profiles/route");
    const req = makeRequest("http://localhost/api/admin/profiles");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("renvoie des profils avec la structure correcte", async () => {
    const fakeProfiles = [
      { id: "1", full_name: "User 1", slug: "user1", type: "developer", plan: "free" },
    ];
    const chain = createQueryChain({ data: fakeProfiles, count: 1, error: null });
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/admin/profiles/route");
    const req = makeRequest("http://localhost/api/admin/profiles?page=1&limit=20");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toHaveProperty("profiles");
    expect(json).toHaveProperty("total");
    expect(json.page).toBe(1);
    expect(json.limit).toBe(20);
  });

  it("applique le filtre type", async () => {
    const chain = createQueryChain({ data: [], count: 0, error: null });
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/admin/profiles/route");
    const req = makeRequest("http://localhost/api/admin/profiles?type=startup");
    await GET(req);

    expect(chain.eq).toHaveBeenCalledWith("type", "startup");
  });

  it("applique le filtre status=suspended", async () => {
    const chain = createQueryChain({ data: [], count: 0, error: null });
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/admin/profiles/route");
    const req = makeRequest("http://localhost/api/admin/profiles?status=suspended");
    await GET(req);

    expect(chain.eq).toHaveBeenCalledWith("is_suspended", true);
  });

  it("applique le filtre status=active", async () => {
    const chain = createQueryChain({ data: [], count: 0, error: null });
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/admin/profiles/route");
    const req = makeRequest("http://localhost/api/admin/profiles?status=active");
    await GET(req);

    expect(chain.eq).toHaveBeenCalledWith("is_suspended", false);
  });

  it("applique le filtre plan", async () => {
    const chain = createQueryChain({ data: [], count: 0, error: null });
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/admin/profiles/route");
    const req = makeRequest("http://localhost/api/admin/profiles?plan=premium");
    await GET(req);

    expect(chain.eq).toHaveBeenCalledWith("plan", "premium");
  });

  it("applique la recherche textuelle", async () => {
    const chain = createQueryChain({ data: [], count: 0, error: null });
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/admin/profiles/route");
    const req = makeRequest("http://localhost/api/admin/profiles?search=kouame");
    await GET(req);

    expect(chain.or).toHaveBeenCalledWith(
      expect.stringContaining("kouame")
    );
  });

  it("gère les erreurs Supabase", async () => {
    const chain = createQueryChain({ data: null, count: null, error: { message: "DB error" } });
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/admin/profiles/route");
    const req = makeRequest("http://localhost/api/admin/profiles");
    const res = await GET(req);

    expect(res.status).toBe(500);
  });

  it("calcule correctement la pagination", async () => {
    const chain = createQueryChain({ data: [], count: 0, error: null });
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/admin/profiles/route");
    const req = makeRequest("http://localhost/api/admin/profiles?page=3&limit=10");
    await GET(req);

    // page 3, limit 10 → from=20, to=29
    expect(chain.range).toHaveBeenCalledWith(20, 29);
  });
});

// ─── Suite : GET /api/admin/profiles/[id] ──────────────────────────────────

describe("GET /api/admin/profiles/[id]", () => {
  beforeEach(() => makeAuthorized());
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { GET } = await import("@/app/api/admin/profiles/[id]/route");
    const req = makeRequest("http://localhost/api/admin/profiles/abc");
    const res = await GET(req, makeParams("abc"));
    expect(res.status).toBe(403);
  });

  it("renvoie le profil complet", async () => {
    const fakeProfile = { id: "user-1", full_name: "Test", admin_notes: "VIP client" };
    const chain = createQueryChain({ data: fakeProfile, error: null });
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/admin/profiles/[id]/route");
    const req = makeRequest("http://localhost/api/admin/profiles/user-1");
    const res = await GET(req, makeParams("user-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.full_name).toBe("Test");
    expect(json.admin_notes).toBe("VIP client");
  });

  it("renvoie 404 si profil introuvable", async () => {
    const chain = createQueryChain({ data: null, error: { message: "not found" } });
    mockFrom.mockReturnValue(chain);

    const { GET } = await import("@/app/api/admin/profiles/[id]/route");
    const req = makeRequest("http://localhost/api/admin/profiles/nope");
    const res = await GET(req, makeParams("nope"));

    expect(res.status).toBe(404);
  });
});

// ─── Suite : PUT /api/admin/profiles/[id] ──────────────────────────────────

describe("PUT /api/admin/profiles/[id]", () => {
  beforeEach(() => makeAuthorized());
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { PUT } = await import("@/app/api/admin/profiles/[id]/route");
    const req = makeRequest("http://localhost/api/admin/profiles/abc", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: "New Name" }),
    });
    const res = await PUT(req, makeParams("abc"));
    expect(res.status).toBe(403);
  });

  it("met à jour les champs autorisés et logue l'action", async () => {
    const updatedProfile = { id: "user-1", full_name: "Updated Name", plan: "premium" };
    const profileChain = createQueryChain({ data: updatedProfile, error: null });
    const logChain = createQueryChain({ error: null });

    setupMockFrom({
      ivoireio_profiles: profileChain,
      ivoireio_admin_logs: logChain,
    });

    const { PUT } = await import("@/app/api/admin/profiles/[id]/route");
    const req = makeRequest("http://localhost/api/admin/profiles/user-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: "Updated Name", plan: "premium" }),
    });
    const res = await PUT(req, makeParams("user-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(profileChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ full_name: "Updated Name", plan: "premium" })
    );
    expect(logChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ action: "profile_updated", target_id: "user-1" })
    );
  });

  it("filtre les champs non autorisés", async () => {
    const profileChain = createQueryChain({ data: { id: "user-1" }, error: null });
    const logChain = createQueryChain({ error: null });
    setupMockFrom({
      ivoireio_profiles: profileChain,
      ivoireio_admin_logs: logChain,
    });

    const { PUT } = await import("@/app/api/admin/profiles/[id]/route");
    const req = makeRequest("http://localhost/api/admin/profiles/user-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: "OK", email: "hack@evil.com", slug: "hacked" }),
    });
    await PUT(req, makeParams("user-1"));

    const updateCall = profileChain.update.mock.calls[0][0];
    expect(updateCall).toHaveProperty("full_name", "OK");
    expect(updateCall).not.toHaveProperty("email");
    expect(updateCall).not.toHaveProperty("slug");
  });

  it("ajoute automatiquement updated_at", async () => {
    const profileChain = createQueryChain({ data: {}, error: null });
    const logChain = createQueryChain({ error: null });
    setupMockFrom({
      ivoireio_profiles: profileChain,
      ivoireio_admin_logs: logChain,
    });

    const { PUT } = await import("@/app/api/admin/profiles/[id]/route");
    const req = makeRequest("http://localhost/api/admin/profiles/user-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio: "Hello" }),
    });
    await PUT(req, makeParams("user-1"));

    const updateCall = profileChain.update.mock.calls[0][0];
    expect(updateCall).toHaveProperty("updated_at");
  });

  it("autorise la mise à jour de is_suspended via PUT", async () => {
    const profileChain = createQueryChain({ data: { id: "user-1", is_suspended: true }, error: null });
    const logChain = createQueryChain({ error: null });
    setupMockFrom({
      ivoireio_profiles: profileChain,
      ivoireio_admin_logs: logChain,
    });

    const { PUT } = await import("@/app/api/admin/profiles/[id]/route");
    const req = makeRequest("http://localhost/api/admin/profiles/user-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_suspended: true }),
    });
    await PUT(req, makeParams("user-1"));

    const updateCall = profileChain.update.mock.calls[0][0];
    expect(updateCall).toHaveProperty("is_suspended", true);
  });
});

// ─── Suite : DELETE /api/admin/profiles/[id] ───────────────────────────────

describe("DELETE /api/admin/profiles/[id]", () => {
  beforeEach(() => makeAuthorized("admin-1"));
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non autorisé", async () => {
    makeUnauthorized();
    const { DELETE } = await import("@/app/api/admin/profiles/[id]/route");
    const req = makeRequest("http://localhost/api/admin/profiles/abc", { method: "DELETE" });
    const res = await DELETE(req, makeParams("abc"));
    expect(res.status).toBe(403);
  });

  it("supprime le profil et logue l'action", async () => {
    const deleteChain = createQueryChain({ error: null });
    const logChain = createQueryChain({ error: null });
    setupMockFrom({
      ivoireio_profiles: deleteChain,
      ivoireio_admin_logs: logChain,
    });

    const { DELETE } = await import("@/app/api/admin/profiles/[id]/route");
    const req = makeRequest("http://localhost/api/admin/profiles/user-99", { method: "DELETE" });
    const res = await DELETE(req, makeParams("user-99"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(deleteChain.delete).toHaveBeenCalled();
    expect(logChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ action: "profile_deleted", target_id: "user-99" })
    );
  });

  it("empêche un admin de se supprimer lui-même", async () => {
    const { DELETE } = await import("@/app/api/admin/profiles/[id]/route");
    const req = makeRequest("http://localhost/api/admin/profiles/admin-1", { method: "DELETE" });
    const res = await DELETE(req, makeParams("admin-1"));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain("supprimer");
  });

  it("renvoie 500 si erreur Supabase lors de la suppression", async () => {
    const deleteChain = createQueryChain({ error: { message: "FK violation" } });
    deleteChain.eq.mockResolvedValue({ error: { message: "FK violation" } });
    setupMockFrom({
      ivoireio_profiles: deleteChain,
    });

    const { DELETE } = await import("@/app/api/admin/profiles/[id]/route");
    const req = makeRequest("http://localhost/api/admin/profiles/user-99", { method: "DELETE" });
    const res = await DELETE(req, makeParams("user-99"));

    expect(res.status).toBe(500);
  });
});

// ─── Suite : POST /api/admin/profiles/[id]/suspend ─────────────────────────

describe("POST /api/admin/profiles/[id]/suspend", () => {
  beforeEach(() => makeAuthorized());
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non admin", async () => {
    makeUnauthorized();
    const { POST } = await import("@/app/api/admin/profiles/[id]/suspend/route");
    const req = makeRequest("http://localhost/api/admin/profiles/abc/suspend", { method: "POST" });
    const res = await POST(req, makeParams("abc"));
    expect(res.status).toBe(403);
  });

  it("met is_suspended=true et logue l'action", async () => {
    const updateChain = { update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: null }) };
    const logChain = { insert: vi.fn().mockResolvedValue({ error: null }) };
    mockFrom.mockImplementation((table: string) =>
      table === "ivoireio_admin_logs" ? logChain : updateChain
    );

    const { POST } = await import("@/app/api/admin/profiles/[id]/suspend/route");
    const req = makeRequest("http://localhost/api/admin/profiles/user-1/suspend", { method: "POST" });
    const res = await POST(req, makeParams("user-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(updateChain.update).toHaveBeenCalledWith(expect.objectContaining({ is_suspended: true }));
    expect(logChain.insert).toHaveBeenCalledWith(expect.objectContaining({ action: "profile_suspended" }));
  });
});

// ─── Suite : POST /api/admin/profiles/[id]/activate ────────────────────────

describe("POST /api/admin/profiles/[id]/activate", () => {
  beforeEach(() => makeAuthorized());
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non admin", async () => {
    makeUnauthorized();
    const { POST } = await import("@/app/api/admin/profiles/[id]/activate/route");
    const req = makeRequest("http://localhost/api/admin/profiles/abc/activate", { method: "POST" });
    const res = await POST(req, makeParams("abc"));
    expect(res.status).toBe(403);
  });

  it("met is_suspended=false et logue l'action", async () => {
    const updateChain = { update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: null }) };
    const logChain = { insert: vi.fn().mockResolvedValue({ error: null }) };
    mockFrom.mockImplementation((table: string) =>
      table === "ivoireio_admin_logs" ? logChain : updateChain
    );

    const { POST } = await import("@/app/api/admin/profiles/[id]/activate/route");
    const req = makeRequest("http://localhost/api/admin/profiles/user-1/activate", { method: "POST" });
    const res = await POST(req, makeParams("user-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(updateChain.update).toHaveBeenCalledWith(expect.objectContaining({ is_suspended: false }));
    expect(logChain.insert).toHaveBeenCalledWith(expect.objectContaining({ action: "profile_activated" }));
  });
});

// ─── Suite : POST /api/admin/profiles/[id]/badge ───────────────────────────

describe("POST /api/admin/profiles/[id]/badge", () => {
  beforeEach(() => makeAuthorized());
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("accorde le badge", async () => {
    const updateChain = { update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: null }) };
    const logChain = { insert: vi.fn().mockResolvedValue({ error: null }) };
    mockFrom.mockImplementation((table: string) =>
      table === "ivoireio_admin_logs" ? logChain : updateChain
    );

    const { POST } = await import("@/app/api/admin/profiles/[id]/badge/route");
    const req = makeRequest("http://localhost/api/admin/profiles/user-1/badge", { method: "POST" });
    const res = await POST(req, makeParams("user-1"));

    expect(res.status).toBe(200);
    expect(updateChain.update).toHaveBeenCalledWith(expect.objectContaining({ verified_badge: true }));
    expect(logChain.insert).toHaveBeenCalledWith(expect.objectContaining({ action: "badge_granted" }));
  });
});

// ─── Suite : DELETE /api/admin/profiles/[id]/badge ─────────────────────────

describe("DELETE /api/admin/profiles/[id]/badge", () => {
  beforeEach(() => makeAuthorized());
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non admin", async () => {
    makeUnauthorized();
    const { DELETE } = await import("@/app/api/admin/profiles/[id]/badge/route");
    const req = makeRequest("http://localhost/api/admin/profiles/abc/badge", { method: "DELETE" });
    const res = await DELETE(req, makeParams("abc"));
    expect(res.status).toBe(403);
  });

  it("retire le badge et logue l'action", async () => {
    const updateChain = { update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: null }) };
    const logChain = { insert: vi.fn().mockResolvedValue({ error: null }) };
    mockFrom.mockImplementation((table: string) =>
      table === "ivoireio_admin_logs" ? logChain : updateChain
    );

    const { DELETE } = await import("@/app/api/admin/profiles/[id]/badge/route");
    const req = makeRequest("http://localhost/api/admin/profiles/user-1/badge", { method: "DELETE" });
    const res = await DELETE(req, makeParams("user-1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(updateChain.update).toHaveBeenCalledWith(expect.objectContaining({ verified_badge: false }));
    expect(logChain.insert).toHaveBeenCalledWith(expect.objectContaining({ action: "badge_revoked" }));
  });
});

// ─── Suite : POST /api/admin/profiles/[id]/promote ─────────────────────────

describe("POST /api/admin/profiles/[id]/promote", () => {
  beforeEach(() => makeAuthorized("admin-1"));
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("renvoie 403 si non admin", async () => {
    makeUnauthorized();
    const { POST } = await import("@/app/api/admin/profiles/[id]/promote/route");
    const req = makeRequest("http://localhost/api/admin/profiles/abc/promote", { method: "POST" });
    const res = await POST(req, makeParams("abc"));
    expect(res.status).toBe(403);
  });

  it("promeut un utilisateur en admin", async () => {
    const updateChain = { update: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ error: null }) };
    const logChain = { insert: vi.fn().mockResolvedValue({ error: null }) };
    mockFrom.mockImplementation((table: string) =>
      table === "ivoireio_admin_logs" ? logChain : updateChain
    );

    const { POST } = await import("@/app/api/admin/profiles/[id]/promote/route");
    const req = makeRequest("http://localhost/api/admin/profiles/user-2/promote", { method: "POST" });
    const res = await POST(req, makeParams("user-2"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(updateChain.update).toHaveBeenCalledWith(expect.objectContaining({ is_admin: true }));
    expect(logChain.insert).toHaveBeenCalledWith(expect.objectContaining({ action: "profile_promoted_admin" }));
  });

  it("empêche l'auto-promotion", async () => {
    const { POST } = await import("@/app/api/admin/profiles/[id]/promote/route");
    const req = makeRequest("http://localhost/api/admin/profiles/admin-1/promote", { method: "POST" });
    const res = await POST(req, makeParams("admin-1"));

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});
