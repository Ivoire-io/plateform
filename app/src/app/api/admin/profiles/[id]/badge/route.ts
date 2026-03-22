import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

// POST → ajouter le badge vérifié
export async function POST(_req: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from(TABLES.profiles)
    .update({ verified_badge: true, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "profile",
    description: "Badge vérifié accordé.",
    actor_id: guard.userId,
    target_id: id,
  });

  return NextResponse.json({ success: true });
}

// DELETE → retirer le badge vérifié
export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from(TABLES.profiles)
    .update({ verified_badge: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "profile",
    description: "Badge vérifié retiré.",
    actor_id: guard.userId,
    target_id: id,
  });

  return NextResponse.json({ success: true });
}
