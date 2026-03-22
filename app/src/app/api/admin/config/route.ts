import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { data, error } = await supabaseAdmin
    .from(TABLES.platform_config)
    .select("*");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ config: data ?? [] });
}

export async function PUT(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const body = await req.json();

  // Support both formats: { entries: [...] } and flat { key: value }
  let upsertData: Array<{ key: string; value: unknown; updated_by: string; updated_at: string }>;

  if (body.entries && Array.isArray(body.entries)) {
    upsertData = body.entries.map((e: { key: string; value: unknown }) => ({
      key: e.key,
      value: e.value,
      updated_by: guard.userId,
      updated_at: new Date().toISOString(),
    }));
  } else {
    upsertData = Object.entries(body).map(([key, value]) => ({
      key,
      value,
      updated_by: guard.userId,
      updated_at: new Date().toISOString(),
    }));
  }

  const { error } = await supabaseAdmin
    .from(TABLES.platform_config)
    .upsert(upsertData, { onConflict: "key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "system",
    description: `Configuration mise a jour (${upsertData.length} cle(s))`,
    actor_id: guard.userId,
    metadata: { keys: upsertData.map((d) => d.key) },
  });

  return NextResponse.json({ success: true });
}
