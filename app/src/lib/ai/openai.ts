import OpenAI from "openai";

// ─── OpenAI Provider — GPT-5-4-mini ───
// Utilisé pour les textes courts, classification, suggestions rapides
// Modèle : gpt-5-4-mini (successeur de gpt-4o-mini, lancé mars 2026)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_TEXT_SHORT = process.env.OPENAI_MODEL_TEXT_SHORT || "gpt-4o-mini";

// System prompt commun — Contexte ivoire.io / Côte d'Ivoire
const SYSTEM_CONTEXT = `Tu es un assistant spécialisé dans l'accompagnement de startups en Côte d'Ivoire et en Afrique de l'Ouest.

Contexte :
- Plateforme : ivoire.io (écosystème startup ivoirien)
- Droit applicable : OHADA (Organisation pour l'Harmonisation du Droit des Affaires en Afrique)
- Monnaies : FCFA (XOF) en priorité, USD/EUR en secondaire
- Paiements locaux : Mobile Money (Orange Money, Wave, MTN MoMo)
- Langues : Français (principal)
- Marché cible primaire : Abidjan, puis Côte d'Ivoire entière, puis CEDEAO
- Réalités locales : fort taux de non-bancarisation (60%+), pénétration mobile élevée (85%+), marché majoritairement informel

Ton rôle : générer des contenus adaptés à cette réalité, pas des copies de modèles occidentaux transposés.
Réponds toujours en français.`;

// ─── Génération de texte court ───
export async function generateShortText(
  prompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    systemOverride?: string;
  }
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODEL_TEXT_SHORT,
    messages: [
      { role: "system", content: options?.systemOverride || SYSTEM_CONTEXT },
      { role: "user", content: prompt },
    ],
    max_tokens: options?.maxTokens ?? 500,
    temperature: options?.temperature ?? 0.7,
  });
  return response.choices[0]?.message?.content?.trim() ?? "";
}

// ─── Génération de taglines (multiples suggestions) ───
export async function generateTaglines(
  projectName: string,
  sector: string,
  description: string
): Promise<string[]> {
  const prompt = `Génère exactement 3 taglines percutantes pour une startup appelée "${projectName}" dans le secteur ${sector}.
Description du projet : ${description}

Règles :
- Max 80 caractères par tagline
- Ton professionnel mais accessible
- Adapté au marché ivoirien / africain
- Pas de clichés occidentaux

Réponds en JSON : {"taglines": ["...", "...", "..."]}`;

  const result = await generateShortText(prompt, { temperature: 0.8 });
  try {
    const parsed = JSON.parse(result);
    return parsed.taglines ?? [];
  } catch {
    return result.split("\n").filter(Boolean).slice(0, 3);
  }
}

// ─── Génération de description courte ───
export async function generateShortDescription(
  projectName: string,
  sector: string,
  problem: string
): Promise<string> {
  const prompt = `Génère une description courte (max 150 caractères) pour la startup "${projectName}" (secteur : ${sector}).
Problème résolu : ${problem}

La description doit être concise, claire et impactante. Une seule phrase.
Réponds uniquement avec la description, sans guillemets.`;

  return generateShortText(prompt, { maxTokens: 100 });
}

// ─── Amélioration de texte existant ───
export async function improveText(
  text: string,
  context: string
): Promise<string> {
  const prompt = `Améliore ce texte pour une startup ivoirienne. Contexte : ${context}

Texte original :
"${text}"

Règles :
- Garde le sens original
- Rends-le plus professionnel et impactant
- Adapté au contexte africain/ivoirien
- Même longueur approximative

Réponds uniquement avec le texte amélioré, sans guillemets.`;

  return generateShortText(prompt, { maxTokens: 600 });
}

// ─── Suggestion de formulation pour le problème ───
export async function suggestProblemStatement(
  projectName: string,
  sector: string,
  description: string
): Promise<string> {
  const prompt = `Suggère une formulation percutante du problème résolu par la startup "${projectName}" (${sector}).
Description : ${description}

Règles :
- Une seule phrase claire et directe
- Max 150 caractères
- Commence par le problème concret des utilisateurs

Réponds uniquement avec la phrase.`;

  return generateShortText(prompt, { maxTokens: 100 });
}

