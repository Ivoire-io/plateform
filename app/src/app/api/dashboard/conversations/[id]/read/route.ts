import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// POST /api/dashboard/conversations/[id]/read — mark conversation as read
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Non authentifie." },
      { status: 401 }
    );
  }

  // Verify user is a participant and update last_read_at
  const { data: participant, error } = await supabaseAdmin
    .from(TABLES.conversation_participants)
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .select("id")
    .single();

  if (error || !participant) {
    return NextResponse.json(
      { success: false, error: "Conversation introuvable ou acces refuse." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
