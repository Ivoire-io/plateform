import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/conversations — list conversations for current user
export async function GET() {
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

  // Get conversation IDs where user is a participant
  const { data: participantRows, error: partError } = await supabaseAdmin
    .from(TABLES.conversation_participants)
    .select("conversation_id, last_read_at")
    .eq("profile_id", user.id);

  if (partError) {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }

  if (!participantRows || participantRows.length === 0) {
    return NextResponse.json({ success: true, conversations: [] });
  }

  const conversationIds = participantRows.map((p) => p.conversation_id);
  const lastReadMap: Record<string, string | null> = {};
  for (const p of participantRows) {
    lastReadMap[p.conversation_id] = p.last_read_at;
  }

  // Fetch conversations
  const { data: conversations, error: convError } = await supabaseAdmin
    .from(TABLES.conversations)
    .select("*")
    .in("id", conversationIds)
    .order("updated_at", { ascending: false });

  if (convError) {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }

  // For each conversation, get participants with profiles, last message, unread count
  const enriched = await Promise.all(
    (conversations ?? []).map(async (conv) => {
      // Participants with profiles
      const { data: participants } = await supabaseAdmin
        .from(TABLES.conversation_participants)
        .select("id, conversation_id, profile_id, joined_at, last_read_at")
        .eq("conversation_id", conv.id);

      // Get profile info for each participant
      const profileIds = (participants ?? []).map((p) => p.profile_id);
      const { data: profiles } = await supabaseAdmin
        .from(TABLES.profiles)
        .select("id, full_name, slug, avatar_url")
        .in("id", profileIds);

      const profileMap: Record<
        string,
        { full_name: string; slug: string; avatar_url: string | null }
      > = {};
      for (const prof of profiles ?? []) {
        profileMap[prof.id] = prof;
      }

      const enrichedParticipants = (participants ?? []).map((p) => ({
        ...p,
        profile: profileMap[p.profile_id] ?? null,
      }));

      // Last message
      const { data: lastMessages } = await supabaseAdmin
        .from(TABLES.chat_messages)
        .select("id, conversation_id, sender_id, content, message_type, file_url, created_at")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastMessage = lastMessages && lastMessages.length > 0 ? lastMessages[0] : null;

      // Attach sender profile to last message
      let lastMessageWithSender: Record<string, unknown> | null = lastMessage;
      if (lastMessage) {
        const senderProfile = profileMap[lastMessage.sender_id] ?? null;
        lastMessageWithSender = { ...lastMessage, sender: senderProfile };
      }

      // Unread count
      const lastReadAt = lastReadMap[conv.id];
      let unreadCount = 0;

      if (lastReadAt) {
        const { count } = await supabaseAdmin
          .from(TABLES.chat_messages)
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id)
          .gt("created_at", lastReadAt);
        unreadCount = count ?? 0;
      } else {
        // Never read: all messages from others are unread
        const { count } = await supabaseAdmin
          .from(TABLES.chat_messages)
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id);
        unreadCount = count ?? 0;
      }

      return {
        ...conv,
        participants: enrichedParticipants,
        last_message: lastMessageWithSender,
        unread_count: unreadCount,
      };
    })
  );

  return NextResponse.json({ success: true, conversations: enriched });
}

