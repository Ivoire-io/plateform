import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const from = (page - 1) * limit;

  const supabase = await createClient();

  const { data, count, error } = await supabase
    .from(TABLES.broadcasts)
    .select("*, sender:sender_id(full_name)", { count: "exact" })
    .range(from, from + limit - 1)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ broadcasts: data ?? [], total: count ?? 0 });
}

export async function POST(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const body = await req.json() as {
    subject: string;
    message: string;
    channels: string[];
    target_type?: string;
    target_plan?: string;
    scheduled_at?: string | null;
  };

  if (!body.subject?.trim() || !body.message?.trim()) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLES.broadcasts)
    .insert({
      sender_id: guard.userId,
      subject: body.subject,
      message: body.message,
      channels: body.channels ?? ["email"],
      target_type: body.target_type ?? null,
      target_plan: body.target_plan ?? null,
      scheduled_at: body.scheduled_at ?? null,
      status: body.scheduled_at ? "scheduled" : "sent",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from(TABLES.admin_logs).insert({
    admin_id: guard.userId,
    action: body.scheduled_at ? "broadcast_scheduled" : "broadcast_sent",
    target_type: "broadcast",
    target_id: data.id,
    metadata: { subject: body.subject, channels: body.channels },
  });

  return NextResponse.json(data, { status: 201 });
}
