import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// POST /api/startups/[slug]/upvote — voter pour une startup
export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    // Récupérer la startup
    const { data: startup, error: startupError } = await supabaseAdmin
      .from(TABLES.startups)
      .select("id")
      .eq("slug", slug)
      .eq("status", "approved")
      .single();

    if (startupError || !startup) {
      return NextResponse.json({ success: false, error: "Startup introuvable." }, { status: 404 });
    }

    // Hash IP pour privacy
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const ipHash = createHash("sha256").update(ip + process.env.SUPABASE_SERVICE_ROLE_KEY).digest("hex").slice(0, 16);

    // Vérifier si déjà voté aujourd'hui
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabaseAdmin
      .from(TABLES.startup_upvotes)
      .select("id")
      .eq("startup_id", startup.id)
      .eq("voter_ip_hash", ipHash)
      .eq("vote_date", today)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: false, error: "Tu as déjà voté aujourd'hui !" }, { status: 429 });
    }

    // Insérer le vote
    const { error: voteError } = await supabaseAdmin
      .from(TABLES.startup_upvotes)
      .insert({
        startup_id: startup.id,
        voter_ip_hash: ipHash,
        vote_date: today,
      });

    if (voteError) throw voteError;

    // Mettre à jour le compteur
    const { count } = await supabaseAdmin
      .from(TABLES.startup_upvotes)
      .select("*", { count: "exact", head: true })
      .eq("startup_id", startup.id);

    await supabaseAdmin
      .from(TABLES.startups)
      .update({ upvotes_count: count ?? 0 })
      .eq("id", startup.id);

    return NextResponse.json({ success: true, upvotes: count ?? 0 });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
