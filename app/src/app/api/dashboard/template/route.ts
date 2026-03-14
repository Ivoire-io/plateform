import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

const ALLOWED_TEMPLATE_IDS = [
  "minimal-dark",
  "classic-light",
  "terminal",
  "glassmorphism",
  "bento-grid",
  "gradient",
  "spotlight",
  "neon-cyber",
  "brutalist",
  "ivoirien",
];

const PREMIUM_TEMPLATE_IDS = new Set([
  "glassmorphism",
  "bento-grid",
  "gradient",
  "spotlight",
  "neon-cyber",
  "brutalist",
  "ivoirien",
]);

// GET /api/dashboard/template — récupérer le template actif
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from(TABLES.profiles)
    .select("template_id, plan")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    success: true,
    template_id: profile?.template_id ?? "minimal-dark",
    plan: profile?.plan ?? "free",
  });
}

// PUT /api/dashboard/template — changer de template
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

  const templateId = body.template_id;
  if (typeof templateId !== "string" || !ALLOWED_TEMPLATE_IDS.includes(templateId)) {
    return NextResponse.json({ success: false, error: "Template invalide." }, { status: 400 });
  }

  // Vérifier plan si template premium
  if (PREMIUM_TEMPLATE_IDS.has(templateId)) {
    const { data: profile } = await supabase
      .from(TABLES.profiles)
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!profile || profile.plan === "free") {
      return NextResponse.json(
        { success: false, error: "Ce template nécessite un plan Premium." },
        { status: 403 }
      );
    }
  }

  const { error } = await supabase
    .from(TABLES.profiles)
    .update({ template_id: templateId })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ success: false, error: "Erreur lors du changement de template." }, { status: 500 });
  }

  return NextResponse.json({ success: true, template_id: templateId });
}
