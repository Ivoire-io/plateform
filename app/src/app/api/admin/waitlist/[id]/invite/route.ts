import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidSlug, RESERVED_SUBDOMAINS, TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;

  // Récupère l'entrée waitlist via service role (RLS bypass — adminGuard déjà validé)
  const { data: entry, error: fetchError } = await supabaseAdmin
    .from(TABLES.waitlist)
    .select("email, invited, full_name, desired_slug, type, converted_profile_id")
    .eq("id", id)
    .single();

  if (fetchError || !entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  if (entry.invited) {
    return NextResponse.json({ error: "Already invited" }, { status: 409 });
  }

  const email = String(entry.email || "").toLowerCase().trim();
  const desiredSlug = String(entry.desired_slug || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  if (!desiredSlug || !isValidSlug(desiredSlug) || RESERVED_SUBDOMAINS.has(desiredSlug)) {
    return NextResponse.json({ error: "Invalid desired_slug" }, { status: 400 });
  }

  // Vérifie si un profil existe déjà pour cet email (cas d'une tentative précédente partielle)
  const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("id, slug, email")
    .eq("email", email)
    .maybeSingle();

  if (existingProfileError) {
    return NextResponse.json({ error: existingProfileError.message }, { status: 500 });
  }

  let userId: string;
  let actionLink: string | undefined;

  if (existingProfile) {
    // Profil déjà créé (tentative précédente partiellement réussie) — reprise idempotente
    // Si le slug a changé entre-temps et qu'il appartient à quelqu'un d'autre, on bloque
    if (existingProfile.slug !== desiredSlug) {
      const { data: slugOwner } = await supabaseAdmin
        .from(TABLES.profiles)
        .select("id")
        .eq("slug", desiredSlug)
        .maybeSingle();
      if (slugOwner && slugOwner.id !== existingProfile.id) {
        return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
      }
    }
    userId = existingProfile.id;

    // Génère un nouveau magic link pour cet utilisateur existant
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ivoire.io";
    const redirectTo = `${siteUrl.replace(/\/+$/, "")}/auth/callback`;
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });
    if (!linkError) {
      actionLink = (linkData as unknown as { properties?: { action_link?: string } })
        ?.properties?.action_link;
    }
  } else {
    // Vérifie si le slug est libre avant toute création
    const { data: slugOwner, error: slugOwnerError } = await supabaseAdmin
      .from(TABLES.profiles)
      .select("id")
      .eq("slug", desiredSlug)
      .maybeSingle();

    if (slugOwnerError) {
      return NextResponse.json({ error: slugOwnerError.message }, { status: 500 });
    }
    if (slugOwner) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
    }

    // Génère un magic link Supabase (crée ou récupère l'utilisateur auth)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ivoire.io";
    const redirectTo = `${siteUrl.replace(/\/+$/, "")}/auth/callback`;

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    if (linkError || !linkData?.user?.id) {
      return NextResponse.json(
        { error: linkError?.message || "Unable to generate access link" },
        { status: 500 }
      );
    }

    userId = linkData.user.id;
    actionLink = (linkData as unknown as { properties?: { action_link?: string } })
      ?.properties?.action_link;

    // Crée le profil (id = auth.uid)
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

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
  }

  // Marquer comme invité + converti
  const now = new Date().toISOString();
  const { error: waitlistUpdateError } = await supabaseAdmin
    .from(TABLES.waitlist)
    .update({
      invited: true,
      invited_at: now,
      converted_profile_id: userId,
      converted_at: now,
    })
    .eq("id", id);

  if (waitlistUpdateError) {
    return NextResponse.json({ error: waitlistUpdateError.message }, { status: 500 });
  }

  // Log admin (schéma: type/description/actor_id/target_id/metadata)
  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "waitlist",
    description: "Invitation envoyée (conversion waitlist → profil + accès).",
    actor_id: guard.userId,
    target_id: id,
    metadata: { email, profile_id: userId, slug: desiredSlug },
  });

  // Email (non-bloquant): si Resend configuré, on envoie le magic link
  let emailSent = false;
  if (
    actionLink &&
    process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== "re_xxxxxxxxxxxxxxxxxxxxxxxx"
  ) {
    const resend = new Resend(process.env.RESEND_API_KEY);
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
              Si le bouton ne marche pas, copie-colle ce lien dans ton navigateur :<br/>
              <span style="word-break:break-all;color:#fff;">${actionLink}</span>
            </p>
          </div>
        `,
      })
      .then(() => {
        emailSent = true;
      })
      .catch(() => {
        // silencieux si Resend non configuré / erreur SMTP
      });
  }

  return NextResponse.json({
    success: true,
    data: {
      profile_id: userId,
      slug: desiredSlug,
      email_sent: emailSent,
      // utile si Resend non configuré: l'admin peut copier le lien
      action_link: emailSent ? undefined : actionLink ?? null,
    },
  });
}
