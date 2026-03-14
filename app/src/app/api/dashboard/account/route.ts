import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// DELETE /api/dashboard/account — supprimer le compte de l'utilisateur connecté
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  // Supprimer les données dans l'ordre (projets, expériences, messages, profil)
  await supabase.from(TABLES.projects).delete().eq("profile_id", user.id);
  await supabase.from(TABLES.experiences).delete().eq("profile_id", user.id);
  await supabase.from(TABLES.contact_messages).delete().eq("profile_id", user.id);
  await supabase.from(TABLES.profiles).delete().eq("id", user.id);

  // Supprimer l'utilisateur auth via le client admin
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de la suppression du compte." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
