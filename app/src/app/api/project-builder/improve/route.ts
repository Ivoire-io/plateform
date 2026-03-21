import { improveTextClaude } from "@/lib/ai/anthropic";
import { checkAIRateLimit } from "@/lib/plan-guard";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/project-builder/improve — Improve text using AI (Claude)
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
    const { text, context } = body;

    if (!text) {
      return NextResponse.json({ error: "Le texte est requis." }, { status: 400 });
    }

    const result = await improveTextClaude(text, context || "startup ivoirienne");

    return NextResponse.json({ success: true, data: { improved: result } });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
