import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/contact — envoie un message à un développeur
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile_id, sender_name, sender_email, message } = body;

    if (!profile_id || !sender_name || !sender_email || !message) {
      return NextResponse.json(
        { success: false, error: "Champs requis manquants." },
        { status: 400 }
      );
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sender_email)) {
      return NextResponse.json(
        { success: false, error: "Adresse email invalide." },
        { status: 400 }
      );
    }

    // Limiter la longueur du message
    if (message.trim().length < 10 || message.trim().length > 2000) {
      return NextResponse.json(
        { success: false, error: "Le message doit contenir entre 10 et 2000 caractères." },
        { status: 400 }
      );
    }

    // Récupérer le profil du destinataire
    const { data: profile, error: profileError } = await supabaseAdmin
      .from(TABLES.profiles)
      .select("id, full_name, email, slug")
      .eq("id", profile_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Profil introuvable." },
        { status: 404 }
      );
    }

    // Sauvegarder le message en base
    const { error: insertError } = await supabaseAdmin
      .from(TABLES.contact_messages)
      .insert({
        profile_id,
        sender_name: sender_name.trim(),
        sender_email: sender_email.toLowerCase().trim(),
        message: message.trim(),
      });

    if (insertError) throw insertError;

    // Envoyer un email de notification au développeur (non-bloquant)
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_xxxxxxxxxxxxxxxxxxxxxxxx") {
      await resend.emails.send({
        from: "ivoire.io <noreply@ivoire.io>",
        to: profile.email,
        subject: `[ivoire.io] Nouveau message de ${sender_name}`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #fff; padding: 40px; border-radius: 12px;">
            <h2 style="color: #FF6B00; margin-bottom: 8px;">Nouveau message sur ivoire.io</h2>
            <p style="color: #A0A0A0; margin-bottom: 24px;">Quelqu'un a envoyé un message via <strong>${profile.slug}.ivoire.io</strong></p>
            
            <div style="background: #0D1117; border: 1px solid #1A1A2E; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <p><strong>De :</strong> ${sender_name}</p>
              <p><strong>Email :</strong> ${sender_email}</p>
              <p style="margin-top: 16px; color: #A0A0A0;">${message.trim().replace(/\n/g, "<br>")}</p>
            </div>
            
            <p style="color: #A0A0A0; font-size: 12px;">Réponds directement à cet email pour contacter ${sender_name}.</p>
          </div>
        `,
        replyTo: sender_email,
      }).catch(() => { /* Email échoue silencieusement si Resend non configuré */ });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
