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
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

// XOF is not supported by PayPal — convert to EUR
const XOF_TO_EUR = 1 / 655.957; // Fixed rate (CFA franc pegged to EUR)

// POST — create PayPal order
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const body = await request.json();
  const { plan } = body;

  if (!plan) {
    return NextResponse.json({ error: "Plan requis" }, { status: 400 });
  }

  // Check PayPal is enabled
  const { data: providersConfig } = await supabaseAdmin
    .from(TABLES.platform_config)
    .select("value")
    .eq("key", "payment_providers")
    .maybeSingle();

  const providers = providersConfig?.value as Record<string, { enabled: boolean }>;
  if (!providers?.paypal?.enabled) {
    return NextResponse.json(
      { error: "PayPal n'est pas active" },
      { status: 400 }
    );
  }

  // Fetch pricing
  const { data: pricingConfig } = await supabaseAdmin
    .from(TABLES.platform_config)
    .select("value")
    .eq("key", "pricing")
    .maybeSingle();

  const pricing = pricingConfig?.value as Record<
    string,
    { amount: number }
  >;
  if (!pricing?.[plan]) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  const amountXOF = pricing[plan].amount;
  const amountEUR = (amountXOF * XOF_TO_EUR).toFixed(2);

  try {
    const accessToken = await getPayPalAccessToken();

    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "EUR",
              value: amountEUR,
            },
            description: `ivoire.io — Plan ${plan} (${amountXOF} FCFA)`,
          },
        ],
        application_context: {
          brand_name: "ivoire.io",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?tab=subscription&paypal=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?tab=subscription&paypal=cancelled`,
        },
      }),
    });

    if (!orderRes.ok) {
      const errData = await orderRes.json();
      console.error("PayPal order error:", errData);
      return NextResponse.json(
        { error: "Erreur creation commande PayPal" },
        { status: 500 }
      );
    }

    const order = await orderRes.json();

    // Create pending payment record
    await supabaseAdmin.from(TABLES.payments).insert({
      profile_id: user.id,
      amount: amountXOF,
      payment_method: "paypal",
      status: "pending",
      paypal_order_id: order.id,
      description: `PayPal — Plan ${plan} (${amountEUR} EUR)`,
      metadata: { plan, amount_eur: amountEUR },
    });

    // Find the approve URL
    const approveLink = order.links?.find(
      (l: { rel: string; href: string }) => l.rel === "approve"
    );

    return NextResponse.json({
      success: true,
      order_id: order.id,
      approve_url: approveLink?.href,
      amount_xof: amountXOF,
      amount_eur: amountEUR,
    });
  } catch (err) {
    console.error("PayPal create-order error:", err);
    return NextResponse.json(
      { error: "Erreur PayPal" },
      { status: 500 }
    );
  }
}
