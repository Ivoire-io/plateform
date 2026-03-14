import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/experiences
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from(TABLES.experiences)
    .select("*")
    .eq("profile_id", user.id)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

// POST /api/dashboard/experiences
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps invalide." }, { status: 400 });
  }

  const role = typeof body.role === "string" ? body.role.trim().slice(0, 100) : "";
  const company = typeof body.company === "string" ? body.company.trim().slice(0, 100) : "";
  const startDate = typeof body.start_date === "string" ? body.start_date : "";

  if (!role || !company || !startDate) {
    return NextResponse.json({ success: false, error: "Poste, entreprise et date de début requis." }, { status: 400 });
  }

  // Valider le format de date (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return NextResponse.json({ success: false, error: "Format de date invalide." }, { status: 400 });
  }

  const endDate = typeof body.end_date === "string" && body.end_date.trim() ? body.end_date.trim() : null;
  if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return NextResponse.json({ success: false, error: "Format de date de fin invalide." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(TABLES.experiences)
    .insert({
      profile_id: user.id,
      role,
      company,
      start_date: startDate,
      end_date: endDate,
      description: typeof body.description === "string" ? body.description.trim().slice(0, 500) || null : null,
      sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la création." }, { status: 500 });

  return NextResponse.json({ success: true, data }, { status: 201 });
}
