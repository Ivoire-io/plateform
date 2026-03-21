import { classifyFile } from "@/lib/ai/openai";
import { checkAIRateLimit } from "@/lib/plan-guard";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/project-builder/classify — Classify a file using AI
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
    const { fileName, fileType, fileSize } = body;

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "fileName et fileType sont requis." }, { status: 400 });
    }

    const classification = await classifyFile(fileName, fileType, fileSize || 0);

    return NextResponse.json({ success: true, data: classification });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
