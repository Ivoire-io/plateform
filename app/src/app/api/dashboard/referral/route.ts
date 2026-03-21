import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET — get user's referral info
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  // Get user's profile with referral_code
  const { data: profile } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("referral_code")
    .eq("id", user.id)
    .single();

  let referralCode = profile?.referral_code as string | null;

  // Generate referral code if user doesn't have one
  if (!referralCode) {
    referralCode = generateReferralCode();
    await supabaseAdmin
      .from(TABLES.profiles)
      .update({ referral_code: referralCode })
      .eq("id", user.id);
  }

  // Count total referrals
  const { count: totalReferrals } = await supabaseAdmin
    .from(TABLES.referrals)
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", user.id);

  // Count converted referrals (status = 'converted' or 'rewarded')
  const { count: convertedReferrals } = await supabaseAdmin
    .from(TABLES.referrals)
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", user.id)
    .in("status", ["converted", "rewarded"]);

  // Get credit balance
  const { data: credits } = await supabaseAdmin
    .from(TABLES.credits)
    .select("amount")
    .eq("profile_id", user.id);

  const creditBalance = (credits ?? []).reduce(
    (sum: number, c: { amount: number }) => sum + c.amount,
    0
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ivoire.io";

  return NextResponse.json({
    referral_code: referralCode,
    referral_url: `${siteUrl}?ref=${referralCode}`,
    total_referrals: totalReferrals ?? 0,
    converted_referrals: convertedReferrals ?? 0,
    credit_balance: creditBalance,
  });
}

// POST — apply a referral code at signup
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const body = await request.json();
  const { referral_code } = body;

  if (!referral_code) {
    return NextResponse.json(
      { error: "Code de parrainage requis" },
      { status: 400 }
    );
  }

  // Find referrer by referral_code
  const { data: referrer } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("id")
    .eq("referral_code", referral_code)
    .maybeSingle();

  if (!referrer) {
    return NextResponse.json(
      { error: "Code de parrainage invalide" },
      { status: 404 }
    );
  }

  // Cannot refer yourself
  if (referrer.id === user.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas utiliser votre propre code de parrainage" },
      { status: 400 }
    );
  }

  // Check if referral already exists
  const { data: existing } = await supabaseAdmin
    .from(TABLES.referrals)
    .select("id")
    .eq("referrer_id", referrer.id)
    .eq("referred_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Ce parrainage existe deja" },
      { status: 409 }
    );
  }

  // Create referral record
  const { error } = await supabaseAdmin.from(TABLES.referrals).insert({
    referrer_id: referrer.id,
    referred_id: user.id,
    status: "pending",
  });

  if (error) {
    console.error("Referral creation error:", error);
    return NextResponse.json(
      { error: "Erreur creation du parrainage" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Parrainage enregistre avec succes",
  });
}
