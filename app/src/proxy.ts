import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const RESERVED_SUBDOMAINS = new Set([
  "www", "mail", "api", "admin", "app", "devs", "startups",
  "jobs", "learn", "health", "data", "events", "invest",
  "blog", "docs", "status",
  "dashboard", "login", "auth", "logout",
]);

function getSubdomain(hostname: string): string | null {
  const cleanHost = hostname.replace(/:\d+$/, "");
  const parts = cleanHost.split(".");

  if (parts.length === 1) return null;

  // lvh.me pour le dev local
  if (cleanHost.endsWith("lvh.me")) {
    return parts.length >= 3 ? parts[0] : null;
  }

  // localhost pour le dev local (ulrich.localhost:3000)
  if (cleanHost.endsWith(".localhost")) {
    return parts[0];
  }

  // ivoire.io → 2 parts = pas de sous-domaine
  // slug.ivoire.io → 3 parts = sous-domaine
  if (parts.length >= 3) {
    const sub = parts[0];
    return sub === "www" ? null : sub;
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const subdomain = getSubdomain(hostname);

  // Refresh Supabase auth session
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  // Pas de sous-domaine → landing page (main)
  if (!subdomain) {
    return response;
  }

  // Sous-domaines réservés → rewrite vers la route dédiée
  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url, { request, headers: response.headers });
  }

  // Sinon, c'est un slug de portfolio → rewrite vers /portfolio/[slug]
  const url = request.nextUrl.clone();
  url.pathname = `/portfolio/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url, { request, headers: response.headers });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
