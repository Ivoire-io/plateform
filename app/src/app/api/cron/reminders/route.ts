import { createNotification } from "@/lib/notifications";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET /api/cron/reminders — Send onboarding reminders to incomplete profiles
// Protected by CRON_SECRET header
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find profiles where onboarding is incomplete, created > 24h ago
    const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: profiles, error } = await supabaseAdmin
      .from(TABLES.profiles)
      .select("id, full_name, slug, created_at")
      .eq("onboarding_completed", false)
      .eq("is_suspended", false)
      .lt("created_at", cutoff24h);

    if (error || !profiles) {
      return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
    }

    let sent = 0;
    for (const profile of profiles) {
      // Check if a reminder was already sent in the last 48h
      const { count } = await supabaseAdmin
        .from(TABLES.notifications)
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profile.id)
        .eq("type", "reminder_onboarding")
        .gte("created_at", cutoff48h);

      if ((count ?? 0) > 0) continue; // Already reminded recently

      await createNotification({
        profile_id: profile.id,
        type: "reminder_onboarding",
        title: "Complete ton profil !",
        body: `Salut ${profile.full_name} ! Ton portfolio ${profile.slug}.ivoire.io t'attend. Complete ton profil pour etre visible.`,
        link: "/dashboard",
        channels: ["inapp", "whatsapp"],
      });

      sent++;
    }

    return NextResponse.json({
      success: true,
      profiles_checked: profiles.length,
      reminders_sent: sent,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Erreur interne" },
      { status: 500 }
    );
  }
}
