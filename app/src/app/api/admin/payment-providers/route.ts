import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

const CONFIG_KEY = "payment_providers";

// Fields that must never be stored in platform_config (keep them in env vars)
const SENSITIVE_FIELDS = [
  "api_secret",
  "api_key",
  "secret_key",
  "private_key",
  "webhook_secret",
  "client_secret",
];

/**
 * Recursively strip sensitive keys from an object so API secrets
 * are never persisted in the platform_config table.
 */
function sanitizeConfig(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.includes(key)) continue;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      cleaned[key] = sanitizeConfig(value as Record<string, unknown>);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// GET /api/admin/payment-providers — Get payment providers config
export async function GET() {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { data, error } = await supabaseAdmin
    .from(TABLES.platform_config)
    .select("value")
    .eq("key", CONFIG_KEY)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ config: data?.value ?? null });
}

// PUT /api/admin/payment-providers — Update payment providers config
export async function PUT(request: Request) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const body = await request.json();

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Request body must be a valid PaymentProviderConfig object." },
      { status: 400 }
    );
  }

  // Sanitize: never store actual API secrets in platform_config
  const sanitized = sanitizeConfig(body as Record<string, unknown>);

  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from(TABLES.platform_config)
    .upsert(
      {
        key: CONFIG_KEY,
        value: sanitized,
        updated_by: guard.userId,
        updated_at: now,
      },
      { onConflict: "key" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log admin action
  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "config",
    description: "Payment providers config updated",
    actor_id: guard.userId,
    target_id: CONFIG_KEY,
    metadata: { action: "payment_providers_updated", providers: Object.keys(sanitized) },
  });

  return NextResponse.json({ success: true });
}
