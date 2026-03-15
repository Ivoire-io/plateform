import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLES.profiles)
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;
  const body = await req.json();
  const supabase = await createClient();

  // Champs autorisés à modifier par l'admin
  const allowed = [
    "full_name", "bio", "type", "plan", "admin_notes",
    "verified_badge", "is_admin",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from(TABLES.profiles)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log admin action
  await supabase.from(TABLES.admin_logs).insert({
    admin_id: guard.userId,
    action: "profile_updated",
    target_type: "profile",
    target_id: id,
    metadata: updates,
  });

  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase.from(TABLES.profiles).delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from(TABLES.admin_logs).insert({
    admin_id: guard.userId,
    action: "profile_deleted",
    target_type: "profile",
    target_id: id,
  });

  return NextResponse.json({ success: true });
}
