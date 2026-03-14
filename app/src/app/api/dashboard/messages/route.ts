import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/messages — messages reçus par le profil de l'utilisateur connecté
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  // Récupérer le profil de l'utilisateur pour obtenir son profile_id
  const { data: profile } = await supabase
    .from(TABLES.profiles)
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ success: false, error: "Profil introuvable." }, { status: 404 });
  }

  const { data: messages, error } = await supabase
    .from(TABLES.contact_messages)
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: "Erreur lors de la récupération." }, { status: 500 });
  }

  return NextResponse.json({ success: true, messages: messages ?? [] });
}
