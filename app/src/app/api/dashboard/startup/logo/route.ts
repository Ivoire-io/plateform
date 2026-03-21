import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo
const BUCKET = "ivoireio-logos";

// POST /api/dashboard/startup/logo — Uploader le logo de la startup
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Requête invalide." }, { status: 400 });
  }

  const file = formData.get("logo");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ success: false, error: "Fichier manquant." }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ success: false, error: "Type de fichier non autorisé (JPG, PNG, WebP uniquement)." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ success: false, error: "Le fichier dépasse la limite de 5 Mo." }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();

  // Vérification magic bytes
  const header = new Uint8Array(buffer.slice(0, 4));
  const isJpeg = header[0] === 0xff && header[1] === 0xd8;
  const isPng = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
  const isWebP = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46;

  if (!isJpeg && !isPng && !isWebP) {
    return NextResponse.json({ success: false, error: "Le contenu du fichier ne correspond pas à une image valide." }, { status: 400 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/logo.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ success: false, error: "Erreur lors de l'upload." }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  const logoUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: dbError } = await supabaseAdmin
    .from(TABLES.startups)
    .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
    .eq("profile_id", user.id);

  if (dbError) {
    return NextResponse.json({ success: false, error: "Erreur mise à jour DB." }, { status: 500 });
  }

  return NextResponse.json({ success: true, logo_url: logoUrl });
}
