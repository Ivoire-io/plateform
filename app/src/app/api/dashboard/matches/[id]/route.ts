import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// PATCH /api/dashboard/matches/[id] — Update match status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const { status } = await request.json();

    const validStatuses = ["viewed", "contacted", "accepted", "dismissed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(TABLES.matches)
      .update({ status })
      .eq("id", id)
      .eq("dev_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Erreur mise a jour" }, { status: 500 });
    }

    return NextResponse.json({ success: true, match: data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
