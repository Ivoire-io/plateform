import { checkAIRateLimit } from "@/lib/plan-guard";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/dashboard/dev-requests/[id]/suggest-roles — IA suggère les rôles
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // AI rate limiting
  const rateCheck = await checkAIRateLimit(user.id);
  if (!rateCheck.allowed) return rateCheck.response!;

  try {
    const body = await request.json();
    const { cahier_charges } = body;

    if (!cahier_charges || typeof cahier_charges !== "string") {
      return NextResponse.json(
        { error: "Le cahier des charges est requis." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Analyse ce cahier des charges technique et liste les roles techniques necessaires pour realiser ce projet.

Cahier des charges :
"""
${cahier_charges}
"""

Pour chaque role, indique :
- role: le type de poste (frontend, backend, fullstack, mobile, devops, design, data, project_manager)
- justification: pourquoi ce role est necessaire (1 phrase)
- seniority: junior, mid, senior
- estimated_days: nombre de jours estimes

Reponds uniquement en JSON : [{"role": "...", "justification": "...", "seniority": "...", "estimated_days": ...}]`,
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content || "[]";

    // Extraire le JSON de la réponse (peut être entouré de markdown)
    let jsonStr = content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const roles = JSON.parse(jsonStr);

    return NextResponse.json({ roles });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'analyse IA." },
      { status: 500 }
    );
  }
}
