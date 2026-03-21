import { generateLogos, getTaskStatus } from "@/lib/ai/crunai";
import { checkAIRateLimit } from "@/lib/plan-guard";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/project-builder/logo — Generate logo variations
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
    const { projectName, sector, country, style, colors } = body;

    if (!projectName || !sector) {
      return NextResponse.json(
        { error: "projectName et sector sont requis." },
        { status: 400 }
      );
    }

    const tasks = await generateLogos(
      projectName,
      sector,
      country || "Côte d'Ivoire",
      style,
      colors
    );

    return NextResponse.json({
      success: true,
      data: { tasks },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// GET /api/project-builder/logo — Check status of logo generation tasks
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const taskIds = searchParams.get("taskIds");

    if (!taskIds) {
      return NextResponse.json(
        { error: "taskIds est requis (séparés par des virgules)." },
        { status: 400 }
      );
    }

    const ids = taskIds.split(",").map((id) => id.trim()).filter(Boolean);

    const results = await Promise.all(
      ids.map(async (taskId) => {
        const status = await getTaskStatus(taskId);
        return { taskId, ...status };
      })
    );

    return NextResponse.json({
      success: true,
      data: { results },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
