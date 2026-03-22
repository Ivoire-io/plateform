import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;
  const body = await req.json();

  const allowed = [
    "slug", "name", "description", "price", "currency", "icon", "color",
    "is_active", "sort_order", "includes", "unlocked_features", "duration_days",
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data: pack, error } = await supabaseAdmin
    .from(TABLES.packs)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !pack) {
    return NextResponse.json({ error: error?.message ?? "Pack introuvable" }, { status: error ? 500 : 404 });
  }

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "system",
    description: `Pack "${pack.name}" mis a jour`,
    actor_id: guard.userId,
    metadata: { pack_id: id },
  });

  return NextResponse.json({ pack });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;

  const { data: pack } = await supabaseAdmin
    .from(TABLES.packs)
    .select("name")
    .eq("id", id)
    .single();

  if (!pack) {
    return NextResponse.json({ error: "Pack introuvable" }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from(TABLES.packs)
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "system",
    description: `Pack "${pack.name}" supprime`,
    actor_id: guard.userId,
    metadata: { pack_id: id },
  });

  return NextResponse.json({ success: true });
}
