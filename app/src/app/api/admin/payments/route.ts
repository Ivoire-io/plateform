import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/admin/payments — List all payments with profile info + stats
export async function GET(request: Request) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const method = searchParams.get("method") ?? searchParams.get("payment_method");
  const search = searchParams.get("search");
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from(TABLES.payments)
    .select(
      "*, profile:ivoireio_profiles(full_name, slug, email)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (method) query = query.eq("method", method);
  if (search) {
    query = query.or(
      `profile.full_name.ilike.%${search}%,profile.email.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Compute stats (unfiltered counts)
  const [
    { count: total_payments },
    { count: pending_count },
    { count: failed_count },
  ] = await Promise.all([
    supabaseAdmin.from(TABLES.payments).select("*", { count: "exact", head: true }),
    supabaseAdmin.from(TABLES.payments).select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from(TABLES.payments).select("*", { count: "exact", head: true }).eq("status", "failed"),
  ]);

  const { data: completedPayments } = await supabaseAdmin
    .from(TABLES.payments)
    .select("amount")
    .eq("status", "completed");

  const total_revenue = (completedPayments ?? []).reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return NextResponse.json({
    payments: data || [],
    total: count ?? 0,
    stats: {
      total_payments: total_payments ?? 0,
      pending_count: pending_count ?? 0,
      total_revenue,
      failed_count: failed_count ?? 0,
    },
  });
}
