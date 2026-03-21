import {
  CahierDesChargesPDF,
  CertificatePDF,
  OnePagerPDF,
  PitchDeckPDF,
} from "@/lib/pdf/templates";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import React from "react";

const ALLOWED_TYPES = ["pitch_deck", "one_pager", "cahier_charges", "certificate"] as const;
type ExportType = (typeof ALLOWED_TYPES)[number];

function isAllowedType(type: string): type is ExportType {
  return (ALLOWED_TYPES as readonly string[]).includes(type);
}

function formatDateSlug(): string {
  return new Date().toISOString().slice(0, 10);
}

function validateFields(
  data: Record<string, unknown>,
  required: string[]
): string | null {
  for (const field of required) {
    if (!data[field] && data[field] !== 0) {
      return `Champ requis manquant : "${field}"`;
    }
  }
  return null;
}

// POST /api/project-builder/export — Generate and download a PDF document
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !isAllowedType(type)) {
      return NextResponse.json(
        {
          error: `Type invalide. Types autorisés : ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Données manquantes." },
        { status: 400 }
      );
    }

    let pdfElement: React.ReactElement;

    switch (type) {
      case "pitch_deck": {
        const err = validateFields(data, ["slides", "projectName", "tagline"]);
        if (err) return NextResponse.json({ error: err }, { status: 400 });
        if (!Array.isArray(data.slides) || data.slides.length === 0) {
          return NextResponse.json(
            { error: "Le champ « slides » doit être un tableau non vide." },
            { status: 400 }
          );
        }
        pdfElement = React.createElement(PitchDeckPDF, {
          slides: data.slides,
          projectName: data.projectName,
          tagline: data.tagline,
        });
        break;
      }

      case "one_pager": {
        const err = validateFields(data, [
          "projectName",
          "tagline",
          "problem",
          "solution",
          "market",
          "model",
          "team",
          "ask",
        ]);
        if (err) return NextResponse.json({ error: err }, { status: 400 });
        pdfElement = React.createElement(OnePagerPDF, {
          projectName: data.projectName,
          tagline: data.tagline,
          problem: data.problem,
          solution: data.solution,
          market: data.market,
          model: data.model,
          team: data.team,
          ask: data.ask,
        });
        break;
      }

      case "cahier_charges": {
        const err = validateFields(data, ["projectName", "content"]);
        if (err) return NextResponse.json({ error: err }, { status: 400 });
        pdfElement = React.createElement(CahierDesChargesPDF, {
          projectName: data.projectName,
          content: data.content,
        });
        break;
      }

      case "certificate": {
        const err = validateFields(data, [
          "projectName",
          "hash",
          "timestamp",
          "ownerName",
        ]);
        if (err) return NextResponse.json({ error: err }, { status: 400 });
        pdfElement = React.createElement(CertificatePDF, {
          projectName: data.projectName,
          hash: data.hash,
          timestamp: data.timestamp,
          ownerName: data.ownerName,
        });
        break;
      }
    }

    const buffer = await renderToBuffer(
      pdfElement as Parameters<typeof renderToBuffer>[0]
    );
    const uint8 = new Uint8Array(buffer);

    const filename = `ivoire-io-${type.replace(/_/g, "-")}-${formatDateSlug()}.pdf`;

    return new Response(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF." },
      { status: 500 }
    );
  }
}
