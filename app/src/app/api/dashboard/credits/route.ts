import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET — get user's credit balance and history
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  // Get all credits for user, ordered by created_at DESC
  const { data: credits } = await supabaseAdmin
    .from(TABLES.credits)
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  // Calculate balance (sum of amounts)
  const balance = (credits ?? []).reduce(
    (sum: number, c: { amount: number }) => sum + c.amount,
    0
  );

  return NextResponse.json({
    balance,
    history: credits ?? [],
  });
}
