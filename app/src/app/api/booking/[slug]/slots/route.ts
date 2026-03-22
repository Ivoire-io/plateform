import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET /api/booking/[slug]/slots?date=YYYY-MM-DD — public: available time slots for a date
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const dateParam = request.nextUrl.searchParams.get("date");

  if (!dateParam) {
    return NextResponse.json(
      { success: false, error: "Le parametre date est requis." },
      { status: 400 }
    );
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateParam)) {
    return NextResponse.json(
      { success: false, error: "Format de date invalide (YYYY-MM-DD)." },
      { status: 400 }
    );
  }

  // Get profile
  const { data: profile } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("id")
    .eq("slug", slug)
    .eq("is_suspended", false)
    .single();

  if (!profile) {
    return NextResponse.json(
      { success: false, error: "Profil introuvable." },
      { status: 404 }
    );
  }

  // Get day_of_week from the date
  const bookingDate = new Date(dateParam + "T00:00:00");
  const dayOfWeek = bookingDate.getDay(); // 0=Sunday

  // Get active availability slots for that day
  const { data: availSlots } = await supabaseAdmin
    .from(TABLES.availability_slots)
    .select("id, start_time, end_time")
    .eq("profile_id", profile.id)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true)
    .order("start_time", { ascending: true });

  if (!availSlots || availSlots.length === 0) {
    return NextResponse.json({
      success: true,
      slots: [],
      message: "Aucune disponibilite pour ce jour.",
    });
  }

  // Get existing confirmed/pending appointments for that date
  const { data: existingAppts } = await supabaseAdmin
    .from(TABLES.appointments)
    .select("id, start_time, end_time")
    .eq("host_id", profile.id)
    .eq("date", dateParam)
    .in("status", ["pending", "confirmed"]);

  const bookedSlots = existingAppts ?? [];

  // Generate 30-minute blocks from availability, excluding booked times
  const availableBlocks: Array<{ start_time: string; end_time: string }> = [];

  for (const slot of availSlots) {
    const [startH, startM] = slot.start_time.split(":").map(Number);
    const [endH, endM] = slot.end_time.split(":").map(Number);
    const slotStartMinutes = startH * 60 + startM;
    const slotEndMinutes = endH * 60 + endM;

    // Generate 30-min blocks
    for (
      let blockStart = slotStartMinutes;
      blockStart + 30 <= slotEndMinutes;
      blockStart += 30
    ) {
      const blockEnd = blockStart + 30;
      const blockStartTime = `${String(Math.floor(blockStart / 60)).padStart(2, "0")}:${String(blockStart % 60).padStart(2, "0")}`;
      const blockEndTime = `${String(Math.floor(blockEnd / 60)).padStart(2, "0")}:${String(blockEnd % 60).padStart(2, "0")}`;

      // Check if this block overlaps with any booked appointment
      const isBooked = bookedSlots.some(
        (appt) =>
          blockStartTime < appt.end_time && blockEndTime > appt.start_time
      );

      if (!isBooked) {
        availableBlocks.push({
          start_time: blockStartTime,
          end_time: blockEndTime,
        });
      }
    }
  }

  // If the date is today, filter out past blocks
  const today = new Date().toISOString().split("T")[0];
  let finalBlocks = availableBlocks;
  if (dateParam === today) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nowTime = `${String(Math.floor(nowMinutes / 60)).padStart(2, "0")}:${String(nowMinutes % 60).padStart(2, "0")}`;
    finalBlocks = availableBlocks.filter(
      (block) => block.start_time > nowTime
    );
  }

  return NextResponse.json({
    success: true,
    slots: finalBlocks,
  });
}
