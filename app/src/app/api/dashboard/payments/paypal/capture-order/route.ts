import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("PayPal credentials not configured");

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

// POST — capture PayPal payment after user approval
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const body = await request.json();
  const { order_id } = body;

  if (!order_id) {
    return NextResponse.json(
      { error: "order_id requis" },
      { status: 400 }
    );
  }

  // Find the pending payment
  const { data: payment } = await supabaseAdmin
    .from(TABLES.payments)
    .select("id, profile_id, amount, metadata")
    .eq("paypal_order_id", order_id)
    .eq("profile_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (!payment) {
    return NextResponse.json(
      { error: "Paiement non trouve" },
      { status: 404 }
    );
  }

  try {
    const accessToken = await getPayPalAccessToken();

    const captureRes = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${order_id}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!captureRes.ok) {
      const errData = await captureRes.json();
      console.error("PayPal capture error:", errData);

      await supabaseAdmin
        .from(TABLES.payments)
        .update({ status: "failed" })
        .eq("id", payment.id);

      return NextResponse.json(
        { error: "Echec de la capture PayPal" },
        { status: 500 }
      );
    }

    const captureData = await captureRes.json();

    // Extract capture ID
    const captureId =
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    // Update payment to completed
    await supabaseAdmin
      .from(TABLES.payments)
      .update({
        status: "completed",
        paypal_capture_id: captureId || null,
      })
      .eq("id", payment.id);

    // Get the plan from metadata
    const plan =
      (payment.metadata as Record<string, unknown>)?.plan as string || "starter";

    // Calculate expiry
    const { data: pricingConfig } = await supabaseAdmin
      .from(TABLES.platform_config)
      .select("value")
      .eq("key", "pricing")
      .maybeSingle();

    const pricing = pricingConfig?.value as Record<
      string,
      { type: string }
    >;
    let expiresAt: string | null = null;
    if (pricing?.[plan]?.type === "yearly") {
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      expiresAt = expiry.toISOString();
    }

    // Upsert subscription
    const { data: existingSub } = await supabaseAdmin
      .from(TABLES.subscriptions)
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (existingSub) {
      await supabaseAdmin
        .from(TABLES.subscriptions)
        .update({
          plan,
          payment_method: "paypal",
          status: "active",
          amount: payment.amount,
          expires_at: expiresAt,
          started_at: new Date().toISOString(),
          cancelled_at: null,
        })
        .eq("id", existingSub.id);
    } else {
      await supabaseAdmin.from(TABLES.subscriptions).insert({
        profile_id: user.id,
        plan,
        payment_method: "paypal",
        status: "active",
        amount: payment.amount,
        expires_at: expiresAt,
      });
    }

    // Update profile plan
    await supabaseAdmin
      .from(TABLES.profiles)
      .update({ plan })
      .eq("id", user.id);

    // Log
    await supabaseAdmin.from(TABLES.admin_logs).insert({
      type: "payment",
      description: `Paiement PayPal capture — Plan ${plan}`,
      actor_id: user.id,
      target_id: user.id,
      metadata: {
        plan,
        amount: payment.amount,
        paypal_order_id: order_id,
        paypal_capture_id: captureId,
      },
    });

    return NextResponse.json({
      success: true,
      plan,
      message: "Paiement reussi ! Votre plan a ete active.",
    });
  } catch (err) {
    console.error("PayPal capture error:", err);
    return NextResponse.json(
      { error: "Erreur PayPal" },
      { status: 500 }
    );
  }
}
