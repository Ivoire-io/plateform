import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ key: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { key } = await params;
  const body = await req.json() as {
    state: "off" | "beta" | "public";
    beta_plan?: string | null;
    beta_types?: string[] | null;
    coming_soon_msg?: string | null;
  };


  // Récupère l'ancienne valeur pour historique
  const { data: oldFlag } = await supabaseAdmin
    .from(TABLES.feature_flags)
    .select("state")
    .eq("key", key)
    .single();

  const { data, error } = await supabaseAdmin
    .from(TABLES.feature_flags)
    .update({
      state: body.state,
      beta_plan: body.beta_plan ?? null,
      beta_types: body.beta_types ?? null,
      coming_soon_msg: body.coming_soon_msg ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("key", key)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Historique du changement
  if (oldFlag && oldFlag.state !== body.state) {
    await supabaseAdmin.from(TABLES.flag_history).insert({
      flag_key: key,
      changed_by: guard.userId,
      old_state: oldFlag.state,
      new_state: body.state,
    });
  }

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    admin_id: guard.userId,
    action: "flag_updated",
    target_type: "feature_flag",
    target_id: key,
    metadata: body,
  });

  return NextResponse.json(data);
}
