import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET — list user's payments
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { data: payments } = await supabaseAdmin
    .from(TABLES.payments)
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ payments: payments ?? [] });
}

// POST — create manual payment (with bank reference)
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const body = await request.json();
  const { plan, bank_reference } = body;

  if (!plan) {
    return NextResponse.json({ error: "Plan requis" }, { status: 400 });
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
    return NextResponse.json(
      { error: "Plan invalide" },
      { status: 400 }
    );
  }

  const { data: payment, error } = await supabaseAdmin
    .from(TABLES.payments)
    .insert({
      profile_id: user.id,
      amount: pricing[plan].amount,
      payment_method: "manual",
      status: "pending",
      bank_reference: bank_reference || null,
      description: `Paiement manuel — Plan ${plan}`,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Erreur creation paiement" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    payment_id: payment.id,
    message: "Paiement cree. Veuillez uploader votre preuve de paiement.",
  });
}
