import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/subscriptions/[id] — Update subscription (plan, status)
export async function PATCH(request: Request, context: RouteContext) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await context.params;
  const body = await request.json();
  const { plan, status } = body as { plan?: string; status?: string };

  if (!plan && !status) {
    return NextResponse.json(
      { error: "At least one of plan or status is required." },
      { status: 400 }
    );
  }

  // Fetch the current subscription to get profile_id
  const { data: subscription, error: fetchError } = await supabaseAdmin
    .from(TABLES.subscriptions)
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !subscription) {
    return NextResponse.json(
      { error: "Subscription not found." },
      { status: 404 }
    );
  }

  // Build update payload
  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (plan) updatePayload.plan = plan;
  if (status) updatePayload.status = status;

  const { data, error } = await supabaseAdmin
    .from(TABLES.subscriptions)
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If status changed, also update the profile plan accordingly
  if (status && subscription.profile_id) {
    if (status === "active") {
      // Activate: set profile plan to the subscription plan
      const profilePlan = plan || subscription.plan;
      await supabaseAdmin
        .from(TABLES.profiles)
        .update({ plan: profilePlan, updated_at: new Date().toISOString() })
        .eq("id", subscription.profile_id);
    } else if (status === "cancelled") {
      // Cancelled: revert profile to free plan
      await supabaseAdmin
        .from(TABLES.profiles)
        .update({ plan: "free", updated_at: new Date().toISOString() })
        .eq("id", subscription.profile_id);
    }
  }

  // Log admin action
  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "subscription",
    description: `Subscription ${id} updated — plan: ${plan || "unchanged"}, status: ${status || "unchanged"}`,
    actor_id: guard.userId,
    target_id: id,
    metadata: { action: "subscription_update", plan, status },
  });

  return NextResponse.json({ success: true, data });
}
