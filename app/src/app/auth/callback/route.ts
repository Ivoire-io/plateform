import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/utils";
import { NextResponse } from "next/server";

// Supabase magic-link PKCE callback — échange le code contre une session
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Vérifie que le compte n'est pas suspendu avant d'accorder l'accès
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from(TABLES.profiles)
          .select("is_suspended")
          .eq("id", user.id)
          .single();

        if (profile?.is_suspended) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/login?error=account_suspended`
          );
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
