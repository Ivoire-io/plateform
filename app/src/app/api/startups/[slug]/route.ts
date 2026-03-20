import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

// GET /api/startups/[slug] — détail d'une startup
export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const { data, error } = await supabaseAdmin
      .from(TABLES.startups)
      .select("*, profile:ivoireio_profiles!profile_id(full_name, slug, avatar_url)")
      .eq("slug", slug)
      .eq("status", "approved")
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: "Startup introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
