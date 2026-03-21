import { createClient } from "@/lib/supabase/server";
import { PlanLimits, PlanTier } from "@/lib/types";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// ─── Default plan limits (mirrors migration 011 seed data) ───

export const DEFAULT_PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    max_projects: 3,
    max_team_members: 3,
    max_products: 1,
    max_job_listings: 1,
    max_ai_generations_per_day: 5,
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
  },
  starter: {
    max_projects: 10,
    max_team_members: 5,
    max_products: 3,
    max_job_listings: 1,
    max_ai_generations_per_day: 15,
    max_logo_variations: 3,
    max_regenerations: 3,
    allowed_templates: "free+1",
    features: {
      pitch_deck: true,
      cahier_charges: false,
      business_plan: false,
      one_pager: true,
      cgu: false,
      roadmap: false,
      competitors_analysis: true,
      oapi_check: true,
      timestamp: true,
      export_pdf: true,
      fundraising: false,
      advanced_stats: false,
      verified_badge: false,
      priority_visibility: false,
      homepage_featured: false,
      dev_outsourcing: false,
    },
  },
  student: {
    max_projects: 10,
    max_team_members: 5,
    max_products: 3,
    max_job_listings: 1,
    max_ai_generations_per_day: 15,
    max_logo_variations: 3,
    max_regenerations: 3,
    allowed_templates: "free+1",
    features: {
      pitch_deck: true,
      cahier_charges: false,
      business_plan: false,
      one_pager: true,
      cgu: false,
      roadmap: false,
      competitors_analysis: true,
      oapi_check: true,
      timestamp: true,
      export_pdf: true,
      fundraising: false,
      advanced_stats: false,
      verified_badge: false,
      priority_visibility: false,
      homepage_featured: false,
      dev_outsourcing: false,
    },
  },
  pro: {
    max_projects: null,
    max_team_members: null,
    max_products: null,
    max_job_listings: null,
    max_ai_generations_per_day: null,
    max_logo_variations: 3,
    max_regenerations: null,
    allowed_templates: "all",
    features: {
      pitch_deck: true,
      cahier_charges: true,
      business_plan: true,
      one_pager: true,
      cgu: true,
      roadmap: true,
      competitors_analysis: true,
      oapi_check: true,
      timestamp: true,
      export_pdf: true,
      fundraising: true,
      advanced_stats: true,
      verified_badge: true,
      priority_visibility: true,
      homepage_featured: false,
      dev_outsourcing: true,
    },
  },
  enterprise: {
    max_projects: null,
    max_team_members: null,
    max_products: null,
    max_job_listings: null,
    max_ai_generations_per_day: null,
    max_logo_variations: 10,
    max_regenerations: null,
    allowed_templates: "all+corporate",
    features: {
      pitch_deck: true,
      cahier_charges: true,
      business_plan: true,
      one_pager: true,
      cgu: true,
      roadmap: true,
      competitors_analysis: true,
      oapi_check: true,
      timestamp: true,
      export_pdf: true,
      fundraising: true,
      advanced_stats: true,
      verified_badge: true,
      priority_visibility: true,
      homepage_featured: true,
      dev_outsourcing: true,
    },
  },
};

// ─── Result type ───

export type PlanGuardResult =
  | { authorized: true; userId: string; plan: PlanTier; limits: PlanLimits }
  | { authorized: false; response: NextResponse };

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
        { error: "Unauthorized" },
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

  // Try fetching admin-overridden limits from platform_config, fall back to defaults
  let limits: PlanLimits;

  const { data: configRow } = await supabase
    .from(TABLES.platform_config)
    .select("value")
    .eq("key", "plan_limits")
    .single();

  if (configRow?.value && typeof configRow.value === "object" && plan in configRow.value) {
    limits = (configRow.value as Record<string, PlanLimits>)[plan];
  } else {
    limits = DEFAULT_PLAN_LIMITS[plan];
  }

  // Check required plan tier
  if (requiredPlan && !requiredPlan.includes(plan)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Upgrade requis" },
        { status: 403 },
      ),
    };
  }

  // Check required feature
  if (requiredFeature && !limits.features[requiredFeature]) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Fonctionnalite non disponible dans votre plan" },
        { status: 403 },
      ),
    };
  }

  return { authorized: true, userId: user.id, plan, limits };
}
