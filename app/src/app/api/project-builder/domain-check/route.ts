import { checkAIRateLimit } from "@/lib/plan-guard";
import { createClient } from "@/lib/supabase/server";
import dns from "dns/promises";
import { NextResponse } from "next/server";

// POST /api/project-builder/domain-check — Check domain availability
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // AI rate limiting
  const rateCheck = await checkAIRateLimit(user.id);
  if (!rateCheck.allowed) return rateCheck.response!;

  try {
    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json(
        { error: "Le domaine est requis." },
        { status: 400 }
      );
    }

    // Clean the domain (remove protocol, trailing slashes, etc.)
    const cleanDomain = domain
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "")
      .trim()
      .toLowerCase();

    let available = false;
    let registrar: string | undefined;

    // Strategy A: Use WHOIS API if configured
    const whoisApiKey = process.env.WHOIS_API_KEY;
    const whoisApiUrl = process.env.WHOIS_API_URL;

    if (whoisApiKey && whoisApiUrl) {
      try {
        const response = await fetch(`${whoisApiUrl}${cleanDomain}`, {
          headers: {
            Authorization: `Bearer ${whoisApiKey}`,
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Typical WHOIS API response patterns
          available = !data.registered && !data.domain_name;
          registrar = data.registrar || data.registrar_name;
        }
      } catch {
        // WHOIS API failed, fall through to DNS fallback
      }
    }

    // Strategy B: Fallback — DNS resolution check
    if (!whoisApiKey || !whoisApiUrl) {
      try {
        await dns.resolve(cleanDomain);
        // Domain resolves — likely taken
        available = false;
      } catch (dnsError: unknown) {
        // Domain does not resolve — might be available
        const code = (dnsError as { code?: string })?.code;
        if (code === "ENOTFOUND" || code === "ENODATA" || code === "SERVFAIL") {
          available = true;
        } else {
          // Other DNS errors — uncertain, report as unavailable
          available = false;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        domain: cleanDomain,
        available,
        ...(registrar ? { registrar } : {}),
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
