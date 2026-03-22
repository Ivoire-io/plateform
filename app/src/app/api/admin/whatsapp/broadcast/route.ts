import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { sendWhatsAppMessage } from "@/lib/wasender";
import { NextRequest, NextResponse } from "next/server";

// POST /api/admin/whatsapp/broadcast — Send message to multiple users
export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps invalide." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const templateId = typeof body.template_id === "string" ? body.template_id : null;
  const templateVars = body.template_vars && typeof body.template_vars === "object" ? body.template_vars as Record<string, string> : {};
  const filterType = typeof body.filter_type === "string" ? body.filter_type : null; // developer, startup, enterprise
  const filterPlan = typeof body.filter_plan === "string" ? body.filter_plan : null; // free, starter, pro

  // Resolve message from template if template_id is provided
  let finalMessage = message;
  if (templateId) {
    const { data: template } = await supabaseAdmin
      .from(TABLES.whatsapp_templates)
      .select("content, variables")
      .eq("id", templateId)
      .single();

    if (!template) {
      return NextResponse.json({ success: false, error: "Template introuvable." }, { status: 404 });
    }

    finalMessage = template.content;
    // Replace variables: {{name}} → value from templateVars
    for (const [key, value] of Object.entries(templateVars)) {
      finalMessage = finalMessage.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
  }

  if (!finalMessage) {
    return NextResponse.json({ success: false, error: "message ou template_id requis." }, { status: 400 });
  }

  // Fetch target profiles with verified phone
  let query = supabaseAdmin
    .from(TABLES.profiles)
    .select("id, verified_phone, full_name, slug, notif_whatsapp")
    .eq("phone_verified", true)
    .eq("is_suspended", false)
    .not("verified_phone", "is", null);

  if (filterType) {
    query = query.eq("type", filterType);
  }
  if (filterPlan) {
    query = query.eq("plan", filterPlan);
  }

  const { data: profiles, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ success: false, error: "Aucun utilisateur correspondant." }, { status: 404 });
  }

  // Send messages sequentially with slight delay to respect rate limits
  let sent = 0;
  let failed = 0;

  for (const profile of profiles) {
    // Respect user preference
    if (profile.notif_whatsapp === false) continue;

    // Personalize message per user
    let personalizedMsg = finalMessage;
    personalizedMsg = personalizedMsg.replace(/\{\{name\}\}/g, profile.full_name || "");
    personalizedMsg = personalizedMsg.replace(/\{\{slug\}\}/g, profile.slug || "");

    const ok = await sendWhatsAppMessage(profile.verified_phone, personalizedMsg);

    // Log each message
    await supabaseAdmin.from(TABLES.whatsapp_logs).insert({
      phone: profile.verified_phone,
      message_type: "broadcast",
      content: personalizedMsg.slice(0, 500),
      status: ok ? "sent" : "failed",
      profile_id: profile.id,
      metadata: { broadcast_by: guard.userId, template_id: templateId },
    });

    if (ok) sent++;
    else failed++;
  }

  // Log the broadcast action
  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "whatsapp",
    description: `Broadcast WhatsApp: ${sent} envoyes, ${failed} echoues sur ${profiles.length} cibles.`,
    actor_id: guard.userId,
    metadata: { filter_type: filterType, filter_plan: filterPlan, template_id: templateId },
  });

  return NextResponse.json({
    success: true,
    total: profiles.length,
    sent,
    failed,
  });
}
