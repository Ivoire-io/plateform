import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET — current subscription
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { data: subscription } = await supabaseAdmin
    .from(TABLES.subscriptions)
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  // Also fetch credit balance
  const { data: credits } = await supabaseAdmin
    .from(TABLES.credits)
    .select("amount")
    .eq("profile_id", user.id);

  const creditBalance = (credits ?? []).reduce(
    (sum: number, c: { amount: number }) => sum + c.amount,
    0
  );

  // Fetch pricing info from platform config
  const { data: pricingConfig } = await supabaseAdmin
    .from(TABLES.platform_config)
    .select("value")
    .eq("key", "pricing")
    .maybeSingle();

  const { data: providersConfig } = await supabaseAdmin
    .from(TABLES.platform_config)
    .select("value")
    .eq("key", "payment_providers")
    .maybeSingle();

  return NextResponse.json({
    subscription: subscription ?? null,
    credit_balance: creditBalance,
    pricing: pricingConfig?.value ?? {},
    payment_providers: providersConfig?.value ?? {},
  });
}

// POST — create or upgrade subscription
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const body = await request.json();
  const { plan, payment_method } = body;

  if (!plan || !payment_method) {
    return NextResponse.json(
      { error: "Plan et methode de paiement requis" },
      { status: 400 }
    );
  }

  const validPlans = ["starter", "student", "pro", "enterprise"];
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  // Fetch pricing
  const { data: pricingConfig } = await supabaseAdmin
    .from(TABLES.platform_config)
    .select("value")
    .eq("key", "pricing")
    .maybeSingle();

  const pricing = pricingConfig?.value as Record<
    string,
    { amount: number; type: string }
  >;
  if (!pricing?.[plan]) {
    return NextResponse.json(
      { error: "Configuration de prix manquante" },
      { status: 500 }
    );
  }

  const planPricing = pricing[plan];
  const amount = planPricing.amount;

  // Check if user already has an active subscription
  const { data: existing } = await supabaseAdmin
    .from(TABLES.subscriptions)
    .select("id, plan, status")
    .eq("profile_id", user.id)
    .maybeSingle();

  // For PayPal — just create pending, the capture will activate
  // For manual — create pending, admin will approve
  // For credit — check balance, auto-activate
  let subscriptionStatus: "active" | "pending" = "pending";
  let paymentStatus: "pending" | "completed" = "pending";

  if (payment_method === "credit") {
    // Check credit balance
    const { data: credits } = await supabaseAdmin
      .from(TABLES.credits)
      .select("amount")
      .eq("profile_id", user.id);

    const balance = (credits ?? []).reduce(
      (sum: number, c: { amount: number }) => sum + c.amount,
      0
    );

    if (balance < amount) {
      return NextResponse.json(
        {
          error: `Solde de credits insuffisant (${balance} FCFA disponible, ${amount} FCFA requis)`,
        },
        { status: 400 }
      );
    }

    subscriptionStatus = "active";
    paymentStatus = "completed";

    // Deduct credits
    await supabaseAdmin.from(TABLES.credits).insert({
      profile_id: user.id,
      amount: -amount,
      source: "purchase",
      description: `Achat plan ${plan}`,
    });
  }

  // Calculate expiry
  let expiresAt: string | null = null;
  if (planPricing.type === "yearly") {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    expiresAt = expiry.toISOString();
  }

  // Upsert subscription
  if (existing) {
    await supabaseAdmin
      .from(TABLES.subscriptions)
      .update({
        plan,
        payment_method,
        status: subscriptionStatus,
        amount,
        expires_at: expiresAt,
        started_at: new Date().toISOString(),
        cancelled_at: null,
      })
      .eq("id", existing.id);
  } else {
    await supabaseAdmin.from(TABLES.subscriptions).insert({
      profile_id: user.id,
      plan,
      payment_method,
      status: subscriptionStatus,
      amount,
      expires_at: expiresAt,
    });
  }

  // Create payment record
  const { data: payment } = await supabaseAdmin
    .from(TABLES.payments)
    .insert({
      profile_id: user.id,
      amount,
      payment_method,
      status: paymentStatus,
      description: `Abonnement ${plan}`,
    })
    .select("id")
    .single();

  // If credit payment, activate plan immediately
  if (payment_method === "credit" && subscriptionStatus === "active") {
    await supabaseAdmin
      .from(TABLES.profiles)
      .update({ plan })
      .eq("id", user.id);
  }

  // Log the action
  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "payment",
    description: `Abonnement ${plan} cree via ${payment_method}`,
    actor_id: user.id,
    target_id: user.id,
    metadata: { plan, payment_method, amount, payment_id: payment?.id },
  });

  return NextResponse.json({
    success: true,
    subscription_status: subscriptionStatus,
    payment_id: payment?.id,
    requires_action:
      payment_method === "manual"
        ? "upload_proof"
        : payment_method === "paypal"
          ? "paypal_redirect"
          : null,
  });
}
