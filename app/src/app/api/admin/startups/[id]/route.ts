import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/startups/[id] — Modifier statut d'une startup (admin)
export async function PATCH(request: Request, context: RouteContext) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await context.params;
  const body = await request.json();
  const { status } = body;

  if (!status || !["pending", "approved", "rejected", "suspended"].includes(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLES.startups)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  // Log admin action
  await supabase.from(TABLES.admin_logs).insert({
    type: "content",
    description: `Startup "${data.name}" → statut: ${status}`,
    actor_id: guard.userId,
    target_id: id,
    metadata: { action: "startup_status_change", new_status: status },
  });

  return NextResponse.json({ success: true, data });
}

// DELETE /api/admin/startups/[id] — Supprimer une startup (admin)
export async function DELETE(_request: Request, context: RouteContext) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await context.params;
  const supabase = await createClient();

  const { error } = await supabase
    .from(TABLES.startups)
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  await supabase.from(TABLES.admin_logs).insert({
    type: "content",
    description: "Startup supprimée",
    actor_id: guard.userId,
    target_id: id,
    metadata: { action: "startup_deleted" },
  });

  return NextResponse.json({ success: true });
}
