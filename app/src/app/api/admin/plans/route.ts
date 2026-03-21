import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET — List all plans (including inactive)
export async function GET() {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { data: plans, error } = await supabaseAdmin
    .from(TABLES.plans)
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ plans: plans ?? [] });
}

// POST — Create a new plan
export async function POST(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const body = await req.json();

  const {
    tier,
    name,
    tagline,
    description,
    price,
    currency,
    billing_type,
    icon,
    color,
    is_active,
    is_highlighted,
    sort_order,
    max_projects,
    max_team_members,
    max_products,
    max_job_listings,
    max_ai_generations_per_day,
    max_logo_variations,
    max_regenerations,
    allowed_templates,
    features,
    display_features,
  } = body;

  if (!tier || !name) {
    return NextResponse.json(
      { error: "tier et name sont requis" },
      { status: 400 },
    );
  }

  const { data: plan, error } = await supabaseAdmin
    .from(TABLES.plans)
    .insert({
      tier: tier.toLowerCase().replace(/\s+/g, "_"),
      name,
      tagline: tagline ?? null,
      description: description ?? null,
      price: price ?? 0,
      currency: currency ?? "XOF",
      billing_type: billing_type ?? "monthly",
      icon: icon ?? "Zap",
      color: color ?? "#6b7280",
      is_active: is_active ?? true,
      is_highlighted: is_highlighted ?? false,
      sort_order: sort_order ?? 99,
      max_projects: max_projects ?? null,
      max_team_members: max_team_members ?? null,
      max_products: max_products ?? null,
      max_job_listings: max_job_listings ?? null,
      max_ai_generations_per_day: max_ai_generations_per_day ?? null,
      max_logo_variations: max_logo_variations ?? 1,
      max_regenerations: max_regenerations ?? null,
      allowed_templates: allowed_templates ?? "free",
      features: features ?? {},
      display_features: display_features ?? [],
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: `Un plan avec le tier "${tier}" existe deja` },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log
  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "system",
    description: `Plan "${name}" (${tier}) cree`,
    actor_id: guard.userId,
    metadata: { plan_id: plan.id, tier },
  });

  return NextResponse.json({ plan }, { status: 201 });
}
