import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// GET /api/dashboard/export — exporter les données de l'utilisateur au format JSON
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const [profileRes, projectsRes, experiencesRes, messagesRes] = await Promise.all([
    supabase.from(TABLES.profiles).select("*").eq("id", user.id).single(),
    supabase.from(TABLES.projects).select("*").eq("profile_id", user.id).order("sort_order"),
    supabase.from(TABLES.experiences).select("*").eq("profile_id", user.id).order("sort_order"),
    supabase.from(TABLES.contact_messages).select("*").eq("profile_id", user.id).order("created_at", { ascending: false }),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    profile: profileRes.data,
    projects: projectsRes.data ?? [],
    experiences: experiencesRes.data ?? [],
    messages: messagesRes.data ?? [],
  };

  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="ivoire-io-export.json"`,
    },
  });
}
