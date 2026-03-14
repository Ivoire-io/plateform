import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const supabase = await createClient();

  const [
    { count: totalProfiles },
    { count: startups },
    { count: enterprises },
    { count: waitlistTotal },
    { count: waitlistPending },
    { count: messages },
    { count: reports },
    { count: suspended },
  ] = await Promise.all([
    supabase.from(TABLES.profiles).select("*", { count: "exact", head: true }),
    supabase.from(TABLES.profiles).select("*", { count: "exact", head: true }).eq("profile_type", "startup"),
    supabase.from(TABLES.profiles).select("*", { count: "exact", head: true }).eq("profile_type", "enterprise"),
    supabase.from(TABLES.waitlist).select("*", { count: "exact", head: true }),
    supabase.from(TABLES.waitlist).select("*", { count: "exact", head: true }).eq("invited", false),
    supabase.from(TABLES.contact_messages).select("*", { count: "exact", head: true }),
    supabase.from(TABLES.reports).select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from(TABLES.profiles).select("*", { count: "exact", head: true }).eq("is_suspended", true),
  ]);

  // Profiles créés ce mois-ci
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { count: newThisMonth } = await supabase
    .from(TABLES.profiles)
    .select("*", { count: "exact", head: true })
    .gte("created_at", firstOfMonth);

  return NextResponse.json({
    totalProfiles: totalProfiles ?? 0,
    startups: startups ?? 0,
    enterprises: enterprises ?? 0,
    waitlistTotal: waitlistTotal ?? 0,
    waitlistPending: waitlistPending ?? 0,
    messages: messages ?? 0,
    reports: reports ?? 0,
    suspended: suspended ?? 0,
    newThisMonth: newThisMonth ?? 0,
    mrr: 0, // À brancher sur Stripe quand actif
  });
}
