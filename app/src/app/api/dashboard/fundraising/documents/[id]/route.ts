import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

const BUCKET = "ivoireio-fundraising-docs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/dashboard/fundraising/documents/[id] — supprimer un document
export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  // Récupérer le document
  const { data: doc } = await supabase
    .from(TABLES.fundraising_documents)
    .select("id, fundraising_id, file_path")
    .eq("id", id)
    .single();

  if (!doc) {
    return NextResponse.json({ success: false, error: "Document introuvable." }, { status: 404 });
  }

  // Vérifier la chaîne de propriété : document → fundraising → startup → profile
  const { data: fundraising } = await supabase
    .from(TABLES.fundraising)
    .select("id, startup_id")
    .eq("id", doc.fundraising_id)
    .single();

  if (!fundraising) {
    return NextResponse.json({ success: false, error: "Document introuvable." }, { status: 404 });
  }

  const { data: startup } = await supabase
    .from(TABLES.startups)
    .select("id")
    .eq("id", fundraising.startup_id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!startup) {
    return NextResponse.json({ success: false, error: "Document introuvable." }, { status: 404 });
  }

  // Supprimer le fichier du storage
  if (doc.file_path) {
    await supabaseAdmin.storage.from(BUCKET).remove([doc.file_path]);
  }

  // Supprimer l'enregistrement en base
  const { error } = await supabase.from(TABLES.fundraising_documents).delete().eq("id", id);

  if (error) return NextResponse.json({ success: false, error: "Erreur lors de la suppression." }, { status: 500 });

  return NextResponse.json({ success: true });
}
