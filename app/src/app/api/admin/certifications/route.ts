import { adminGuard } from "@/lib/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "pending";

  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLES.certifications)
    .select("*, profile:profile_id(full_name, slug, profile_type)")
    .eq("status", status)
    .order("submitted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const { certificationId, action } = await req.json() as {
    certificationId: string;
    action: "approve" | "reject";
  };

  const supabase = await createClient();

  const newStatus = action === "approve" ? "approved" : "rejected";

  const { data: cert, error: certErr } = await supabase
    .from(TABLES.certifications)
    .update({ status: newStatus, reviewed_by: guard.userId, reviewed_at: new Date().toISOString() })
    .eq("id", certificationId)
    .select("profile_id")
    .single();

  if (certErr || !cert) {
    return NextResponse.json({ error: "Certification not found" }, { status: 404 });
  }

  // Si approuvé, on met le badge sur le profil
  if (action === "approve") {
    await supabase
      .from(TABLES.profiles)
      .update({ verified_badge: true, updated_at: new Date().toISOString() })
      .eq("id", cert.profile_id);
  }

  await supabase.from(TABLES.admin_logs).insert({
    admin_id: guard.userId,
    action: `certification_${action}d`,
    target_type: "certification",
    target_id: certificationId,
  });

  return NextResponse.json({ success: true });
}
