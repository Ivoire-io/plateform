import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLES.platform_config)
    .select("*");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Transforme en objet clé-valeur
  const config: Record<string, unknown> = {};
  for (const row of data ?? []) {
    config[row.key] = row.value;
  }

  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const updates = await req.json() as Record<string, unknown>;

  const supabase = await createClient();

  // Upsert chaque clé-valeur
  const upsertData = Object.entries(updates).map(([key, value]) => ({
    key,
    value,
    updated_by: guard.userId,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from(TABLES.platform_config)
    .upsert(upsertData, { onConflict: "key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from(TABLES.admin_logs).insert({
    admin_id: guard.userId,
    action: "config_updated",
    target_type: "config",
    metadata: updates,
  });

  return NextResponse.json({ success: true });
}
