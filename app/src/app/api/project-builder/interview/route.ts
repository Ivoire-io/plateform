import { analyzeInterviewClaude } from "@/lib/ai/anthropic";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/project-builder/interview — Analyze an interview response (Claude)
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const { questionIndex, question, answer } = body;

    if (questionIndex === undefined || !question || !answer) {
      return NextResponse.json({ error: "questionIndex, question et answer sont requis." }, { status: 400 });
    }

    const result = await analyzeInterviewClaude(question, answer, questionIndex);

    return NextResponse.json({
      success: true,
      data: {
        validated: result.validated,
        followUp: result.followUp,
        summary: result.summary,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
