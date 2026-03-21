import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/dev-projects/[id] — Modifier un projet de dev
export async function PATCH(request: Request, context: RouteContext) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { progress, status, milestones, paid_amount } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (progress !== undefined) updates.progress = progress;
    if (status !== undefined) {
      const validStatuses = [
        "planning",
        "in_progress",
        "review",
        "completed",
        "paused",
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
    if (milestones !== undefined) updates.milestones = milestones;
    if (paid_amount !== undefined) updates.paid_amount = paid_amount;

    const { data, error } = await supabaseAdmin
      .from(TABLES.dev_projects)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Si le projet est terminé, mettre à jour la demande aussi
    if (status === "completed") {
      if (data.dev_request_id) {
        await supabaseAdmin
          .from(TABLES.dev_requests)
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", data.dev_request_id);
      }
    }

    // Log admin action
    await supabaseAdmin.from(TABLES.admin_logs).insert({
      type: "content",
      description: `Projet dev ${id} mis a jour${status ? ` → statut: ${status}` : ""}${progress !== undefined ? ` — progression: ${progress}%` : ""}`,
      actor_id: guard.userId,
      target_id: id,
      metadata: { action: "dev_project_update", status, progress },
    });

    return NextResponse.json({ success: true, project: data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
