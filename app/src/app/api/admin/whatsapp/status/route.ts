import { adminGuard } from "@/lib/admin-guard";
import { NextResponse } from "next/server";

const WASENDER_BASE_URL = "https://app.wasenderapi.com/api";

// GET /api/admin/whatsapp/status — Check WaSender session status
export async function GET() {
  const guard = await adminGuard();
  if (!guard.authorized) return guard.response;

  const apiKey = process.env.WASENDER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      success: true,
      status: "not_configured",
      message: "WASENDER_API_KEY non configuree.",
    });
  }

  try {
    const res = await fetch(`${WASENDER_BASE_URL}/sessions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        status: "error",
        message: `WaSender API a repondu ${res.status}`,
        http_status: res.status,
      });
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      status: "connected",
      data,
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      status: "unreachable",
      message: err instanceof Error ? err.message : "Impossible de joindre WaSender",
    });
  }
}
