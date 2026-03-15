import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 Mo
const BUCKET = "ivoireio-avatars";

// POST /api/dashboard/avatar — upload avatar vers Supabase Storage
// Corps : multipart/form-data avec le champ "avatar"
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Requête invalide." }, { status: 400 });
  }

  const file = formData.get("avatar");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ success: false, error: "Fichier manquant." }, { status: 400 });
  }

  // Validation type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: "Type de fichier non autorisé (JPG, PNG, WebP ou GIF uniquement)." },
      { status: 400 }
    );
  }

  // Validation taille
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, error: "Le fichier dépasse la limite de 2 Mo." },
      { status: 400 }
    );
  }

  const buffer = await file.arrayBuffer();

  // Vérification magic bytes (header du fichier) — défense en profondeur contre le spoofing MIME
  const header = new Uint8Array(buffer.slice(0, 4));
  const isJpeg = header[0] === 0xff && header[1] === 0xd8;
  const isPng = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
  const isWebP = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46;
  const isGif = header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46;

  if (!isJpeg && !isPng && !isWebP && !isGif) {
    return NextResponse.json(
      { success: false, error: "Le contenu du fichier ne correspond pas à une image valide." },
      { status: 400 }
    );
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const storagePath = `${user.id}.${ext}`;

  // Upload via admin client (contourne les policies Storage)
  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error("[avatar upload]", uploadError);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'upload. Vérifiez que le bucket 'ivoireio-avatars' existe dans Supabase Storage." },
      { status: 500 }
    );
  }

  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);

  // Stocker l'URL propre en base (sans cache-buster)
  await supabase.from(TABLES.profiles).update({ avatar_url: publicUrl }).eq("id", user.id);

  // Retourner l'URL avec cache-buster au client pour affichage immédiat après upload
  return NextResponse.json({ success: true, url: `${publicUrl}?t=${Date.now()}` });
}