// POST /api/dashboard/conversations — create or find a conversation
export async function POST(request: Request) {
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Corps invalide." },
      { status: 400 }
    );
  }

  const participantIds = Array.isArray(body.participant_ids)
    ? (body.participant_ids as string[]).filter(
      (id) => typeof id === "string" && id.length > 0
    )
    : [];

  if (participantIds.length === 0) {
    return NextResponse.json(
      { success: false, error: "participant_ids requis." },
      { status: 400 }
    );
  }

  // Ensure current user is included
  const allParticipants = Array.from(
    new Set([user.id, ...participantIds])
  );

  const contextType =
    typeof body.context_type === "string" ? body.context_type : null;
  const contextId =
    typeof body.context_id === "string" ? body.context_id : null;
  const initialMessage =
    typeof body.initial_message === "string"
      ? body.initial_message.trim()
      : null;

  // For direct conversations (2 participants), check if one already exists
  if (allParticipants.length === 2) {
    const otherUserId = allParticipants.find((id) => id !== user.id)!;

    // Get conversations where current user is participant
    const { data: myConvs } = await supabaseAdmin
      .from(TABLES.conversation_participants)
      .select("conversation_id")
      .eq("profile_id", user.id);

    if (myConvs && myConvs.length > 0) {
      const myConvIds = myConvs.map((c) => c.conversation_id);

      // Check if other user is also in any of those conversations
      const { data: sharedConvs } = await supabaseAdmin
        .from(TABLES.conversation_participants)
        .select("conversation_id")
        .eq("profile_id", otherUserId)
        .in("conversation_id", myConvIds);

      if (sharedConvs && sharedConvs.length > 0) {
        // Verify it's a direct conversation (exactly 2 participants)
        for (const sc of sharedConvs) {
          const { data: conv } = await supabaseAdmin
            .from(TABLES.conversations)
            .select("*")
            .eq("id", sc.conversation_id)
            .eq("type", "direct")
            .single();

          if (conv) {
            // Return existing conversation with participants
            const { data: participants } = await supabaseAdmin
              .from(TABLES.conversation_participants)
              .select(
                "id, conversation_id, profile_id, joined_at, last_read_at"
              )
              .eq("conversation_id", conv.id);

            const profileIds = (participants ?? []).map((p) => p.profile_id);
            const { data: profiles } = await supabaseAdmin
              .from(TABLES.profiles)
              .select("id, full_name, slug, avatar_url")
              .in("id", profileIds);

            const profileMap: Record<string, { full_name: string; slug: string; avatar_url: string | null }> = {};
            for (const prof of profiles ?? []) {
              profileMap[prof.id] = prof;
            }

            const enrichedParticipants = (participants ?? []).map((p) => ({
              ...p,
              profile: profileMap[p.profile_id] ?? null,
            }));

            return NextResponse.json({
              success: true,
              conversation: { ...conv, participants: enrichedParticipants },
              existing: true,
            });
          }
        }
      }
    }
  }

  // Create new conversation
  const convType = allParticipants.length === 2 ? "direct" : "group";
  const { data: newConv, error: convError } = await supabaseAdmin
    .from(TABLES.conversations)
    .insert({
      type: convType,
      context_type: contextType,
      context_id: contextId,
    })
    .select()
    .single();

  if (convError || !newConv) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la creation." },
      { status: 500 }
    );
  }

  // Add participants
  const participantInserts = allParticipants.map((pid) => ({
    conversation_id: newConv.id,
    profile_id: pid,
  }));

  const { error: partInsertError } = await supabaseAdmin
    .from(TABLES.conversation_participants)
    .insert(participantInserts);

  if (partInsertError) {
    // Cleanup conversation
    await supabaseAdmin
      .from(TABLES.conversations)
      .delete()
      .eq("id", newConv.id);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'ajout des participants." },
      { status: 500 }
    );
  }

  // Send initial message if provided
  if (initialMessage) {
    await supabaseAdmin.from(TABLES.chat_messages).insert({
      conversation_id: newConv.id,
      sender_id: user.id,
      content: initialMessage,
      message_type: "text",
    });

    // Update conversation updated_at
    await supabaseAdmin
      .from(TABLES.conversations)
      .update({ updated_at: new Date().toISOString() })
      .eq("id", newConv.id);
  }

  // Fetch participants with profiles
  const { data: finalParticipants } = await supabaseAdmin
    .from(TABLES.conversation_participants)
    .select("id, conversation_id, profile_id, joined_at, last_read_at")
    .eq("conversation_id", newConv.id);

  const profileIds = (finalParticipants ?? []).map((p) => p.profile_id);
  const { data: profiles } = await supabaseAdmin
    .from(TABLES.profiles)
    .select("id, full_name, slug, avatar_url")
    .in("id", profileIds);

  const profileMap: Record<string, { full_name: string; slug: string; avatar_url: string | null }> = {};
  for (const prof of profiles ?? []) {
    profileMap[prof.id] = prof;
  }

  const enrichedParticipants = (finalParticipants ?? []).map((p) => ({
    ...p,
    profile: profileMap[p.profile_id] ?? null,
  }));

  return NextResponse.json(
    {
      success: true,
      conversation: { ...newConv, participants: enrichedParticipants },
      existing: false,
    },
    { status: 201 }
  );
}
