import {
  generateBusinessPlan,
  generateCahierDesCharges,
  generateCGU,
  generateCompetitorAnalysis,
  generateLongDocument,
  generateOnePager,
  generatePitchDeck,
  generateRoadmap,
} from "@/lib/ai/anthropic";
import {
  generatePersonas,
  generateShortDescription,
  generateTaglines,
  suggestProblemStatement,
  suggestProjectNames,
} from "@/lib/ai/openai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST /api/project-builder/generate — Generate AI content for a project
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const { type, projectName, sector, description, problem, solution, country } = body;

    let result: unknown;

    switch (type) {
      // ─── OpenAI — Textes courts, suggestions rapides ───
      case "tagline":
        result = await generateTaglines(projectName || "", sector || "", description || "");
        break;
      case "description_short":
        result = await generateShortDescription(projectName || "", sector || "", problem || description || "");
        break;
      case "problem":
        result = await suggestProblemStatement(projectName || "", sector || "", description || "");
        break;
      case "personas":
        result = await generatePersonas(projectName || "", sector || "", problem || description || "", country || "Côte d'Ivoire");
        break;
      case "names":
        result = await suggestProjectNames(description || "", sector || "", country || "Côte d'Ivoire");
        break;

      // ─── Anthropic (Claude) — Documents longs, génération structurée ───
      case "description_long": {
        const descPrompt = `Génère une description longue et détaillée (1500-2500 caractères) pour la startup "${projectName || ""}" (secteur : ${sector || ""}) en ${country || "Côte d'Ivoire"}.

Problème : ${problem || ""}
Solution : ${solution || ""}

Structure attendue :
1. Contexte et ampleur du problème (3-4 phrases avec données chiffrées si possible)
2. La solution proposée et comment elle fonctionne (3-4 phrases)
3. Proposition de valeur unique et avantages compétitifs (2-3 phrases)
4. Impact social et économique attendu (2-3 phrases)
5. Vision à long terme (1-2 phrases)

Ton : professionnel, inspirant, ancré dans la réalité ivoirienne/africaine.
Réponds uniquement avec le texte, sans guillemets ni titre.`;
        result = await generateLongDocument(descPrompt, { maxTokens: 2048, temperature: 0.6 });
        break;
      }
      case "pitch_deck": {
        const projectData = {
          name: projectName || "",
          sector: sector || "",
          problem: problem || "",
          solution: solution || "",
          businessModel: "",
          country: country || "Côte d'Ivoire",
        };
        result = await generatePitchDeck(projectData);
        break;
      }
      case "cahier_charges": {
        const projectData = {
          name: projectName || "",
          sector: sector || "",
          problem: problem || "",
          solution: solution || "",
          businessModel: "",
          country: country || "Côte d'Ivoire",
        };
        result = await generateCahierDesCharges(projectData);
        break;
      }
      case "business_plan": {
        const projectData = {
          name: projectName || "",
          sector: sector || "",
          problem: problem || "",
          solution: solution || "",
          businessModel: "",
          country: country || "Côte d'Ivoire",
        };
        result = await generateBusinessPlan(projectData);
        break;
      }
      case "one_pager": {
        const projectData = {
          name: projectName || "",
          sector: sector || "",
          problem: problem || "",
          solution: solution || "",
          businessModel: "",
          country: country || "Côte d'Ivoire",
        };
        result = await generateOnePager(projectData);
        break;
      }
      case "roadmap": {
        const projectData = {
          name: projectName || "",
          sector: sector || "",
          problem: problem || "",
          solution: solution || "",
          businessModel: "",
          country: country || "Côte d'Ivoire",
        };
        result = await generateRoadmap(projectData);
        break;
      }
      case "cgu":
        result = await generateCGU(projectName || "", sector || "");
        break;
      case "competitors":
        result = await generateCompetitorAnalysis(projectName || "", sector || "", country || "Côte d'Ivoire", problem || "");
        break;
      default:
        return NextResponse.json({ error: "Type de génération invalide." }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
