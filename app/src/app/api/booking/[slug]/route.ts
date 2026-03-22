import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET /api/booking/[slug] — public: get profile + availability for a slug
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Get profile by slug
  const { data: profile, error: profileError } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("id, slug, full_name, title, avatar_url, bio, city")
    .eq("slug", slug)
    .eq("is_suspended", false)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { success: false, error: "Profil introuvable." },
      { status: 404 }
    );
  }

  // Get active availability slots
  const { data: slots } = await supabaseAdmin
    .from(TABLES.availability_slots)
    .select("id, day_of_week, start_time, end_time, is_active")
    .eq("profile_id", profile.id)
    .eq("is_active", true)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  return NextResponse.json({
    success: true,
    profile,
    slots: slots ?? [],
  });
}

// POST /api/booking/[slug] — public: book an appointment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Get profile (host)
  const { data: profile } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("id, slug, full_name")
    .eq("slug", slug)
    .eq("is_suspended", false)
    .single();

  if (!profile) {
    return NextResponse.json(
      { success: false, error: "Profil introuvable." },
      { status: 404 }
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

  const date = typeof body.date === "string" ? body.date.trim() : "";
  const startTime =
    typeof body.start_time === "string" ? body.start_time.trim() : "";
  const endTime =
    typeof body.end_time === "string" ? body.end_time.trim() : "";
  const guestName =
    typeof body.guest_name === "string" ? body.guest_name.trim() : "";
  const guestEmail =
    typeof body.guest_email === "string" ? body.guest_email.trim() : "";
  const guestPhone =
    typeof body.guest_phone === "string"
      ? body.guest_phone.trim() || null
      : null;
  const notes =
    typeof body.notes === "string" ? body.notes.trim() || null : null;

  // Validate required fields
  if (!date || !startTime || !endTime || !guestName || !guestEmail) {
    return NextResponse.json(
      {
        success: false,
        error:
          "date, start_time, end_time, guest_name et guest_email sont requis.",
      },
      { status: 400 }
    );
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return NextResponse.json(
      { success: false, error: "Format de date invalide (YYYY-MM-DD)." },
      { status: 400 }
    );
  }

  // Validate date is in the future
  const today = new Date().toISOString().split("T")[0];
  if (date < today) {
    return NextResponse.json(
      { success: false, error: "La date doit etre dans le futur." },
      { status: 400 }
    );
  }

  // Validate time format
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return NextResponse.json(
      { success: false, error: "Format de temps invalide (HH:MM)." },
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

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(guestEmail)) {
    return NextResponse.json(
      { success: false, error: "Email invalide." },
      { status: 400 }
    );
  }

  // Verify the time matches an availability slot for that day_of_week
  const bookingDate = new Date(date + "T00:00:00");
  const dayOfWeek = bookingDate.getDay(); // 0=Sunday

  const { data: availSlots } = await supabaseAdmin
    .from(TABLES.availability_slots)
    .select("id, start_time, end_time")
    .eq("profile_id", profile.id)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true);

  if (!availSlots || availSlots.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Aucun creneau disponible pour ce jour.",
      },
      { status: 400 }
    );
  }

  // Check that the requested time falls within an availability slot
  const matchesSlot = availSlots.some(
    (slot) => startTime >= slot.start_time && endTime <= slot.end_time
  );

  if (!matchesSlot) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Le creneau demande ne correspond a aucune disponibilite.",
      },
      { status: 400 }
    );
  }

  // Check no conflicting appointment (same host, same date, overlapping time)
  const { data: existingAppts } = await supabaseAdmin
    .from(TABLES.appointments)
    .select("id, start_time, end_time")
    .eq("host_id", profile.id)
    .eq("date", date)
    .in("status", ["pending", "confirmed"]);

  const hasConflict = (existingAppts ?? []).some(
    (appt) => startTime < appt.end_time && endTime > appt.start_time
  );

  if (hasConflict) {
    return NextResponse.json(
      {
        success: false,
        error: "Ce creneau est deja reserve. Veuillez en choisir un autre.",
      },
      { status: 409 }
    );
  }

  // Calculate duration in minutes
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);

  // Create appointment
  const { data: appointment, error: createError } = await supabaseAdmin
    .from(TABLES.appointments)
    .insert({
      host_id: profile.id,
      guest_name: guestName.slice(0, 100),
      guest_email: guestEmail.slice(0, 255),
      guest_phone: guestPhone?.slice(0, 30) ?? null,
      date,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: durationMinutes,
      status: "confirmed",
      notes: notes?.slice(0, 500) ?? null,
    })
    .select()
    .single();

  if (createError || !appointment) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la reservation." },
      { status: 500 }
    );
  }

  // TODO: Send confirmation email via Resend

  return NextResponse.json(
    { success: true, appointment },
    { status: 201 }
  );
}
