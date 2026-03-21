import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

// POST — PayPal webhook (no auth, called by PayPal)
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);

    const eventType = event?.event_type;
    if (!eventType) {
      // Always return 200 to prevent PayPal retries
      return NextResponse.json({ received: true });
    }

    // MVP: validate event type instead of full signature verification
    // TODO: implement full webhook signature verification via
    // POST ${PAYPAL_BASE}/v1/notifications/verify-webhook-signature
    const handledEvents = [
      "PAYMENT.CAPTURE.COMPLETED",
      "PAYMENT.CAPTURE.DENIED",
    ];

    if (!handledEvents.includes(eventType)) {
      return NextResponse.json({ received: true });
    }

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId =
        event?.resource?.supplementary_data?.related_ids?.order_id;

      if (!orderId) {
        console.error("PayPal webhook: missing order_id in CAPTURE.COMPLETED");
        return NextResponse.json({ received: true });
      }

      // Find the pending payment by paypal_order_id
      const { data: payment } = await supabaseAdmin
        .from(TABLES.payments)
        .select("id, profile_id, amount, metadata")
        .eq("paypal_order_id", orderId)
        .maybeSingle();

      if (!payment) {
        console.error(
          `PayPal webhook: payment not found for order ${orderId}`
        );
        return NextResponse.json({ received: true });
      }

      // Update payment status to completed
      await supabaseAdmin
        .from(TABLES.payments)
        .update({ status: "completed" })
        .eq("id", payment.id);

      // Extract plan from metadata
      const plan =
        ((payment.metadata as Record<string, unknown>)?.plan as string) ||
        "starter";

      // Activate subscription (upsert)
      const { data: existingSub } = await supabaseAdmin
        .from(TABLES.subscriptions)
        .select("id")
        .eq("profile_id", payment.profile_id)
        .maybeSingle();

      if (existingSub) {
        await supabaseAdmin
          .from(TABLES.subscriptions)
          .update({
            plan,
            payment_method: "paypal",
            status: "active",
            amount: payment.amount,
            started_at: new Date().toISOString(),
            cancelled_at: null,
          })
          .eq("id", existingSub.id);
      } else {
        await supabaseAdmin.from(TABLES.subscriptions).insert({
          profile_id: payment.profile_id,
          plan,
          payment_method: "paypal",
          status: "active",
          amount: payment.amount,
        });
      }

      // Update profile plan
      await supabaseAdmin
        .from(TABLES.profiles)
        .update({ plan })
        .eq("id", payment.profile_id);

      // Log
      await supabaseAdmin.from(TABLES.admin_logs).insert({
        type: "payment",
        description: `Webhook PayPal — Paiement capture — Plan ${plan}`,
        actor_id: payment.profile_id,
        target_id: payment.profile_id,
        metadata: {
          plan,
          amount: payment.amount,
          paypal_order_id: orderId,
          event_type: eventType,
        },
      });
    }

    if (eventType === "PAYMENT.CAPTURE.DENIED") {
      const orderId =
        event?.resource?.supplementary_data?.related_ids?.order_id;

      if (!orderId) {
        console.error("PayPal webhook: missing order_id in CAPTURE.DENIED");
        return NextResponse.json({ received: true });
      }

      // Find payment
      const { data: payment } = await supabaseAdmin
        .from(TABLES.payments)
        .select("id, profile_id")
        .eq("paypal_order_id", orderId)
        .maybeSingle();

      if (!payment) {
        console.error(
          `PayPal webhook: payment not found for order ${orderId}`
        );
        return NextResponse.json({ received: true });
      }

      // Update payment status to failed
      await supabaseAdmin
        .from(TABLES.payments)
        .update({ status: "failed" })
        .eq("id", payment.id);

      // Log
      await supabaseAdmin.from(TABLES.admin_logs).insert({
        type: "payment",
        description: `Webhook PayPal — Paiement refuse`,
        actor_id: payment.profile_id,
        target_id: payment.profile_id,
        metadata: {
          paypal_order_id: orderId,
          event_type: eventType,
        },
      });
    }

    // Always return 200 to prevent PayPal retries
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("PayPal webhook error:", err);
    // Always return 200 to prevent PayPal retries
    return NextResponse.json({ received: true });
  }
}
