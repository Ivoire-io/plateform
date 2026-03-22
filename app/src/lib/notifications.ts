// ─── Notifications Service ───
// Multi-channel notification delivery: in-app, WhatsApp, email

import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { sendWhatsAppMessage } from "@/lib/wasender";
import { Resend } from "resend";

export interface CreateNotifParams {
  profile_id: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
  channels?: ("inapp" | "whatsapp" | "email")[];
}

/**
 * Create and deliver a notification across multiple channels.
 * Respects user preferences (notif_inapp, notif_whatsapp, notif_messages).
 */
export async function createNotification(params: CreateNotifParams): Promise<void> {
  const {
    profile_id,
    type,
    title,
    body,
    link,
    metadata = {},
    channels = ["inapp"],
  } = params;

  // Load profile preferences
  const { data: profile } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("email, verified_phone, notif_inapp, notif_whatsapp, notif_messages, full_name")
    .eq("id", profile_id)
    .single();

  if (!profile) return;

  // In-app notification
  if (channels.includes("inapp") && profile.notif_inapp !== false) {
    await supabaseAdmin.from(TABLES.notifications).insert({
      profile_id,
      type,
      title,
      body: body || null,
      link: link || null,
      channel: "inapp",
      metadata,
    });
  }

  // WhatsApp notification
  if (channels.includes("whatsapp") && profile.notif_whatsapp !== false && profile.verified_phone) {
    const message = body ? `${title}\n\n${body}` : title;
    const sent = await sendWhatsAppMessage(profile.verified_phone, message);

    // Log
    await supabaseAdmin.from(TABLES.whatsapp_logs).insert({
      phone: profile.verified_phone,
      message_type: "notification",
      content: message.slice(0, 500),
      status: sent ? "sent" : "failed",
      profile_id,
      metadata: { notification_type: type },
    });
  }

  // Email notification
  if (
    channels.includes("email") &&
    profile.notif_messages !== false &&
    profile.email &&
    !profile.email.endsWith("@phone.ivoire.io") &&
    process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== "re_xxxxxxxxxxxxxxxxxxxxxxxx"
  ) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ivoire.io";
      const ctaLink = link ? `${siteUrl}${link}` : siteUrl;

      await resend.emails.send({
        from: "ivoire.io <noreply@ivoire.io>",
        to: profile.email,
        subject: title,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #fff; padding: 40px; border-radius: 12px;">
            <h2 style="color: #FF6B00; margin-bottom: 8px;">${title}</h2>
            ${body ? `<p style="color: #A0A0A0; margin-bottom: 18px;">${body}</p>` : ""}
            ${link ? `<a href="${ctaLink}" style="display:inline-block;background:#FF6B00;color:#0A0A0A;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;">Voir sur ivoire.io</a>` : ""}
            <p style="color: #A0A0A0; font-size: 12px; margin-top: 24px; border-top: 1px solid #1A1A2E; padding-top: 16px;">
              ivoire.io -- Le hub de la tech ivoirienne
            </p>
          </div>
        `,
      });
    } catch {
      // Silently fail
    }
  }
}

/**
 * Create notifications for multiple profiles at once (batch).
 */
export async function createBatchNotifications(
  profileIds: string[],
  params: Omit<CreateNotifParams, "profile_id">
): Promise<void> {
  // Process sequentially to respect rate limits
  for (const profileId of profileIds) {
    await createNotification({ ...params, profile_id: profileId });
  }
}
