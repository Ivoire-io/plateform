import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/dev-requests/[id] — Modifier statut + notes admin
export async function PATCH(request: Request, context: RouteContext) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { status, admin_notes } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) {
      const validStatuses = [
        "draft",
        "submitted",
        "reviewing",
        "quoted",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Statut invalide." },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    if (admin_notes !== undefined) {
      updates.admin_notes = admin_notes;
    }

    const { error } = await supabaseAdmin
      .from(TABLES.dev_requests)
      .update(updates)
      .eq("id", id);

    if (error) throw error;

    // Log admin action
    await supabaseAdmin.from(TABLES.admin_logs).insert({
      type: "content",
      description: `Dev request ${id} mise a jour${status ? ` → statut: ${status}` : ""}`,
      actor_id: guard.userId,
      target_id: id,
      metadata: { action: "dev_request_update", status, admin_notes },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
