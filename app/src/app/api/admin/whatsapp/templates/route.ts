import { adminGuard } from "@/lib/admin-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/whatsapp/templates — List all templates
export async function GET() {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { data, error } = await supabaseAdmin
    .from(TABLES.whatsapp_templates)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, templates: data || [] });
}

// POST /api/admin/whatsapp/templates — Create a new template
export async function POST(request: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps invalide." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const variables = Array.isArray(body.variables) ? body.variables.filter((v): v is string => typeof v === "string") : [];

  if (!name || !content) {
    return NextResponse.json({ success: false, error: "name et content requis." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from(TABLES.whatsapp_templates)
    .insert({ name, content, variables })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ success: false, error: "Un template avec ce nom existe deja." }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, template: data }, { status: 201 });
}

// PUT /api/admin/whatsapp/templates — Update an existing template
export async function PUT(request: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps invalide." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const content = typeof body.content === "string" ? body.content.trim() : undefined;
  const variables = Array.isArray(body.variables) ? body.variables.filter((v): v is string => typeof v === "string") : undefined;

  if (!id) {
    return NextResponse.json({ success: false, error: "id requis." }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name) updates.name = name;
  if (content) updates.content = content;
  if (variables) updates.variables = variables;

  const { data, error } = await supabaseAdmin
    .from(TABLES.whatsapp_templates)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, template: data });
}

// DELETE /api/admin/whatsapp/templates — Delete a template
export async function DELETE(request: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "id requis." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from(TABLES.whatsapp_templates)
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
