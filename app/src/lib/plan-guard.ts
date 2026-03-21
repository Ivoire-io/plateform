import { createClient } from "@/lib/supabase/server";
import { PlanLimits, PlanTier } from "@/lib/types";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// ─── Result type ───

export type PlanGuardResult =
  | { authorized: true; userId: string; plan: PlanTier; limits: PlanLimits }
  | { authorized: false; response: NextResponse };

// ─── Default fallback (used only when DB is unreachable) ───

const FREE_LIMITS: PlanLimits = {
  max_projects: 2,
  max_team_members: 2,
  max_products: 1,
  max_job_listings: 0,
  max_ai_generations_per_day: 3,
  max_logo_variations: 1,
  max_regenerations: 1,
  allowed_templates: "free",
  features: {
    pitch_deck: false,
    cahier_charges: false,
    business_plan: false,
    one_pager: false,
    cgu: false,
    roadmap: false,
    competitors_analysis: false,
    oapi_check: false,
    timestamp: false,
    export_pdf: false,
    fundraising: false,
    advanced_stats: false,
    verified_badge: false,
    priority_visibility: false,
    homepage_featured: false,
    dev_outsourcing: false,
  },
};

// ─── Build PlanLimits from a DB plan row ───

function planRowToLimits(row: Record<string, unknown>): PlanLimits {
  const features = (row.features ?? {}) as Record<string, boolean>;
  return {
    max_projects: (row.max_projects as number | null) ?? null,
    max_team_members: (row.max_team_members as number | null) ?? null,
    max_products: (row.max_products as number | null) ?? null,
    max_job_listings: (row.max_job_listings as number | null) ?? null,
    max_ai_generations_per_day: (row.max_ai_generations_per_day as number | null) ?? null,
    max_logo_variations: (row.max_logo_variations as number) ?? 1,
    max_regenerations: (row.max_regenerations as number | null) ?? null,
    allowed_templates: (row.allowed_templates as PlanLimits["allowed_templates"]) ?? "free",
    features: {
      pitch_deck: features.pitch_deck ?? false,
      cahier_charges: features.cahier_charges ?? false,
      business_plan: features.business_plan ?? false,
      one_pager: features.one_pager ?? false,
      cgu: features.cgu ?? false,
      roadmap: features.roadmap ?? false,
      competitors_analysis: features.competitors_analysis ?? false,
      oapi_check: features.oapi_check ?? false,
      timestamp: features.timestamp ?? false,
      export_pdf: features.export_pdf ?? false,
      fundraising: features.fundraising ?? false,
      advanced_stats: features.advanced_stats ?? false,
      verified_badge: features.verified_badge ?? false,
      priority_visibility: features.priority_visibility ?? false,
      homepage_featured: features.homepage_featured ?? false,
      dev_outsourcing: features.dev_outsourcing ?? false,
    },
  };
}

// ─── Guard function ───

export async function planGuard(
  requiredPlan?: PlanTier[],
  requiredFeature?: keyof PlanLimits["features"],
): Promise<PlanGuardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Non autorise" },
        { status: 401 },
      ),
    };
  }

  const { data: profile } = await supabase
    .from(TABLES.profiles)
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan: PlanTier = (profile?.plan as PlanTier) ?? "free";

  // Load limits from ivoireio_plans table
  let limits: PlanLimits;

  const { data: planRow } = await supabase
    .from(TABLES.plans)
    .select("*")
    .eq("tier", plan)
    .single();

  if (planRow) {
    limits = planRowToLimits(planRow);
  } else {
    limits = FREE_LIMITS;
  }

  // Check required plan tier
  if (requiredPlan && !requiredPlan.includes(plan)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Upgrade requis", required: requiredPlan, current: plan },
        { status: 403 },
      ),
    };
  }

  // Check required feature
  if (requiredFeature && !limits.features[requiredFeature]) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Fonctionnalite non disponible dans votre plan", feature: requiredFeature, current: plan },
        { status: 403 },
      ),
    };
  }

  return { authorized: true, userId: user.id, plan, limits };
}

// ─── AI Rate Limit Check ───

export async function checkAIRateLimit(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number | null;
  response?: NextResponse;
}> {
  const supabase = await createClient();

  // Get user's plan
  const { data: profile } = await supabase
    .from(TABLES.profiles)
    .select("plan")
    .eq("id", userId)
    .single();

  const plan = (profile?.plan as PlanTier) ?? "free";

  // Get plan limits
  const { data: planRow } = await supabase
    .from(TABLES.plans)
    .select("max_ai_generations_per_day")
    .eq("tier", plan)
    .single();

  const limit = planRow?.max_ai_generations_per_day ?? FREE_LIMITS.max_ai_generations_per_day;

  // If unlimited, always allow
  if (limit === null) {
    return { allowed: true, used: 0, limit: null };
  }

  // Count today's usage
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const startOfDay = `${today}T00:00:00.000Z`;
  const endOfDay = `${today}T23:59:59.999Z`;

  const { count } = await supabase
    .from(TABLES.ai_usage)
    .select("id", { count: "exact", head: true })
    .eq("profile_id", userId)
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay);

  const used = count ?? 0;

  if (used >= limit) {
    return {
      allowed: false,
      used,
      limit,
      response: NextResponse.json(
        {
          error: "Limite de generations IA atteinte pour aujourd'hui",
          used,
          limit,
          plan,
          upgrade_message: `Votre plan ${plan} permet ${limit} generations/jour. Passez au plan superieur pour plus de generations.`,
        },
        { status: 429 },
      ),
    };
  }

  return { allowed: true, used, limit };
}

// ─── Resource Limit Check (generic) ───

export async function checkResourceLimit(
  userId: string,
  resource: "projects" | "team_members" | "products" | "job_listings",
  currentCount: number,
): Promise<{
  allowed: boolean;
  limit: number | null;
  response?: NextResponse;
}> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from(TABLES.profiles)
    .select("plan")
    .eq("id", userId)
    .single();

  const plan = (profile?.plan as PlanTier) ?? "free";

  const { data: planRow } = await supabase
    .from(TABLES.plans)
    .select(`max_${resource}`)
    .eq("tier", plan)
    .single();

  const limitKey = `max_${resource}`;
  const row = planRow as Record<string, unknown> | null;
  const fallback = FREE_LIMITS as unknown as Record<string, unknown>;
  const limit = (row?.[limitKey] ?? fallback[limitKey] ?? null) as number | null;

  if (limit === null) {
    return { allowed: true, limit: null };
  }

  if (currentCount >= limit) {
    const labels: Record<string, string> = {
      projects: "projets",
      team_members: "membres d'equipe",
      products: "produits",
      job_listings: "offres d'emploi",
    };
    return {
      allowed: false,
      limit,
      response: NextResponse.json(
        {
          error: `Limite de ${labels[resource]} atteinte`,
          current: currentCount,
          limit,
          plan,
          upgrade_message: `Votre plan ${plan} permet ${limit} ${labels[resource]}. Passez au plan superieur.`,
        },
        { status: 403 },
      ),
    };
  }

  return { allowed: true, limit };
}
