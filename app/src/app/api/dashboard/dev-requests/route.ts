import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/dev-requests — Liste les demandes de dev du user
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Récupérer la startup du user
  const { data: startup } = await supabase
    .from(TABLES.startups)
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!startup) {
    return NextResponse.json({ requests: [] });
  }

  const { data: requests, error } = await supabase
    .from(TABLES.dev_requests)
    .select("*")
    .eq("startup_id", startup.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  return NextResponse.json({ requests: requests || [] });
}

// POST /api/dashboard/dev-requests — Créer une demande de dev
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const {
      title,
      description,
      cahier_charges_ref,
      required_roles,
      budget_min,
      budget_max,
      timeline,
      payment_type,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Le titre et la description sont requis." },
        { status: 400 }
      );
    }

    // Récupérer la startup du user
    const { data: startup } = await supabase
      .from(TABLES.startups)
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!startup) {
      return NextResponse.json(
        { error: "Vous devez d'abord créer une startup." },
        { status: 400 }
      );
    }

    const { data: devRequest, error } = await supabase
      .from(TABLES.dev_requests)
      .insert({
        startup_id: startup.id,
        profile_id: user.id,
        title,
        description,
        cahier_charges_ref: cahier_charges_ref || null,
        required_roles: required_roles || [],
        budget_min: budget_min || null,
        budget_max: budget_max || null,
        timeline: timeline || null,
        payment_type: payment_type || null,
        status: "draft",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, request: devRequest },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
