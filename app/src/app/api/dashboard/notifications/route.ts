import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET — List notifications for current user
export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const offset = parseInt(searchParams.get("offset") || "0");
  const unreadOnly = searchParams.get("unread_only") === "true";

  let query = supabaseAdmin
    .from(TABLES.notifications)
    .select("*", { count: "exact" })
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (unreadOnly) {
    query = query.eq("read", false);
  }

  const { data: notifications, count, error } = await query;

  if (error) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la recuperation des notifications." },
      { status: 500 }
    );
  }

  // Also get unread count
  const { count: unreadCount } = await supabaseAdmin
    .from(TABLES.notifications)
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .eq("read", false);

  return NextResponse.json({
    success: true,
    notifications: notifications || [],
    total: count || 0,
    unread_count: unreadCount || 0,
  });
}

// PATCH — Mark notifications as read
export async function PATCH(request: Request) {
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
      { success: false, error: "Corps de requete invalide." },
      { status: 400 }
    );
  }

  const markAll = body.mark_all === true;
  const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === "string") : [];

  if (!markAll && ids.length === 0) {
    return NextResponse.json(
      { success: false, error: "Fournissez 'ids' ou 'mark_all: true'." },
      { status: 400 }
    );
  }

  if (markAll) {
    await supabaseAdmin
      .from(TABLES.notifications)
      .update({ read: true })
      .eq("profile_id", user.id)
      .eq("read", false);
  } else {
    await supabaseAdmin
      .from(TABLES.notifications)
      .update({ read: true })
      .eq("profile_id", user.id)
      .in("id", ids);
  }

  return NextResponse.json({ success: true });
}
