import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/whatsapp/logs — Paginated WhatsApp logs
export async function GET(request: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");
  const messageType = searchParams.get("type"); // otp, text, notification, broadcast
  const status = searchParams.get("status"); // sent, failed, delivered, read

  let query = supabaseAdmin
    .from(TABLES.whatsapp_logs)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (messageType) {
    query = query.eq("message_type", messageType);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    logs: data || [],
    total: count || 0,
    limit,
    offset,
  });
}
