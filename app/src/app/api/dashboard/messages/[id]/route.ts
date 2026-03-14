import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

// PUT /api/dashboard/messages/[id] — marquer comme lu
export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  // Vérifier que ce message appartient bien au profil de l'utilisateur (prévention IDOR)
  const { data: message } = await supabase
    .from(TABLES.contact_messages)
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!message || message.profile_id !== user.id) {
    return NextResponse.json({ success: false, error: "Message introuvable." }, { status: 404 });
  }

  const { error } = await supabase
    .from(TABLES.contact_messages)
    .update({ is_read: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/dashboard/messages/[id] — supprimer un message
export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  // Vérifier propriété avant suppression (prévention IDOR)
  const { data: message } = await supabase
    .from(TABLES.contact_messages)
    .select("id, profile_id")
    .eq("id", id)
    .single();

  if (!message || message.profile_id !== user.id) {
    return NextResponse.json({ success: false, error: "Message introuvable." }, { status: 404 });
  }

  const { error } = await supabase
    .from(TABLES.contact_messages)
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ success: false, error: "Erreur lors de la suppression." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
