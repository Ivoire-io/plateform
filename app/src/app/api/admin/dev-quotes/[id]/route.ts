import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/admin/dev-quotes/[id] — Modifier un devis
export async function PATCH(request: Request, context: RouteContext) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const {
      amount,
      timeline,
      scope,
      tech_stack,
      team_composition,
      payment_schedule,
      discount_applied,
      notes,
      status,
    } = body;

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (amount !== undefined) updates.amount = amount;
    if (timeline !== undefined) updates.timeline = timeline;
    if (scope !== undefined) updates.scope = scope;
    if (tech_stack !== undefined) updates.tech_stack = tech_stack;
    if (team_composition !== undefined)
      updates.team_composition = team_composition;
    if (payment_schedule !== undefined)
      updates.payment_schedule = payment_schedule;
    if (discount_applied !== undefined)
      updates.discount_applied = discount_applied;
    if (notes !== undefined) updates.notes = notes;
    if (status !== undefined) updates.status = status;

    const { data: updatedQuote, error } = await supabaseAdmin
      .from(TABLES.dev_quotes)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Si le statut passe à "sent", marquer comme envoyé
    if (status === "sent") {
      await supabaseAdmin.from(TABLES.admin_logs).insert({
        type: "content",
        description: `Devis ${id} envoye au client`,
        actor_id: guard.userId,
        target_id: id,
        metadata: { action: "dev_quote_sent" },
      });
    }

    // Si le statut passe à "accepted", créer un projet de dev
    if (status === "accepted") {
      // Récupérer la demande associée
      const { data: devRequest } = await supabaseAdmin
        .from(TABLES.dev_requests)
        .select("id, title, startup_id")
        .eq("id", updatedQuote.dev_request_id)
        .single();

      if (devRequest) {
        // Créer le projet de dev
        await supabaseAdmin.from(TABLES.dev_projects).insert({
          dev_request_id: devRequest.id,
          dev_quote_id: id,
          startup_id: devRequest.startup_id,
          title: devRequest.title,
          total_amount: updatedQuote.amount,
          paid_amount: 0,
          progress: 0,
          status: "planning",
          milestones: [],
        });

        // Mettre à jour le statut de la demande
        await supabaseAdmin
          .from(TABLES.dev_requests)
          .update({
            status: "accepted",
            updated_at: new Date().toISOString(),
          })
          .eq("id", devRequest.id);

        await supabaseAdmin.from(TABLES.admin_logs).insert({
          type: "content",
          description: `Devis ${id} accepte — projet cree pour "${devRequest.title}"`,
          actor_id: guard.userId,
          target_id: id,
          metadata: {
            action: "dev_quote_accepted",
            project_title: devRequest.title,
          },
        });
      }
    }

    return NextResponse.json({ success: true, quote: updatedQuote });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
