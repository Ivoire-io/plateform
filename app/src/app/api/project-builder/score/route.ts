import { calculateProjectScore } from "@/lib/ai/score";
import { checkAIRateLimit } from "@/lib/plan-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/project-builder/score — Calculate the project score for the authenticated user
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // AI rate limiting
  const rateCheck = await checkAIRateLimit(user.id);
  if (!rateCheck.allowed) return rateCheck.response!;

  try {
    const { data: startup, error } = await supabaseAdmin
      .from(TABLES.startups)
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (error) throw error;

    if (!startup) {
      return NextResponse.json(
        { error: "Aucune startup trouvée." },
        { status: 404 }
      );
    }

    const scoreResult = calculateProjectScore(startup);

    return NextResponse.json({ success: true, data: scoreResult });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
