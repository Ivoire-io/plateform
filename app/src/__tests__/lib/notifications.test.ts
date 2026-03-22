import { afterEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ───
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

vi.mock("@/lib/wasender", () => ({
  sendWhatsAppMessage: vi.fn().mockResolvedValue(true),
}));

vi.mock("resend", () => {
  class MockResend {
    emails = { send: vi.fn().mockResolvedValue({ id: "ok" }) };
  }
  return { Resend: MockResend };
});

describe("createNotification", () => {
  afterEach(() => vi.clearAllMocks());

  it("cree une notification in-app quand notif_inapp est true", async () => {
    const insertFn = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table.includes("profiles")) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  email: "test@example.com",
                  verified_phone: null,
                  notif_inapp: true,
                  notif_whatsapp: false,
                  notif_messages: true,
                  full_name: "Test User",
                },
                error: null,
              }),
            }),
          }),
        };
      }
      return { insert: insertFn };
    });

    const { createNotification } = await import("@/lib/notifications");
    await createNotification({
      profile_id: "user-123",
      type: "welcome",
      title: "Bienvenue !",
      channels: ["inapp"],
    });

    expect(insertFn).toHaveBeenCalledTimes(1);
    expect(insertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        profile_id: "user-123",
        type: "welcome",
        title: "Bienvenue !",
        channel: "inapp",
      })
    );
  });

  it("ne cree pas de notification si notif_inapp est false", async () => {
    const insertFn = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table.includes("profiles")) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  email: "test@example.com",
                  verified_phone: null,
                  notif_inapp: false,
                  notif_whatsapp: false,
                  notif_messages: false,
                  full_name: "Test User",
                },
                error: null,
              }),
            }),
          }),
        };
      }
      return { insert: insertFn };
    });

    const { createNotification } = await import("@/lib/notifications");
    await createNotification({
      profile_id: "user-123",
      type: "welcome",
      title: "Bienvenue !",
      channels: ["inapp"],
    });

    expect(insertFn).not.toHaveBeenCalled();
  });

  it("envoie un WhatsApp si notif_whatsapp et verified_phone", async () => {
    const insertFn = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table.includes("profiles")) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  email: "test@example.com",
                  verified_phone: "+2250101010101",
                  notif_inapp: true,
                  notif_whatsapp: true,
                  notif_messages: true,
                  full_name: "Test User",
                },
                error: null,
              }),
            }),
          }),
        };
      }
      return { insert: insertFn };
    });

    const { sendWhatsAppMessage } = await import("@/lib/wasender");
    const { createNotification } = await import("@/lib/notifications");
    await createNotification({
      profile_id: "user-123",
      type: "welcome",
      title: "Bienvenue !",
      body: "Ton profil est pret.",
      channels: ["inapp", "whatsapp"],
    });

    expect(sendWhatsAppMessage).toHaveBeenCalledWith(
      "+2250101010101",
      "Bienvenue !\n\nTon profil est pret."
    );
  });

  it("ne fait rien si le profil n'existe pas", async () => {
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Not found" },
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    }));

    const { createNotification } = await import("@/lib/notifications");
    // Should not throw
    await createNotification({
      profile_id: "nonexistent",
      type: "welcome",
      title: "Bienvenue !",
    });
  });
});
