import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

const ALLOWED_URL_PROTOCOLS = ["https:"];

function sanitizeUrl(raw: unknown): string | null {
  if (!raw || typeof raw !== "string" || raw.trim() === "") return null;
  try {
    const url = new URL(raw.trim());
    if (!ALLOWED_URL_PROTOCOLS.includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

// PATCH /api/dashboard/profile — met à jour le profil de l'utilisateur connecté
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Corps de requête invalide." }, { status: 400 });
  }

  const fullName = typeof body.full_name === "string" ? body.full_name.trim() : null;
  if (!fullName || fullName.length < 2 || fullName.length > 100) {
    return NextResponse.json({ success: false, error: "Nom invalide (2-100 caractères)." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim().slice(0, 100) || null : null;
  const city = typeof body.city === "string" ? body.city.trim().slice(0, 50) || null : null;
  const bio = typeof body.bio === "string" ? body.bio.trim().slice(0, 300) || null : null;

  const skills = Array.isArray(body.skills)
    ? body.skills
      .filter((s): s is string => typeof s === "string")
      .map((s) => s.trim().slice(0, 50))
      .filter(Boolean)
      .slice(0, 30)
    : [];

  const updates = {
    full_name: fullName,
    title,
    city,
    bio,
    skills,
    is_available: body.is_available === true || body.is_available === false ? body.is_available : true,
    github_url: sanitizeUrl(body.github_url),
    linkedin_url: sanitizeUrl(body.linkedin_url),
    twitter_url: sanitizeUrl(body.twitter_url),
    website_url: sanitizeUrl(body.website_url),
  };

  // La RLS (`auth.uid() = id`) garantit que l'utilisateur ne peut mettre à jour que son propre profil
  const { data, error } = await supabase
    .from(TABLES.profiles)
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour." }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
