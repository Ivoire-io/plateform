import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const supabase = await createClient();

  // Récupère tous les non-invités
  const { data: pending, error: fetchError } = await supabase
    .from(TABLES.waitlist)
    .select("id, email")
    .eq("invited", false);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!pending || pending.length === 0) {
    return NextResponse.json({ invited: 0, message: "No pending entries" });
  }

  const ids = pending.map((e) => e.id);

  const { error } = await supabase
    .from(TABLES.waitlist)
    .update({ invited: true, invited_at: new Date().toISOString() })
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from(TABLES.admin_logs).insert({
    admin_id: guard.userId,
    action: "waitlist_invite_all",
    target_type: "waitlist",
    metadata: { count: ids.length },
  });

  return NextResponse.json({ invited: ids.length });
}
