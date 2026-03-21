import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// POST — upload payment proof (image or PDF)
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const paymentId = formData.get("payment_id") as string | null;

  if (!file) {
    return NextResponse.json(
      { error: "Fichier requis" },
      { status: 400 }
    );
  }

  if (!paymentId) {
    return NextResponse.json(
      { error: "payment_id requis" },
      { status: 400 }
    );
  }

  // Validate file type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Format accepte : JPEG, PNG, WebP, PDF" },
      { status: 400 }
    );
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 5 Mo)" },
      { status: 400 }
    );
  }

  // Verify payment belongs to user
  const { data: payment } = await supabaseAdmin
    .from(TABLES.payments)
    .select("id, profile_id, status")
    .eq("id", paymentId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json(
      { error: "Paiement non trouve" },
      { status: 404 }
    );
  }

  // Upload to storage
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `${user.id}/${paymentId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from("ivoireio-payment-proofs")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Erreur upload: " + uploadError.message },
      { status: 500 }
    );
  }

  // Get public URL (private bucket, signed URL)
  const { data: signedUrl } = await supabaseAdmin.storage
    .from("ivoireio-payment-proofs")
    .createSignedUrl(filePath, 60 * 60 * 24 * 30); // 30 days

  // Update payment with proof
  await supabaseAdmin
    .from(TABLES.payments)
    .update({
      proof_url: signedUrl?.signedUrl || filePath,
      proof_file_name: file.name,
    })
    .eq("id", paymentId);

  return NextResponse.json({
    success: true,
    proof_url: signedUrl?.signedUrl || filePath,
    message:
      "Preuve de paiement uploadee. En attente de verification par l'equipe.",
  });
}
