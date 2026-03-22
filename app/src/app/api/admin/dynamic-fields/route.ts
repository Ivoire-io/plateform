import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/dynamic-fields — List all fields (including inactive)
export async function GET(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  let query = supabaseAdmin
    .from(TABLES.dynamic_fields)
    .select("*")
    .order("category")
    .order("sort_order")
    .order("label");

  if (category) query = query.eq("category", category);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

// POST /api/admin/dynamic-fields — Add a new field
export async function POST(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const body = await req.json() as {
    category: string;
    value: string;
    label: string;
    parent?: string | null;
    sort_order?: number;
  };

  if (!body.category || !body.value || !body.label) {
    return NextResponse.json({ error: "category, value, and label are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from(TABLES.dynamic_fields)
    .insert({
      category: body.category,
      value: body.value.toLowerCase().replace(/\s+/g, "-"),
      label: body.label,
      parent: body.parent ?? null,
      sort_order: body.sort_order ?? 0,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Cette valeur existe deja pour cette categorie" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from(TABLES.admin_logs).insert({
    admin_id: guard.userId,
    action: "dynamic_field_created",
    target_type: "dynamic_field",
    target_id: data.id,
    metadata: { category: body.category, value: body.value, label: body.label },
  });

  return NextResponse.json(data, { status: 201 });
}

// PUT /api/admin/dynamic-fields — Update a field
export async function PUT(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const body = await req.json() as {
    id: string;
    label?: string;
    parent?: string | null;
    sort_order?: number;
    is_active?: boolean;
  };

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.label !== undefined) updates.label = body.label;
  if (body.parent !== undefined) updates.parent = body.parent;
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  const { data, error } = await supabaseAdmin
    .from(TABLES.dynamic_fields)
    .update(updates)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// DELETE /api/admin/dynamic-fields — Remove a field
export async function DELETE(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { id } = await req.json() as { id: string };

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from(TABLES.dynamic_fields)
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
