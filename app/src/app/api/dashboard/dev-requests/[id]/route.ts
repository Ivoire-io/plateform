import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/dashboard/dev-requests/[id] — Détail d'une demande avec devis
export async function GET(_request: Request, context: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  const { data: devRequest, error } = await supabase
    .from(TABLES.dev_requests)
    .select("*")
    .eq("id", id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  if (!devRequest) {
    return NextResponse.json(
      { error: "Demande introuvable." },
      { status: 404 }
    );
  }

  // Récupérer les devis associés
  const { data: quotes } = await supabase
    .from(TABLES.dev_quotes)
    .select("*")
    .eq("dev_request_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    request: devRequest,
    quotes: quotes || [],
  });
}

// PATCH /api/dashboard/dev-requests/[id] — Modifier une demande
export async function PATCH(request: Request, context: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  try {
    const body = await request.json();
    const {
      title,
      description,
      required_roles,
      budget_min,
      budget_max,
      timeline,
      payment_type,
      status,
    } = body;

    // Vérifier que la demande appartient au user
    const { data: existing } = await supabase
      .from(TABLES.dev_requests)
      .select("id, status")
      .eq("id", id)
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: "Demande introuvable." },
        { status: 404 }
      );
    }

    // Valider les transitions de statut autorisées pour le user
    if (status) {
      const allowedTransitions: Record<string, string[]> = {
        draft: ["submitted"],
        submitted: ["cancelled"],
      };
      const allowed = allowedTransitions[existing.status] || [];
      if (!allowed.includes(status)) {
        return NextResponse.json(
          { error: "Transition de statut non autorisée." },
          { status: 400 }
        );
      }
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (required_roles !== undefined) updates.required_roles = required_roles;
    if (budget_min !== undefined) updates.budget_min = budget_min;
    if (budget_max !== undefined) updates.budget_max = budget_max;
    if (timeline !== undefined) updates.timeline = timeline;
    if (payment_type !== undefined) updates.payment_type = payment_type;
    if (status !== undefined) updates.status = status;

    const { data: updated, error } = await supabase
      .from(TABLES.dev_requests)
      .update(updates)
      .eq("id", id)
      .eq("profile_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, request: updated });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
