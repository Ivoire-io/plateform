import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// PATCH — Toggle plan active/inactive
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;

  const { data: plan } = await supabaseAdmin
    .from(TABLES.plans)
    .select("id, tier, name, is_active")
    .eq("id", id)
    .single();

  if (!plan) {
    return NextResponse.json({ error: "Plan introuvable" }, { status: 404 });
  }

  if (plan.tier === "free") {
    return NextResponse.json(
      { error: "Le plan gratuit ne peut pas etre desactive" },
      { status: 400 },
    );
  }

  const newState = !plan.is_active;

  const { error } = await supabaseAdmin
    .from(TABLES.plans)
    .update({ is_active: newState, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "system",
    description: `Plan "${plan.name}" ${newState ? "active" : "desactive"}`,
    actor_id: guard.userId,
    metadata: { plan_id: id, tier: plan.tier, is_active: newState },
  });

  return NextResponse.json({ is_active: newState });
}
