import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidSlug, RESERVED_SUBDOMAINS, TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.toLowerCase().replace(/[^a-z0-9-]/g, "") ?? "";

  if (!slug || slug.length < 3) {
    return NextResponse.json({ available: null, reason: "too_short" });
  }

  if (!isValidSlug(slug)) {
    return NextResponse.json({ available: false, reason: "invalid_format" });
  }

  if (RESERVED_SUBDOMAINS.has(slug)) {
    return NextResponse.json({ available: false, reason: "reserved" });
  }

  const [{ data: inWaitlist }, { data: inProfiles }] = await Promise.all([
    supabaseAdmin.from(TABLES.waitlist).select("id").eq("desired_slug", slug).maybeSingle(),
    supabaseAdmin.from(TABLES.profiles).select("id").eq("slug", slug).maybeSingle(),
  ]);

  if (inWaitlist || inProfiles) {
    return NextResponse.json({ available: false, reason: "taken" });
  }

  return NextResponse.json({ available: true });
}
