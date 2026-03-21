import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/admin/payments/[id]/review — Approve or reject a manual payment
export async function POST(request: Request, context: RouteContext) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await context.params;
  const body = await request.json();
  const { action, notes } = body as {
    action: "approve" | "reject";
    notes?: string;
  };

  if (!action || !["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "action must be 'approve' or 'reject'." },
      { status: 400 }
    );
  }

  // Fetch the payment
  const { data: payment, error: fetchError } = await supabaseAdmin
    .from(TABLES.payments)
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !payment) {
    return NextResponse.json(
      { error: "Payment not found." },
      { status: 404 }
    );
  }

  const now = new Date().toISOString();

  if (action === "approve") {
    // 1. Update payment to completed
    const { error: paymentError } = await supabaseAdmin
      .from(TABLES.payments)
      .update({
        status: "completed",
        reviewed_by: guard.userId,
        reviewed_at: now,
        review_notes: notes || null,
        updated_at: now,
      })
      .eq("id", id);

    if (paymentError) {
      return NextResponse.json(
        { error: paymentError.message },
        { status: 500 }
      );
    }

    // 2. Determine the plan from payment metadata
    const planFromPayment =
      payment.metadata?.plan || payment.plan || "pro";

    // 3. Find or create subscription
    const { data: existingSub } = await supabaseAdmin
      .from(TABLES.subscriptions)
      .select("id")
      .eq("profile_id", payment.profile_id)
      .maybeSingle();

    if (existingSub) {
      // Update existing subscription
      await supabaseAdmin
        .from(TABLES.subscriptions)
        .update({
          status: "active",
          plan: planFromPayment,
          updated_at: now,
        })
        .eq("id", existingSub.id);
    } else {
      // Create new subscription
      await supabaseAdmin.from(TABLES.subscriptions).insert({
        profile_id: payment.profile_id,
        plan: planFromPayment,
        status: "active",
        payment_method: payment.method || "manual",
        started_at: now,
        created_at: now,
        updated_at: now,
      });
    }

    // 4. Update profile plan
    await supabaseAdmin
      .from(TABLES.profiles)
      .update({ plan: planFromPayment, updated_at: now })
      .eq("id", payment.profile_id);

    // 5. Decrement free_slots_remaining in platform_config if applicable
    const { data: configRow } = await supabaseAdmin
      .from(TABLES.platform_config)
      .select("value")
      .eq("key", "free_slots_remaining")
      .maybeSingle();

    if (configRow && typeof configRow.value === "number" && configRow.value > 0) {
      await supabaseAdmin
        .from(TABLES.platform_config)
        .update({
          value: configRow.value - 1,
          updated_at: now,
        })
        .eq("key", "free_slots_remaining");
    }
  } else {
    // action === "reject"

    // 1. Update payment to failed
    const { error: paymentError } = await supabaseAdmin
      .from(TABLES.payments)
      .update({
        status: "failed",
        reviewed_by: guard.userId,
        reviewed_at: now,
        review_notes: notes || null,
        updated_at: now,
      })
      .eq("id", id);

    if (paymentError) {
      return NextResponse.json(
        { error: paymentError.message },
        { status: 500 }
      );
    }

    // 2. If a pending subscription exists, cancel it
    const { data: pendingSub } = await supabaseAdmin
      .from(TABLES.subscriptions)
      .select("id")
      .eq("profile_id", payment.profile_id)
      .eq("status", "pending")
      .maybeSingle();

    if (pendingSub) {
      await supabaseAdmin
        .from(TABLES.subscriptions)
        .update({ status: "cancelled", updated_at: now })
        .eq("id", pendingSub.id);
    }
  }

  // Log admin action
  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "payment",
    description: `Payment ${id} ${action === "approve" ? "approved" : "rejected"}`,
    actor_id: guard.userId,
    target_id: id,
    metadata: { action: `payment_${action}`, notes },
  });

  return NextResponse.json({ success: true });
}
