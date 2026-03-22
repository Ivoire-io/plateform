/**
 * Tests — POST /api/register
 *
 * Couvre : validation, mode waitlist, mode open (developer, startup, enterprise),
 *          doublon email, cleanup auth user si profil échoue, registration_extra
 */
import { afterEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockFrom = vi.fn();
const mockCreateUser = vi.fn();
const mockGenerateLink = vi.fn();
const mockDeleteUser = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      admin: {
        createUser: (...args: unknown[]) => mockCreateUser(...args),
        generateLink: (...args: unknown[]) => mockGenerateLink(...args),
        deleteUser: (...args: unknown[]) => mockDeleteUser(...args),
      },
    },
  },
}));

vi.mock("resend", () => {
  class MockResend {
    emails = { send: vi.fn().mockResolvedValue({ id: "ok" }) };
  }
  return { Resend: MockResend };
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function setupWaitlistMode() {
  mockFrom.mockImplementation((table: string) => {
    if (table.includes("platform_config")) {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { value: "waitlist" }, error: null }),
      };
    }
    if (table.includes("waitlist")) {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    }
    if (table.includes("profiles")) {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    }
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    };
  });
}

function setupOpenMode(profileInsertResult = { error: null }) {
  mockCreateUser.mockResolvedValue({ data: { user: { id: "new-user-id" } }, error: null });
  mockGenerateLink.mockResolvedValue({
    data: { user: { id: "new-user-id" }, properties: { action_link: "https://magic.link/token" } },
    error: null,
  });

  mockFrom.mockImplementation((table: string) => {
    if (table.includes("platform_config")) {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { value: "open" }, error: null }),
      };
    }
    if (table.includes("waitlist")) {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    }
    if (table.includes("profiles")) {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue(profileInsertResult),
      };
    }
    if (table.includes("referrals")) {
      return { insert: vi.fn().mockResolvedValue({ error: null }) };
    }
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    };
  });
}

// ─── Suite : Validation ─────────────────────────────────────────────────────

describe("POST /api/register — validation", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("rejette si email manquant", async () => {
    const { POST } = await import("@/app/api/register/route");
    const res = await POST(makeRequest({ full_name: "Test", desired_slug: "test" }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it("rejette si full_name manquant", async () => {
    const { POST } = await import("@/app/api/register/route");
    const res = await POST(makeRequest({ email: "a@b.com", desired_slug: "test" }));
    expect(res.status).toBe(400);
  });

  it("rejette si desired_slug manquant", async () => {
    const { POST } = await import("@/app/api/register/route");
    const res = await POST(makeRequest({ email: "a@b.com", full_name: "Test" }));
    expect(res.status).toBe(400);
  });

  it("rejette un email invalide", async () => {
    const { POST } = await import("@/app/api/register/route");
    const res = await POST(makeRequest({ email: "not-an-email", full_name: "Test", desired_slug: "myslug" }));
    expect(res.status).toBe(400);
  });

  it("rejette un slug réservé", async () => {
    const { POST } = await import("@/app/api/register/route");
    // "admin" est réservé
    const res = await POST(makeRequest({ email: "a@b.com", full_name: "Test", desired_slug: "admin" }));
    expect(res.status).toBe(409);
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

    const { POST } = await import("@/app/api/register/route");
    const res = await POST(makeRequest({ email: "new@test.com", full_name: "Test", desired_slug: "taken" }));
    expect(res.status).toBe(409);
  });
});

// ─── Suite : Mode waitlist ──────────────────────────────────────────────────

describe("POST /api/register — mode waitlist", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("ajoute l'email à la waitlist", async () => {
    setupWaitlistMode();
    const { POST } = await import("@/app/api/register/route");
    const res = await POST(makeRequest({ email: "dev@test.com", full_name: "Dev Test", desired_slug: "devtest" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.mode).toBe("waitlist");
  });

  it("renvoie 409 si l'email est déjà dans la waitlist", async () => {
    // Track calls per table to distinguish slug check vs email check for waitlist table
    let waitlistCallCount = 0;
    mockFrom.mockImplementation((table: string) => {
      if (table.includes("platform_config")) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { value: "waitlist" }, error: null }),
        };
      }
      if (table.includes("profiles")) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      if (table.includes("waitlist")) {
        waitlistCallCount++;
        const callNum = waitlistCallCount;
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue(
            callNum === 1
              ? { data: null, error: null }              // slug check → libre
              : { data: { id: "existing" }, error: null } // email check → déjà pris
          ),
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    });

    const { POST } = await import("@/app/api/register/route");
    const res = await POST(makeRequest({ email: "dup@test.com", full_name: "Dup", desired_slug: "uniqueslug" }));
    expect(res.status).toBe(409);
  });
});

// ─── Suite : Mode open — developer ─────────────────────────────────────────

describe("POST /api/register — mode open, developer", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("crée un profil developer avec registration_extra", async () => {
    setupOpenMode();

    const profilesChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    // Override setupOpenMode to track profiles insert
    mockFrom.mockImplementation((table: string) => {
      if (table.includes("platform_config")) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { value: "open" }, error: null }),
        };
      }
      if (table.includes("profiles")) {
        return profilesChain;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
        count: "exact",
      };
    });

    const { POST } = await import("@/app/api/register/route");
    const res = await POST(makeRequest({
      email: "dev@test.com",
      full_name: "Dev Test",
      desired_slug: "devtest",
      type: "developer",
      extra: { skills: ["React", "TypeScript"], title: "Frontend Dev", city: "Abidjan" },
    }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.mode).toBe("open");

    const profileInsertCall = profilesChain.insert.mock.calls[0]?.[0];
    expect(profileInsertCall).toBeDefined();
    if (profileInsertCall) {
      expect(profileInsertCall.type).toBe("developer");
      expect(profileInsertCall.skills).toEqual(["React", "TypeScript"]);
      expect(profileInsertCall.title).toBe("Frontend Dev");
      expect(profileInsertCall.city).toBe("Abidjan");
      expect(profileInsertCall.registration_extra).toMatchObject({
        skills: ["React", "TypeScript"],
        title: "Frontend Dev",
        city: "Abidjan",
      });
    }
  });
});

