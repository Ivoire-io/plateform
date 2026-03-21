import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// POST — cancel current subscription
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { data: subscription } = await supabaseAdmin
    .from(TABLES.subscriptions)
    .select("id, plan, status")
    .eq("profile_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json(
      { error: "Aucun abonnement actif" },
      { status: 404 }
    );
  }

  // Cancel subscription
  await supabaseAdmin
    .from(TABLES.subscriptions)
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", subscription.id);

  // Revert to free plan
  await supabaseAdmin
    .from(TABLES.profiles)
    .update({ plan: "free" })
    .eq("id", user.id);

  // Log
  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "payment",
    description: `Abonnement ${subscription.plan} annule`,
    actor_id: user.id,
    target_id: user.id,
    metadata: { previous_plan: subscription.plan },
  });

  return NextResponse.json({ success: true });
}
