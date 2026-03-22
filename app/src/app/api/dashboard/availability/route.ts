import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET /api/dashboard/availability — list availability slots for current user
export async function GET() {
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

  const { data: slots, error } = await supabaseAdmin
    .from(TABLES.availability_slots)
    .select("*")
    .eq("profile_id", user.id)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, slots: slots ?? [] });
}

// POST /api/dashboard/availability — create or update a slot
export async function POST(request: Request) {
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

  const dayOfWeek =
    typeof body.day_of_week === "number" ? body.day_of_week : -1;
  const startTime =
    typeof body.start_time === "string" ? body.start_time.trim() : "";
  const endTime =
    typeof body.end_time === "string" ? body.end_time.trim() : "";
  const isActive = body.is_active !== false;
  const slotId = typeof body.id === "string" ? body.id : null;

  // Validate day_of_week
  if (dayOfWeek < 0 || dayOfWeek > 6) {
    return NextResponse.json(
      {
        success: false,
        error: "day_of_week doit etre entre 0 (Dimanche) et 6 (Samedi).",
      },
      { status: 400 }
    );
  }

  // Validate time format HH:MM
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return NextResponse.json(
      { success: false, error: "Format de temps invalide (HH:MM attendu)." },
      { status: 400 }
    );
  }

  // Validate start < end
  if (startTime >= endTime) {
    return NextResponse.json(
      {
        success: false,
        error: "L'heure de debut doit etre avant l'heure de fin.",
      },
      { status: 400 }
    );
  }

  if (slotId) {
    // Update existing slot
    const { data: slot, error } = await supabaseAdmin
      .from(TABLES.availability_slots)
      .update({
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        is_active: isActive,
      })
      .eq("id", slotId)
      .eq("profile_id", user.id)
      .select()
      .single();

    if (error || !slot) {
      return NextResponse.json(
        { success: false, error: "Erreur lors de la mise a jour." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, slot });
  } else {
    // Create new slot
    const { data: slot, error } = await supabaseAdmin
      .from(TABLES.availability_slots)
      .insert({
        profile_id: user.id,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        is_active: isActive,
      })
      .select()
      .single();

    if (error || !slot) {
      return NextResponse.json(
        { success: false, error: "Erreur lors de la creation." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, slot }, { status: 201 });
  }
}

// DELETE /api/dashboard/availability?id=xxx — delete a slot
export async function DELETE(request: NextRequest) {
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

  const slotId = request.nextUrl.searchParams.get("id");
  if (!slotId) {
    return NextResponse.json(
      { success: false, error: "id requis." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from(TABLES.availability_slots)
    .delete()
    .eq("id", slotId)
    .eq("profile_id", user.id);

  if (error) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
