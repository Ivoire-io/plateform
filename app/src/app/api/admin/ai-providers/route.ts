import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_AI_CONFIG = {
  text_short: {
    provider: "openai",
    model: "gpt-4o-mini",
    fallback: "claude-sonnet-4-6",
    budget_max_usd: 50,
  },
  text_long: {
    provider: "anthropic",
    model: "claude-sonnet-4-6",
    fallback: "gpt-4o-mini",
    budget_max_usd: 200,
  },
  image: {
    provider: "crunai",
    model: "nanobanana-pro",
    fallback: null,
    budget_max_usd: 100,
  },
  web_search: {
    provider: "anthropic",
    model: "claude-sonnet-4-6",
    max_searches_per_day: 1000,
  },
};

const VALID_PROVIDERS = new Set(["openai", "anthropic", "crunai", "none"]);

function isValidConfig(config: Record<string, unknown>): boolean {
  const requiredKeys = ["text_short", "text_long", "image", "web_search"];
  for (const key of requiredKeys) {
    if (!config[key] || typeof config[key] !== "object") return false;
    const section = config[key] as Record<string, unknown>;
    if (typeof section.provider !== "string" || !VALID_PROVIDERS.has(section.provider)) return false;
    if (typeof section.model !== "string" || section.model.trim().length === 0) return false;
  }
  return true;
}

export async function GET() {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { data, error } = await supabaseAdmin
    .from(TABLES.platform_config)
    .select("*")
    .eq("key", "ai_providers")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(DEFAULT_AI_CONFIG);
  }

  return NextResponse.json(data.value);
}

export async function PUT(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const body = await req.json();

  if (!isValidConfig(body)) {
    return NextResponse.json(
      { error: "Configuration invalide. Vérifiez les fournisseurs et modèles." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from(TABLES.platform_config)
    .upsert(
      {
        key: "ai_providers",
        value: body,
        updated_by: guard.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    admin_id: guard.userId,
    action: "ai_providers_updated",
    target_type: "config",
    metadata: body,
  });

  return NextResponse.json({ success: true });
}
