import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const filter = searchParams.get("filter"); // "unread" | null
  const search = searchParams.get("search");
  const from = (page - 1) * limit;

  let query = supabaseAdmin
    .from(TABLES.contact_messages)
    .select("*, profile:profile_id(full_name, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (filter === "unread") query = query.eq("is_read", false);
  if (search) {
    query = query.or(`sender_name.ilike.%${search}%,sender_email.ilike.%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ messages: data ?? [], total: count ?? 0 });
}
