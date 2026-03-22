import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET — User's pack purchases
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { data: purchases } = await supabase
    .from(TABLES.pack_purchases)
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ purchases: purchases ?? [] });
}

// POST — Purchase a pack
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { pack_slug, payment_method } = await req.json();

  if (!pack_slug) {
    return NextResponse.json({ error: "pack_slug requis" }, { status: 400 });
  }

  // Get pack details
  const { data: pack } = await supabase
    .from(TABLES.packs)
    .select("*")
    .eq("slug", pack_slug)
    .eq("is_active", true)
    .single();

  if (!pack) {
    return NextResponse.json({ error: "Pack introuvable ou inactif" }, { status: 404 });
  }

  // Handle credit payment
  if (payment_method === "credit") {
    const { data: credits } = await supabase
      .from(TABLES.credits)
      .select("amount")
      .eq("profile_id", user.id);

    const balance = (credits ?? []).reduce((sum, c) => sum + c.amount, 0);

    if (balance < pack.price) {
      return NextResponse.json({ error: "Solde de credits insuffisant" }, { status: 400 });
    }

    // Deduct credits
    await supabase.from(TABLES.credits).insert({
      profile_id: user.id,
      amount: -pack.price,
      source: "purchase",
      description: `Achat pack "${pack.name}"`,
    });

    // Create completed purchase
    const expiresAt = pack.duration_days
      ? new Date(Date.now() + pack.duration_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data: purchase, error } = await supabase
      .from(TABLES.pack_purchases)
      .insert({
        profile_id: user.id,
        pack_id: pack.id,
        pack_slug: pack.slug,
        amount: pack.price,
        currency: pack.currency,
        payment_method: "credit",
        status: "completed",
        purchased_at: new Date().toISOString(),
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ purchase, status: "completed" });
  }

  // For manual/mobile money payments — create pending purchase
  const expiresAt = pack.duration_days
    ? new Date(Date.now() + pack.duration_days * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { data: purchase, error } = await supabase
    .from(TABLES.pack_purchases)
    .insert({
      profile_id: user.id,
      pack_id: pack.id,
      pack_slug: pack.slug,
      amount: pack.price,
      currency: pack.currency,
      payment_method: payment_method ?? "manual",
      status: "pending",
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ purchase, status: "pending" });
}
