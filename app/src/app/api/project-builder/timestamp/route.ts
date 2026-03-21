import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

// POST /api/project-builder/timestamp — Generate a SHA-256 hash of the startup data
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    // Fetch the user's startup with all relevant fields
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

    // Serialize startup data as canonical JSON (keys sorted alphabetically)
    const sortedKeys = Object.keys(startup).sort();
    const canonical: Record<string, unknown> = {};
    for (const key of sortedKeys) {
      // Exclude metadata fields from the hash
      if (key === "timestamp_hash" || key === "finalized_at") continue;
      canonical[key] = startup[key];
    }
    const canonicalJson = JSON.stringify(canonical);

    // Generate SHA-256 hash
    const hash = createHash("sha256").update(canonicalJson).digest("hex");

    // Store the hash and finalization timestamp
    const { error: updateError } = await supabaseAdmin
      .from(TABLES.startups)
      .update({
        timestamp_hash: hash,
        finalized_at: new Date().toISOString(),
      })
      .eq("id", startup.id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      data: {
        hash,
        timestamp: new Date().toISOString(),
        projectName: startup.name || startup.project_name || "",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
