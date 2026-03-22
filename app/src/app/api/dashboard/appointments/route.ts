import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET /api/dashboard/appointments — list appointments for current user as host
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Non authentifie." },
      { status: 401 }
    );
  }

  const status = request.nextUrl.searchParams.get("status") ?? "all";
  const today = new Date().toISOString().split("T")[0];

  let query = supabaseAdmin
    .from(TABLES.appointments)
    .select("*")
    .eq("host_id", user.id);

  if (status === "upcoming") {
    query = query
      .gte("date", today)
      .in("status", ["pending", "confirmed"])
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
  } else if (status === "past") {
    // Past = date < today OR status in (completed, cancelled, no_show)
    // Supabase doesn't support OR easily across different columns, so we fetch all and filter
    query = query
      .order("date", { ascending: false })
      .order("start_time", { ascending: false });
  } else {
    query = query
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
  }

  const { data: appointments, error } = await query;

  if (error) {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }

  let filtered = appointments ?? [];

  if (status === "past") {
    filtered = filtered.filter(
      (a) =>
        a.date < today ||
        ["completed", "cancelled", "no_show"].includes(a.status)
    );
  }

  return NextResponse.json({ success: true, appointments: filtered });
}

// PATCH /api/dashboard/appointments — update appointment status
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Non authentifie." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Corps invalide." },
      { status: 400 }
    );
  }

  const appointmentId = typeof body.id === "string" ? body.id : "";
  const newStatus = typeof body.status === "string" ? body.status : "";
  const cancellationReason =
    typeof body.cancellation_reason === "string"
      ? body.cancellation_reason.trim()
      : null;

  if (!appointmentId) {
    return NextResponse.json(
      { success: false, error: "id requis." },
      { status: 400 }
    );
  }

  const validStatuses = ["confirmed", "cancelled", "completed", "no_show"];
  if (!validStatuses.includes(newStatus)) {
    return NextResponse.json(
      {
        success: false,
        error: `Statut invalide. Valeurs acceptees: ${validStatuses.join(", ")}`,
      },
      { status: 400 }
    );
  }

  // Verify the appointment belongs to the current user (host)
  const { data: existing } = await supabaseAdmin
    .from(TABLES.appointments)
    .select("id, host_id, status")
    .eq("id", appointmentId)
    .eq("host_id", user.id)
    .single();

  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Rendez-vous introuvable." },
      { status: 404 }
    );
  }

  const updateData: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === "cancelled" && cancellationReason) {
    updateData.cancellation_reason = cancellationReason;
  }

  const { data: updated, error } = await supabaseAdmin
    .from(TABLES.appointments)
    .update(updateData)
    .eq("id", appointmentId)
    .select()
    .single();

  if (error || !updated) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise a jour." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, appointment: updated });
}
