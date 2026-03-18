import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

function sanitizeUrl(raw: unknown): string | null {
  if (!raw || typeof raw !== "string" || raw.trim() === "") return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

type ValidatorResult = { value: unknown } | { error: string };

const FIELD_VALIDATORS: Record<string, (v: unknown) => ValidatorResult> = {
  full_name: (v) => {
    const s = typeof v === "string" ? v.trim() : "";
    if (s.length < 2 || s.length > 100) return { error: "Nom invalide (2-100 caractères)." };
    return { value: s };
  },
  title: (v) => ({ value: typeof v === "string" ? v.trim().slice(0, 100) || null : null }),
  city: (v) => ({ value: typeof v === "string" ? v.trim().slice(0, 50) || null : null }),
  bio: (v) => ({ value: typeof v === "string" ? v.trim().slice(0, 300) || null : null }),
  skills: (v) => ({
    value: Array.isArray(v)
      ? v.filter((s): s is string => typeof s === "string").map((s) => s.trim().slice(0, 50)).filter(Boolean).slice(0, 30)
      : [],
  }),
  is_available: (v) => ({ value: v === true }),
  github_url: (v) => ({ value: sanitizeUrl(v) }),
  linkedin_url: (v) => ({ value: sanitizeUrl(v) }),
  twitter_url: (v) => ({ value: sanitizeUrl(v) }),
  website_url: (v) => ({ value: sanitizeUrl(v) }),
};

// PATCH /api/dashboard/profile — mise à jour partielle du profil
// Accepte uniquement les champs modifiés, retourne uniquement les champs mis à jour
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

  const updates: Record<string, unknown> = {};
  const returnFields = ["id", "updated_at"];

  for (const [key, rawValue] of Object.entries(body)) {
    const validator = FIELD_VALIDATORS[key];
    if (!validator) continue;

    const result = validator(rawValue);
    if ("error" in result) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    updates[key] = result.value;
    returnFields.push(key);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: "Aucun champ à mettre à jour." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(TABLES.profiles)
    .update(updates)
    .eq("id", user.id)
    .select(returnFields.join(","))
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: "Erreur lors de la mise à jour." }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