// ─── Classification de fichier ───
export async function classifyFile(
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<{ category: string; confidence: number; reason: string }> {
  const prompt = `Analyse ce fichier et classe-le dans l'une des catégories suivantes :
logo | pitch_deck | business_plan | cahier_charges | charte_graphique | document_equipe | analyse_marche | document_juridique | autre

Fichier : "${fileName}"
Type : ${fileType}
Taille : ${(fileSize / 1024).toFixed(1)} Ko

Réponds uniquement en JSON : {"category": "...", "confidence": 0.0-1.0, "reason": "..."}`;

  const result = await generateShortText(prompt, { maxTokens: 100, temperature: 0.2 });
  try {
    return JSON.parse(result);
  } catch {
    return { category: "autre", confidence: 0.3, reason: "Classification automatique échouée" };
  }
}

// ─── Suggestions de noms de projet ───
export async function suggestProjectNames(
  idea: string,
  sector: string,
  country: string
): Promise<string[]> {
  const prompt = `Suggère 5 noms de startup courts et mémorables pour ce projet :
Idée : ${idea}
Secteur : ${sector}
Pays : ${country}

Règles :
- Noms courts (1-2 mots max)
- Faciles à prononcer en français et dans les langues locales
- Disponibles comme nom de domaine (.ci, .io)
- Modernes et tech

Réponds en JSON : {"names": ["...", "...", "...", "...", "..."]}`;

  const result = await generateShortText(prompt, { temperature: 0.9 });
  try {
    return JSON.parse(result).names ?? [];
  } catch {
    return result.split("\n").filter(Boolean).slice(0, 5);
  }
}

// ─── Génération de personas ───
export async function generatePersonas(
  projectName: string,
  sector: string,
  problem: string,
  country: string
): Promise<Array<{ name: string; age: string; profession: string; pain: string; goal: string }>> {
  const prompt = `Génère 3 personas cibles pour la startup "${projectName}" (${sector}) en ${country}.
Problème résolu : ${problem}

Pour chaque persona, donne :
- name: prénom typique ivoirien
- age: tranche d'âge
- profession: métier
- pain: frustration principale
- goal: ce qu'il/elle cherche

Réponds en JSON : {"personas": [{"name":"...","age":"...","profession":"...","pain":"...","goal":"..."}]}`;

  const result = await generateShortText(prompt, { maxTokens: 800, temperature: 0.7 });
  try {
    return JSON.parse(result).personas ?? [];
  } catch {
    return [];
  }
}

// ─── Entretien de découverte — Questions IA ───
export const INTERVIEW_QUESTIONS = [
  {
    key: "problem",
    question: "Quel problème concret ton projet résout-il ? Décris-le comme tu l'expliquerais à un ami.",
    field: "problem_statement",
  },
  {
    key: "target",
    question: "Qui est exactement la personne qui a ce problème ? Âge, situation, habitudes ?",
    field: "target_persona",
  },
  {
    key: "solution",
    question: "Comment ton projet résout ce problème ? Quelle est ta solution concrète ?",
    field: "solution",
  },
  {
    key: "revenue",
    question: "Comment tu comptes gagner de l'argent avec ce projet ?",
    field: "business_model",
  },
  {
    key: "competitors",
    question: "Qui fait déjà quelque chose de similaire en Côte d'Ivoire ou ailleurs ?",
    field: "known_competitors",
  },
  {
    key: "team",
    question: "Qui es-tu ? Quelle est ton expérience dans ce domaine ?",
    field: "founder_profile",
  },
  {
    key: "needs",
    question: "De quoi as-tu besoin pour avancer ? (Financement, développeurs, mentors...)",
    field: "current_needs",
  },
  {
    key: "assets",
    question: "As-tu déjà un nom, un domaine, une idée de logo ou d'autres éléments ?",
    field: "existing_assets",
  },
];

// ─── Analyse de réponse d'entretien (relance ou validation) ───
export async function analyzeInterviewResponse(
  question: string,
  answer: string,
  questionIndex: number
): Promise<{ validated: boolean; followUp?: string; summary: string }> {
  const prompt = `L'utilisateur répond à cette question dans le cadre de la création de sa startup :
Question : "${question}"
Réponse : "${answer}"

Analyse la réponse. Si elle est trop vague ou incomplète (moins de 10 mots utiles), génère une relance.
Si elle est suffisante, résume-la en une phrase.

Réponds en JSON : {"validated": true/false, "followUp": "question de relance si pas validé", "summary": "résumé si validé"}`;

  const result = await generateShortText(prompt, { maxTokens: 200, temperature: 0.3 });
  try {
    return JSON.parse(result);
  } catch {
    return { validated: true, summary: answer.substring(0, 200) };
  }
}

// ─── Génération de description longue ───
export async function generateLongDescription(
  projectName: string,
  sector: string,
  problem: string,
  solution: string,
  country: string
): Promise<string> {
  const prompt = `Génère une description longue (800-1000 caractères) pour la startup "${projectName}" (${sector}) en ${country}.

Problème : ${problem}
Solution : ${solution}

Structure :
1. Contexte du problème (2 phrases)
2. La solution proposée (2-3 phrases)
3. Impact et vision (1-2 phrases)

Ton : professionnel, inspirant, adapté au contexte ivoirien/africain.
Réponds uniquement avec le texte, sans guillemets.`;

  return generateShortText(prompt, { maxTokens: 600, temperature: 0.6 });
}

export { SYSTEM_CONTEXT };
