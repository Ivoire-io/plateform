import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET — Single plan
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;

  const { data: plan, error } = await supabaseAdmin
    .from(TABLES.plans)
    .select("*")
    .eq("id", id)
    .single();

  if (error || !plan) {
    return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
  }

  return NextResponse.json({ plan });
}

// PUT — Update plan
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;
  const body = await req.json();

  // Build update payload — only include provided fields
  const allowed = [
    "tier", "name", "tagline", "description", "price", "currency",
    "billing_type", "icon", "color", "is_active", "is_highlighted",
    "sort_order", "max_projects", "max_team_members", "max_products",
    "max_job_listings", "max_ai_generations_per_day", "max_logo_variations",
    "max_regenerations", "allowed_templates", "features", "display_features",
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key];
    }
  }

  const { data: plan, error } = await supabaseAdmin
    .from(TABLES.plans)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !plan) {
    return NextResponse.json(
      { error: error?.message ?? "Plan introuvable" },
      { status: error ? 500 : 404 },
    );
  }

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "system",
    description: `Plan "${plan.name}" (${plan.tier}) mis a jour`,
    actor_id: guard.userId,
    metadata: { plan_id: id, changes: Object.keys(updates).filter((k) => k !== "updated_at") },
  });

  return NextResponse.json({ plan });
}

// DELETE — Delete plan
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;

  // Don't allow deleting the free plan
  const { data: plan } = await supabaseAdmin
    .from(TABLES.plans)
    .select("tier, name")
    .eq("id", id)
    .single();

  if (!plan) {
    return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
  }

  if (plan.tier === "free") {
    return NextResponse.json(
      { error: "Le plan gratuit ne peut pas etre supprime" },
      { status: 400 },
    );
  }

  // Check if any active subscriptions use this plan
  const { count } = await supabaseAdmin
    .from(TABLES.subscriptions)
    .select("id", { count: "exact", head: true })
    .eq("plan", plan.tier)
    .eq("status", "active");

  if (count && count > 0) {
    return NextResponse.json(
      { error: `${count} abonnement(s) actif(s) utilisent ce plan. Desactivez-le plutot.` },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin
    .from(TABLES.plans)
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "system",
    description: `Plan "${plan.name}" (${plan.tier}) supprime`,
    actor_id: guard.userId,
    metadata: { plan_tier: plan.tier },
  });

  return NextResponse.json({ success: true });
}
