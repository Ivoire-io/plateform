import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;

  // On ne peut pas se promouvoir soi-même
  if (id === guard.userId) {
    return NextResponse.json(
      { error: "Cannot promote yourself" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from(TABLES.profiles)
    .update({ is_admin: true, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    admin_id: guard.userId,
    action: "profile_promoted_admin",
    target_type: "profile",
    target_id: id,
  });

  return NextResponse.json({ success: true });
}
