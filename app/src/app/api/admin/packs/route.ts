import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { data: packs, error } = await supabaseAdmin
    .from(TABLES.packs)
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ packs: packs ?? [] });
}

export async function POST(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const body = await req.json();

  if (!body.slug || !body.name) {
    return NextResponse.json({ error: "slug et name sont requis" }, { status: 400 });
  }

  const { data: pack, error } = await supabaseAdmin
    .from(TABLES.packs)
    .insert({
      slug: body.slug.toLowerCase().replace(/\s+/g, "-"),
      name: body.name,
      description: body.description ?? null,
      price: body.price ?? 0,
      currency: body.currency ?? "XOF",
      icon: body.icon ?? "Package",
      color: body.color ?? "#f97316",
      is_active: body.is_active ?? true,
      sort_order: body.sort_order ?? 99,
      includes: body.includes ?? [],
      unlocked_features: body.unlocked_features ?? [],
      duration_days: body.duration_days ?? null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: `Un pack avec le slug "${body.slug}" existe deja` }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    type: "system",
    description: `Pack "${body.name}" cree`,
    actor_id: guard.userId,
    metadata: { pack_id: pack.id },
  });

  return NextResponse.json({ pack }, { status: 201 });
}
