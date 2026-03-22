import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;
  const { status, action } = await req.json() as {
    status: "resolved" | "dismissed";
    action?: "suspend_target";
  };


  const { data: report, error: fetchError } = await supabaseAdmin
    .from(TABLES.reports)
    .select("target_id")
    .eq("id", id)
    .single();

  if (fetchError || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from(TABLES.reports)
    .update({ status, reviewed_by: guard.userId, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Si action = suspendre la cible
  if (action === "suspend_target" && report.target_id) {
    await supabaseAdmin
      .from(TABLES.profiles)
      .update({ is_suspended: true, updated_at: new Date().toISOString() })
      .eq("id", report.target_id);
  }

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    admin_id: guard.userId,
    action: `report_${status}`,
    target_type: "report",
    target_id: id,
    metadata: { action },
  });

  return NextResponse.json({ success: true });
}
