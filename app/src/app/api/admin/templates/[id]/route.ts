import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;
  const body = await req.json() as {
    state?: "draft" | "active" | "archived";
    plan?: "free" | "premium" | "enterprise";
    allowed_types?: string[];
  };

  const supabase = await createClient();

  const allowed = ["state", "plan", "allowed_types"];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = (body as Record<string, unknown>)[key];
  }

  const { data, error } = await supabase
    .from(TABLES.templates)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from(TABLES.admin_logs).insert({
    admin_id: guard.userId,
    action: "template_updated",
    target_type: "template",
    target_id: id,
    metadata: updates,
  });

  return NextResponse.json(data);
}
