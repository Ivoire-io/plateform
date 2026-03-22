import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isValidSlug, RESERVED_SUBDOMAINS, TABLES } from "@/lib/utils";
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
  slug: (v) => {
    const s = typeof v === "string" ? v.toLowerCase().replace(/[^a-z0-9-]/g, "") : "";
    if (!isValidSlug(s)) return { error: "Sous-domaine invalide (3-30 caractères, lettres, chiffres, tirets)." };
    if (RESERVED_SUBDOMAINS.has(s)) return { error: "Ce sous-domaine est réservé." };
    return { value: s };
  },
  email: (v) => {
    const s = typeof v === "string" ? v.trim().toLowerCase() : "";
    if (!s) return { value: null };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return { error: "Email invalide." };
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
  onboarding_completed: (v) => ({ value: v === true }),
  github_url: (v) => ({ value: sanitizeUrl(v) }),
  linkedin_url: (v) => ({ value: sanitizeUrl(v) }),
  twitter_url: (v) => ({ value: sanitizeUrl(v) }),
  website_url: (v) => ({ value: sanitizeUrl(v) }),
  registration_extra: (v) => {
    if (v === null || v === undefined) return { value: null };
    if (typeof v !== "object" || Array.isArray(v)) return { error: "Format invalide pour registration_extra." };
    return { value: v };
  },
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

  // Check slug uniqueness if slug is being updated
  if (typeof updates.slug === "string") {
    const { data: existingSlug } = await supabaseAdmin
      .from(TABLES.profiles)
      .select("id")
      .eq("slug", updates.slug)
      .neq("id", user.id)
      .maybeSingle();
    if (existingSlug) {
      return NextResponse.json({ success: false, error: "Ce sous-domaine est déjà pris." }, { status: 409 });
    }
  }

  // Check email uniqueness if email is being updated
  if (typeof updates.email === "string") {
    const { data: existingEmail } = await supabaseAdmin
      .from(TABLES.profiles)
      .select("id")
      .eq("email", updates.email)
      .neq("id", user.id)
      .maybeSingle();
    if (existingEmail) {
      return NextResponse.json({ success: false, error: "Cet email est déjà utilisé." }, { status: 409 });
    }
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
