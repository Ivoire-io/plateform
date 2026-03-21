import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 Mo
const BUCKET = "ivoireio-fundraising-docs";
const VALID_DOC_TYPES = ["pitch_deck", "business_plan", "one_pager"] as const;

// POST /api/dashboard/fundraising/documents — uploader un document de levée
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const { data: startup } = await supabase
    .from(TABLES.startups)
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!startup) {
    return NextResponse.json({ success: false, error: "Startup introuvable." }, { status: 404 });
  }

  // Trouver le fundraising de la startup
  const { data: fundraising } = await supabase
    .from(TABLES.fundraising)
    .select("id")
    .eq("startup_id", startup.id)
    .maybeSingle();

  if (!fundraising) {
    return NextResponse.json({ success: false, error: "Aucune levée de fonds configurée." }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Requête invalide." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ success: false, error: "Fichier manquant." }, { status: 400 });
  }

  const docType = formData.get("doc_type");
  if (!docType || typeof docType !== "string" || !VALID_DOC_TYPES.includes(docType as typeof VALID_DOC_TYPES[number])) {
    return NextResponse.json({ success: false, error: "Type de document invalide (pitch_deck, business_plan, one_pager)." }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ success: false, error: "Type de fichier non autorisé (PDF ou PowerPoint uniquement)." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ success: false, error: "Le fichier dépasse la limite de 20 Mo." }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const ext = file.name.split(".").pop() || "pdf";
  const path = `${startup.id}/${docType}_${Date.now()}.${ext}`;

  // Utiliser supabaseAdmin pour bypass RLS sur le storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ success: false, error: "Erreur lors de l'upload." }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  // Enregistrer le document en base
  const { data, error: dbError } = await supabase
    .from(TABLES.fundraising_documents)
    .insert({
      fundraising_id: fundraising.id,
      doc_type: docType,
      file_name: file.name,
      file_url: publicUrl,
      file_path: path,
      file_size: file.size,
    })
    .select()
    .single();

  if (dbError) {
    // Nettoyer le fichier uploadé en cas d'erreur DB
    await supabaseAdmin.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ success: false, error: "Erreur lors de l'enregistrement." }, { status: 500 });
  }

  return NextResponse.json({ success: true, data }, { status: 201 });
}
