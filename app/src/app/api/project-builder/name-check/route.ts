import { verifyOAPIName } from "@/lib/ai/anthropic";
import { checkAIRateLimit } from "@/lib/plan-guard";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/project-builder/name-check — Check name availability (OAPI / RCCM)
export async function POST(request: Request) {
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
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Le nom est requis." },
        { status: 400 }
      );
    }

    const result = await verifyOAPIName(name);

    return NextResponse.json({
      success: true,
      data: {
        available: result.available,
        risques: result.risques,
        sources: result.sources,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
