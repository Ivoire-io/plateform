import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/admin/dev-quotes — Liste tous les devis
export async function GET(request: Request) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from(TABLES.dev_quotes)
    .select("*, dev_request:dev_request_id(title, startup_id)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ quotes: data || [], total: count ?? 0 });
}

// POST /api/admin/dev-quotes — Créer un devis pour une demande
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  try {
    const body = await request.json();
    const {
      dev_request_id,
      amount,
      timeline,
      scope,
      tech_stack,
      team_composition,
      payment_schedule,
      discount_applied,
      notes,
    } = body;

    if (!dev_request_id || !amount) {
      return NextResponse.json(
        { error: "dev_request_id et amount sont requis." },
        { status: 400 }
      );
    }

    const { data: quote, error } = await supabaseAdmin
      .from(TABLES.dev_quotes)
      .insert({
        dev_request_id,
        admin_id: guard.userId,
        amount,
        timeline: timeline || null,
        scope: scope || null,
        tech_stack: tech_stack || [],
        team_composition: team_composition || [],
        payment_schedule: payment_schedule || [],
        discount_applied: discount_applied || null,
        notes: notes || null,
        status: "draft",
      })
      .select()
      .single();

    if (error) throw error;

    // Mettre à jour le statut de la demande à "quoted"
    await supabaseAdmin
      .from(TABLES.dev_requests)
      .update({ status: "quoted", updated_at: new Date().toISOString() })
      .eq("id", dev_request_id);

    // Log admin action
    await supabaseAdmin.from(TABLES.admin_logs).insert({
      type: "content",
      description: `Devis cree pour la demande ${dev_request_id} — montant: ${amount}`,
      actor_id: guard.userId,
      target_id: dev_request_id,
      metadata: { action: "dev_quote_created", quote_id: quote.id, amount },
    });

    return NextResponse.json(
      { success: true, quote },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
