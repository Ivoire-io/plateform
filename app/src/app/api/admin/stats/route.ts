import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET() {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const [
    { count: totalProfiles },
    { count: startupProfiles },
    { count: enterprises },
    { count: waitlistTotal },
    { count: waitlistPending },
    { count: messages },
    { count: reports },
    { count: suspended },
    { count: startupsPending },
  ] = await Promise.all([
    supabaseAdmin.from(TABLES.profiles).select("*", { count: "exact", head: true }),
    supabaseAdmin.from(TABLES.profiles).select("*", { count: "exact", head: true }).eq("type", "startup"),
    supabaseAdmin.from(TABLES.profiles).select("*", { count: "exact", head: true }).eq("type", "enterprise"),
    supabaseAdmin.from(TABLES.waitlist).select("*", { count: "exact", head: true }),
    supabaseAdmin.from(TABLES.waitlist).select("*", { count: "exact", head: true }).eq("invited", false),
    supabaseAdmin.from(TABLES.contact_messages).select("*", { count: "exact", head: true }),
    supabaseAdmin.from(TABLES.reports).select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from(TABLES.profiles).select("*", { count: "exact", head: true }).eq("is_suspended", true),
    // Fiches startups en attente de modération (badge sidebar)
    supabaseAdmin.from(TABLES.startups).select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  // Profiles créés ce mois-ci
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { count: newThisMonth } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("*", { count: "exact", head: true })
    .gte("created_at", firstOfMonth);

  return NextResponse.json({
    totalProfiles: totalProfiles ?? 0,
    startups: startupsPending ?? 0,       // badge sidebar = fiches startups en attente
    startupProfiles: startupProfiles ?? 0, // nb de profils de type startup
    enterprises: enterprises ?? 0,
    waitlistTotal: waitlistTotal ?? 0,
    waitlistPending: waitlistPending ?? 0,
    messages: messages ?? 0,
    reports: reports ?? 0,
    suspended: suspended ?? 0,
    newThisMonth: newThisMonth ?? 0,
    mrr: 0,
  });
}
