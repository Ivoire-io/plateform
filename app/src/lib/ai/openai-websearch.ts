import OpenAI from "openai";
import { SYSTEM_CONTEXT } from "./openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Use the model configured for short text or fallback
const MODEL = process.env.OPENAI_MODEL_TEXT_SHORT || "gpt-4o-mini";

// ─── Analyse concurrentielle avec recherche web ───
export async function generateCompetitorAnalysisOpenAI(
  projectName: string,
  sector: string,
  country: string,
  problem: string
): Promise<string> {
  const prompt = `Fais une analyse concurrentielle complète pour la startup "${projectName}" (${sector}) en ${country}.
Problème résolu : ${problem}

Recherche les concurrents réels dans ce secteur en ${country} et en Afrique de l'Ouest. Utilise la recherche web pour trouver des informations actuelles.

Structure de l'analyse :
1. **Concurrents directs** — Entreprises résolvant le même problème dans la même zone
2. **Concurrents indirects** — Solutions alternatives utilisées actuellement
3. **Acteurs internationaux** — Entreprises étrangères présentes ou pouvant entrer sur le marché
4. **Matrice concurrentielle** — Tableau comparatif (fonctionnalités, prix, couverture, forces/faiblesses)
5. **Avantages concurrentiels potentiels** — Ce qui peut différencier "${projectName}"
6. **Recommandations stratégiques** — Positionnement recommandé

Cite tes sources quand c'est possible. Tous les prix en FCFA.

Réponds en markdown structuré.`;

  const response = await openai.responses.create({
    model: MODEL,
    tools: [{ type: "web_search_preview" }],
    input: [
      { role: "system", content: SYSTEM_CONTEXT },
      { role: "user", content: prompt },
    ],
  });

  return response.output_text;
}

// ─── Vérification de nom OAPI avec recherche web ───
export async function verifyOAPINameOpenAI(
  projectName: string
): Promise<{ available: boolean; risques: string[]; sources: string[] }> {
  const prompt = `Vérifie si le nom "${projectName}" est déjà utilisé ou enregistré :

1. Recherche dans les bases de l'OAPI (Organisation Africaine de la Propriété Intellectuelle) si une marque similaire existe
2. Recherche dans le RCCM (Registre du Commerce et du Crédit Mobilier) de Côte d'Ivoire
3. Vérifie les noms de domaine (.ci, .com, .io)
4. Recherche d'entreprises existantes avec ce nom en Côte d'Ivoire et en Afrique de l'Ouest

Réponds uniquement en JSON :
{
  "available": true/false,
  "risques": ["description de chaque risque identifié"],
  "sources": ["URL ou source de chaque information trouvée"]
}

Si tu ne trouves aucun conflit, indique available: true avec risques vide.
Si tu trouves des conflits potentiels, indique available: false avec les détails.`;

  const response = await openai.responses.create({
    model: MODEL,
    tools: [{ type: "web_search_preview" }],
    input: [
      { role: "system", content: SYSTEM_CONTEXT },
      { role: "user", content: prompt },
    ],
  });

  try {
    // Extract JSON from the response text (may be wrapped in markdown code blocks)
    const text = response.output_text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch {
    return { available: true, risques: [], sources: [] };
  }
}
