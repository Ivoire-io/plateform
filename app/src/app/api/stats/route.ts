import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/stats — compteurs publics pour le social proof landing
export async function GET() {
  try {
    const [{ count: waitlistCount }, { count: profilesCount }, { count: startupsCount }] =
      await Promise.all([
        supabaseAdmin.from(TABLES.waitlist).select("*", { count: "exact", head: true }),
        supabaseAdmin.from(TABLES.profiles).select("*", { count: "exact", head: true }),
        supabaseAdmin
          .from(TABLES.profiles)
          .select("*", { count: "exact", head: true })
          .eq("type", "startup"),
      ]);

    return NextResponse.json({
      waitlist: waitlistCount ?? 0,
      portfolios: profilesCount ?? 0,
      startups: startupsCount ?? 0,
    });
  } catch {
    return NextResponse.json(
      { waitlist: 0, portfolios: 0, startups: 0 },
      { status: 500 }
    );
  }
}
