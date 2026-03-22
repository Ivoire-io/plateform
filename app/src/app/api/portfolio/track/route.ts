import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Client admin (service_role) pour contourner le RLS sur l'insertion publique
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile_id, referrer, country_code, user_agent_hint } = body;

    if (!profile_id) {
      return NextResponse.json({ error: "profile_id requis" }, { status: 400 });
    }

    // Hash de l'IP pour détecter les visites uniques sans stocker les données brutes
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const ipHashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(ip + (process.env.TRACKING_SALT ?? "ivoire-io-salt"))
    );
    const ipHash = Array.from(new Uint8Array(ipHashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .substring(0, 32); // 32 chars suffisent pour l'unicité

    await supabaseAdmin.from("ivoireio_portfolio_views").insert({
      profile_id,
      visitor_ip_hash: ipHash,
      country_code: country_code ?? null,
      referrer: referrer ?? null,
      user_agent_hint: user_agent_hint ?? null,
    });

    // In-app notification for profile view (non-blocking, lazy import to keep tracking fast)
    import("@/lib/notifications").then(({ createNotification }) => {
      createNotification({
        profile_id,
        type: "profile_view",
        title: "Quelqu'un a visite ton portfolio",
        body: country_code ? `Visiteur depuis : ${country_code}` : undefined,
        link: "/dashboard/analytics",
        channels: ["inapp"],
      }).catch(() => { });
    }).catch(() => { });

    return NextResponse.json({ ok: true });
  } catch {
    // Silencieux — le tracking ne doit pas bloquer l'affichage du portfolio
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