// ─── Suite : Mode open — startup ───────────────────────────────────────────

describe("POST /api/register — mode open, startup", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("crée un profil startup avec registration_extra contenant startup_name/sector/stage", async () => {
    const profilesChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    mockCreateUser.mockResolvedValue({ data: { user: { id: "startup-user-id" } }, error: null });
    mockGenerateLink.mockResolvedValue({
      data: { user: { id: "startup-user-id" }, properties: { action_link: "https://magic.link/token" } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table.includes("platform_config")) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { value: "open" }, error: null }),
        };
      }
      if (table.includes("profiles")) {
        return profilesChain;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    });

    const { POST } = await import("@/app/api/register/route");
    const res = await POST(makeRequest({
      email: "startup@test.com",
      full_name: "Startup Founder",
      desired_slug: "mystartup",
      type: "startup",
      extra: {
        startup_name: "MonStartup",
        tagline: "La meilleure app",
        sector: "fintech",
        stage: "mvp",
        problem_statement: "Résoudre X",
      },
    }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    const profileInsertCall = profilesChain.insert.mock.calls[0]?.[0];
    expect(profileInsertCall).toBeDefined();
    if (profileInsertCall) {
      expect(profileInsertCall.type).toBe("startup");
      // startup n'a pas de skills dans le profil
      expect(profileInsertCall.skills).toEqual([]);
      // registration_extra doit contenir les données startup
      expect(profileInsertCall.registration_extra).toMatchObject({
        startup_name: "MonStartup",
        sector: "fintech",
        stage: "mvp",
      });
    }
  });
});

// ─── Suite : Mode open — enterprise ────────────────────────────────────────

describe("POST /api/register — mode open, enterprise", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("crée un profil enterprise avec registration_extra contenant company_name/sector", async () => {
    const profilesChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    mockCreateUser.mockResolvedValue({ data: { user: { id: "enterprise-user-id" } }, error: null });
    mockGenerateLink.mockResolvedValue({
      data: { user: { id: "enterprise-user-id" }, properties: { action_link: null } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table.includes("platform_config")) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { value: "open" }, error: null }),
        };
      }
      if (table.includes("profiles")) {
        return profilesChain;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    });

    const { POST } = await import("@/app/api/register/route");
    const res = await POST(makeRequest({
      email: "corp@test.com",
      full_name: "Corp Manager",
      desired_slug: "corp-test",
      type: "enterprise",
      extra: {
        company_name: "TechCorp CI",
        sector: "banking",
        company_size: "51-200",
        hiring_needs: "Développeurs full-stack",
      },
    }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    const profileInsertCall = profilesChain.insert.mock.calls[0]?.[0];
    expect(profileInsertCall).toBeDefined();
    if (profileInsertCall) {
      expect(profileInsertCall.type).toBe("enterprise");
      expect(profileInsertCall.registration_extra).toMatchObject({
        company_name: "TechCorp CI",
        sector: "banking",
        company_size: "51-200",
      });
    }
  });
});

// ─── Suite : Mode open — gestion d'erreurs ─────────────────────────────────

describe("POST /api/register — mode open, gestion d'erreurs", () => {
  afterEach(() => { vi.clearAllMocks(); vi.resetModules(); });

  it("supprime l'utilisateur auth si la création du profil échoue", async () => {
    mockDeleteUser.mockResolvedValue({ error: null });
    mockCreateUser.mockResolvedValue({ data: { user: { id: "new-id" } }, error: null });
    mockGenerateLink.mockResolvedValue({ data: { properties: {} }, error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table.includes("platform_config")) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { value: "open" }, error: null }),
        };
      }
      if (table.includes("profiles")) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          insert: vi.fn().mockResolvedValue({ error: { message: "DB error" } }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      };
    });

    const { POST } = await import("@/app/api/register/route");
    const res = await POST(makeRequest({
      email: "fail@test.com",
      full_name: "Fail User",
      desired_slug: "failuser",
      type: "developer",
    }));

    expect(res.status).toBe(500);
    expect(mockDeleteUser).toHaveBeenCalledWith("new-id");
  });

  it("renvoie 409 si un profil avec cet email existe déjà (mode open)", async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table.includes("platform_config")) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: { value: "open" }, error: null }),
        };
      }
      if (table.includes("profiles")) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn()
            .mockResolvedValueOnce({ data: null, error: null }) // slug check waitlist
            .mockResolvedValueOnce({ data: null, error: null }) // slug check profiles
            .mockResolvedValueOnce({ data: { id: "dup" }, error: null }), // email check
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    // auth already registered error
    mockCreateUser.mockResolvedValue({
      data: null,
      error: { message: "User already been registered" },
    });

    const { POST } = await import("@/app/api/register/route");
    const res = await POST(makeRequest({
      email: "existing@test.com",
      full_name: "Existing",
      desired_slug: "existing-user",
      type: "developer",
    }));

    expect(res.status).toBe(409);
  });
});
