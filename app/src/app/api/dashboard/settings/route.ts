import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/settings — récupérer les préférences de notification et confidentialité
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from(TABLES.profiles)
    .select("notif_messages, notif_weekly_report, notif_news, privacy_visible_in_directory, privacy_show_email")
    .eq("id", user.id)
    .single();

  // Valeurs par défaut si champs absents
  const settings = {
    notif_messages: profile?.notif_messages ?? true,
    notif_weekly_report: profile?.notif_weekly_report ?? false,
    notif_news: profile?.notif_news ?? true,
    privacy_visible_in_directory: profile?.privacy_visible_in_directory ?? true,
    privacy_show_email: profile?.privacy_show_email ?? false,
  };

  return NextResponse.json({ success: true, settings });
}

// PUT /api/dashboard/settings — mettre à jour les préférences
export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps de requête invalide." }, { status: 400 });
  }

  // Seuls ces champs sont autorisés — pas d'injection possible
  const updates: Record<string, boolean> = {};
  for (const key of [
    "notif_messages",
    "notif_weekly_report",
    "notif_news",
    "privacy_visible_in_directory",
    "privacy_show_email",
  ]) {
    if (typeof body[key] === "boolean") {
      updates[key] = body[key] as boolean;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: "Aucun champ valide." }, { status: 400 });
  }

  const { error } = await supabase
    .from(TABLES.profiles)
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
