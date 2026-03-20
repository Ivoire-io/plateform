import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidSlug, RESERVED_SUBDOMAINS, TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(_req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  // Récupère tous les non-invités via service role (RLS bypass — adminGuard déjà validé)
  const { data: pending, error: fetchError } = await supabaseAdmin
    .from(TABLES.waitlist)
    .select("id, email, full_name, desired_slug, type")
    .eq("invited", false);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!pending || pending.length === 0) {
    return NextResponse.json({ invited: 0, message: "No pending entries" });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ivoire.io";
  const redirectTo = `${siteUrl.replace(/\/+$/, "")}/auth/callback`;
  const now = new Date().toISOString();

  const canSendEmail =
    !!process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== "re_xxxxxxxxxxxxxxxxxxxxxxxx";
  const resend = canSendEmail ? new Resend(process.env.RESEND_API_KEY) : null;

  let converted = 0;
  let emailed = 0;
  const failures: Array<{ id: string; reason: string }> = [];

  // Best-effort, séquentiel (évite de se faire rate-limit côté auth/email)
  for (const entry of pending) {
    try {
      const email = String(entry.email || "").toLowerCase().trim();
      const desiredSlug = String(entry.desired_slug || "")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "");

      if (!email) throw new Error("missing_email");
      if (!desiredSlug || !isValidSlug(desiredSlug) || RESERVED_SUBDOMAINS.has(desiredSlug)) {
        throw new Error("invalid_desired_slug");
      }

      const { data: slugOwner } = await supabaseAdmin
        .from(TABLES.profiles)
        .select("id")
        .eq("slug", desiredSlug)
        .maybeSingle();
      if (slugOwner) throw new Error("slug_taken");

      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo },
      });
      if (linkError || !linkData?.user?.id) throw new Error(linkError?.message || "generate_link_failed");

      const userId = linkData.user.id;
      const actionLink = (linkData as unknown as { properties?: { action_link?: string } })?.properties
        ?.action_link;

      const fullName = (entry.full_name ?? "").toString().trim() || email.split("@")[0];
      const type = (entry.type ?? "developer") as "developer" | "startup" | "enterprise" | "other";

      const { error: upsertError } = await supabaseAdmin
        .from(TABLES.profiles)
        .upsert(
          {
            id: userId,
            slug: desiredSlug,
            email,
            full_name: fullName,
            type,
            is_suspended: false,
          },
          { onConflict: "id" }
        );
      if (upsertError) throw new Error(upsertError.message);

      const { error: werr } = await supabase
        .from(TABLES.waitlist)
        .update({
          invited: true,
          invited_at: now,
          converted_profile_id: userId,
          converted_at: now,
        })
        .eq("id", entry.id);
      if (werr) throw new Error(werr.message);

      converted += 1;

      if (resend && actionLink) {
        await resend.emails
          .send({
            from: "ivoire.io <noreply@ivoire.io>",
            to: email,
            subject: "Tes accès ivoire.io sont prêts",
            html: `
              <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #fff; padding: 40px; border-radius: 12px;">
                <h1 style="color: #FF6B00; margin-bottom: 8px;">Bienvenue sur ivoire.io 🇨🇮</h1>
                <p style="color: #A0A0A0; margin-bottom: 18px;">
                  Ton compte est activé. Ton portfolio est accessible sur :
                  <strong style="color:#fff;">${desiredSlug}.ivoire.io</strong>
                </p>

                <a href="${actionLink}" style="display:inline-block;background:#FF6B00;color:#0A0A0A;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600;">
                  Se connecter et compléter mon profil
                </a>

                <p style="color:#A0A0A0;margin-top:18px;font-size:12px;">
                  Si le bouton ne marche pas, copie-colle ce lien :<br/>
                  <span style="word-break:break-all;color:#fff;">${actionLink}</span>
                </p>
              </div>
            `,
          })
          .then(() => {
            emailed += 1;
          })
          .catch(() => {
            // best-effort
          });
      }
    } catch (e) {
      failures.push({ id: entry.id, reason: e instanceof Error ? e.message : "unknown_error" });
    }
  }

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "waitlist",
    description: "Invitation en masse (conversion waitlist → profil + accès).",
    actor_id: guard.userId,
    metadata: { requested: pending.length, converted, emailed, failures: failures.slice(0, 25) },
  });

  return NextResponse.json({
    success: true,
    data: {
      requested: pending.length,
      converted,
      emailed,
      failures,
      note: canSendEmail ? undefined : "RESEND_API_KEY non configurée: les accès ont été créés, mais aucun email n'a été envoyé.",
    },
  });
}
