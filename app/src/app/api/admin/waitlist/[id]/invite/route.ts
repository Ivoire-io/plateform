import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await params;
  const supabase = await createClient();

  // Récupère l'entrée waitlist
  const { data: entry, error: fetchError } = await supabase
    .from(TABLES.waitlist)
    .select("email, invited")
    .eq("id", id)
    .single();

  if (fetchError || !entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  if (entry.invited) {
    return NextResponse.json({ error: "Already invited" }, { status: 409 });
  }

  // Marquer comme invité
  const { error } = await supabase
    .from(TABLES.waitlist)
    .update({ invited: true, invited_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from(TABLES.admin_logs).insert({
    admin_id: guard.userId,
    action: "waitlist_invited",
    target_type: "waitlist",
    target_id: id,
    metadata: { email: entry.email },
  });

  return NextResponse.json({ success: true });
}
