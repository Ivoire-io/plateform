import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET /api/dashboard/conversations/[id]/messages — list messages for a conversation
export async function GET(
  request: NextRequest,
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

  // Verify user is a participant
  const { data: participant } = await supabaseAdmin
    .from(TABLES.conversation_participants)
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .single();

  if (!participant) {
    return NextResponse.json(
      { success: false, error: "Acces refuse." },
      { status: 403 }
    );
  }

  // Pagination
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const offset = (page - 1) * limit;

  // Get total count
  const { count: totalCount } = await supabaseAdmin
    .from(TABLES.chat_messages)
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId);

  // Get messages ordered ASC (oldest first)
  const { data: messages, error } = await supabaseAdmin
    .from(TABLES.chat_messages)
    .select("id, conversation_id, sender_id, content, message_type, file_url, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }

  // Attach sender profiles
  const senderIds = [
    ...new Set((messages ?? []).map((m) => m.sender_id)),
  ];

  let profileMap: Record<
    string,
    { full_name: string; slug: string; avatar_url: string | null }
  > = {};

  if (senderIds.length > 0) {
    const { data: profiles } = await supabaseAdmin
      .from(TABLES.profiles)
      .select("id, full_name, slug, avatar_url")
      .in("id", senderIds);

    for (const prof of profiles ?? []) {
      profileMap[prof.id] = prof;
    }
  }

  const enrichedMessages = (messages ?? []).map((m) => ({
    ...m,
    sender: profileMap[m.sender_id] ?? null,
  }));

  return NextResponse.json({
    success: true,
    messages: enrichedMessages,
    pagination: {
      page,
      limit,
      total: totalCount ?? 0,
      total_pages: Math.ceil((totalCount ?? 0) / limit),
    },
  });
}

// POST /api/dashboard/conversations/[id]/messages — send a message
export async function POST(
  request: Request,
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

  // Verify user is a participant
  const { data: participant } = await supabaseAdmin
    .from(TABLES.conversation_participants)
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .single();

  if (!participant) {
    return NextResponse.json(
      { success: false, error: "Acces refuse." },
      { status: 403 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Corps invalide." },
      { status: 400 }
    );
  }

  const content =
    typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json(
      { success: false, error: "Le contenu est requis." },
      { status: 400 }
    );
  }

  const messageType =
    body.message_type === "file" ? "file" : "text";
  const fileUrl =
    typeof body.file_url === "string" ? body.file_url.trim() || null : null;

  // Insert message
  const { data: message, error: msgError } = await supabaseAdmin
    .from(TABLES.chat_messages)
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      message_type: messageType,
      file_url: fileUrl,
    })
    .select()
    .single();

  if (msgError || !message) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'envoi." },
      { status: 500 }
    );
  }

  // Update conversation.updated_at
  await supabaseAdmin
    .from(TABLES.conversations)
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  // Update sender's last_read_at to now
  await supabaseAdmin
    .from(TABLES.conversation_participants)
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id);

  // Attach sender profile
  const { data: senderProfile } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("id, full_name, slug, avatar_url")
    .eq("id", user.id)
    .single();

  return NextResponse.json(
    {
      success: true,
      message: {
        ...message,
        sender: senderProfile ?? null,
      },
    },
    { status: 201 }
  );
}
