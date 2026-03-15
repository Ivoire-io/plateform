import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_LINK_TYPES = [
  "github",
  "linkedin",
  "twitter",
  "website",
  "project_github",
  "project_demo",
  "other",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, link_type, link_url } = body;

    if (!profile_id || !link_type) {
      return NextResponse.json(
        { error: "profile_id et link_type requis" },
        { status: 400 }
      );
    }

    if (!ALLOWED_LINK_TYPES.includes(link_type)) {
      return NextResponse.json({ error: "link_type invalide" }, { status: 400 });
    }

    await supabaseAdmin.from("ivoireio_link_clicks").insert({
      profile_id,
      link_type,
      link_url: link_url ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
