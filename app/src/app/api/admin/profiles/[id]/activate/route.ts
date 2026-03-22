import { adminGuard } from "@/lib/admin-guard";
import { createNotification } from "@/lib/notifications";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from(TABLES.profiles)
    .update({ is_suspended: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "profile",
    description: "Profil activé (suspension levée).",
    actor_id: guard.userId,
    target_id: id,
  });

  // Notify user about reactivation (non-blocking)
  createNotification({
    profile_id: id,
    type: "account_status",
    title: "Ton compte a ete reactive !",
    body: "Ton profil est de nouveau visible dans l'annuaire. Bienvenue !",
    link: "/dashboard",
    channels: ["inapp", "whatsapp", "email"],
  }).catch(() => { });

  return NextResponse.json({ success: true });
}
