import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { sendWhatsAppMessage } from "@/lib/wasender";
import { NextRequest, NextResponse } from "next/server";

// POST /api/admin/whatsapp/send — Send a single WhatsApp message
export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps invalide." }, { status: 400 });
  }

  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!phone || !message) {
    return NextResponse.json({ success: false, error: "phone et message requis." }, { status: 400 });
  }

  const sent = await sendWhatsAppMessage(phone, message);

  // Log
  await supabaseAdmin.from(TABLES.whatsapp_logs).insert({
    phone,
    message_type: "text",
    content: message.slice(0, 500),
    status: sent ? "sent" : "failed",
    metadata: { sent_by: guard.userId, source: "admin" },
  });

  if (!sent) {
    return NextResponse.json({ success: false, error: "Echec de l'envoi." }, { status: 502 });
  }

  return NextResponse.json({ success: true, message: "Message envoye." });
}
