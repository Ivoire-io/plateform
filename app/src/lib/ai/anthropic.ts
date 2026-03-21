import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_CONTEXT } from "./openai";

// ─── Anthropic Provider — Claude ───
// Utilisé pour les documents longs, analyses approfondies, génération structurée
// Modèle : claude-sonnet-4-6 par défaut

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL_DOCUMENTS =
  process.env.ANTHROPIC_MODEL_DOCUMENTS || "claude-sonnet-4-6";

// ─── Génération de document long (fonction core) ───
export async function generateLongDocument(
  prompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
    systemOverride?: string;
  }
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL_DOCUMENTS,
    system: options?.systemOverride || SYSTEM_CONTEXT,
    max_tokens: options?.maxTokens ?? 4096,
    temperature: options?.temperature ?? 0.6,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text?.trim() ?? "";
}

// ─── Amélioration de texte via Claude ───
export async function improveTextClaude(
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

  return generateLongDocument(prompt, { maxTokens: 1000 });
}

// ─── Analyse de réponse d'entretien via Claude ───
export async function analyzeInterviewClaude(
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

  const result = await generateLongDocument(prompt, {
    maxTokens: 300,
    temperature: 0.3,
  });
  try {
    return JSON.parse(result);
  } catch {
    return { validated: true, summary: answer.substring(0, 200) };
  }
}

// ─── Type commun pour les données projet ───
interface ProjectData {
  name: string;
  sector: string;
  problem: string;
  solution: string;
  businessModel: string;
  country: string;
  teamInfo?: string;
}

// ─── Génération de Pitch Deck (10 slides) ───
export async function generatePitchDeck(
  projectData: ProjectData
): Promise<{
  slides: Array<{ title: string; content: string; notes: string }>;
}> {
  const prompt = `Génère un pitch deck de 10 slides pour la startup "${projectData.name}" (${projectData.sector}) en ${projectData.country}.

Données du projet :
- Problème : ${projectData.problem}
- Solution : ${projectData.solution}
- Modèle économique : ${projectData.businessModel}
${projectData.teamInfo ? `- Équipe : ${projectData.teamInfo}` : ""}

Structure des 10 slides :
1. Couverture — Nom, tagline, secteur
2. Problème — Le problème concret et son impact
3. Solution — Comment le projet résout ce problème
4. Démo — Fonctionnement concret du produit/service
5. Marché — Taille du marché (TAM/SAM/SOM) en FCFA
6. Modèle économique — Sources de revenus, pricing en FCFA
7. Concurrents — Positionnement vs alternatives existantes
8. Équipe — Fondateurs et compétences clés
9. Traction — Métriques actuelles ou projections réalistes
10. Ask — Ce que vous demandez (montant en FCFA, utilisation des fonds)

Pour chaque slide, fournis :
- title : titre de la slide
- content : contenu principal (texte structuré, bullet points)
- notes : notes du présentateur (ce qu'il doit dire)

Adapte tout au contexte ivoirien : FCFA, Mobile Money, OHADA, marché local.

Réponds uniquement en JSON : {"slides": [{"title": "...", "content": "...", "notes": "..."}, ...]}`;

  const result = await generateLongDocument(prompt, {
    maxTokens: 4096,
    temperature: 0.5,
  });
  try {
    return JSON.parse(result);
  } catch {
    return { slides: [] };
  }
}

// ─── Génération de Cahier des Charges ───
export async function generateCahierDesCharges(
  projectData: ProjectData
): Promise<string> {
  const prompt = `Génère un cahier des charges technique complet en markdown pour la startup "${projectData.name}" (${projectData.sector}) en ${projectData.country}.

Données du projet :
- Problème : ${projectData.problem}
- Solution : ${projectData.solution}
- Modèle économique : ${projectData.businessModel}
${projectData.teamInfo ? `- Équipe : ${projectData.teamInfo}` : ""}

Structure obligatoire (8 sections) :
1. **Présentation du projet** — Contexte, objectifs, périmètre
2. **Spécifications fonctionnelles** — Fonctionnalités détaillées par module
3. **Spécifications techniques** — Stack technique recommandée, architecture
4. **Design et UX** — Charte graphique, parcours utilisateur, responsive/mobile-first
5. **Intégrations** — APIs tierces (Mobile Money, SMS, etc.), services externes
6. **Sécurité et conformité** — RGPD, protection des données, OHADA
7. **Planning et livrables** — Phases de développement, jalons, critères d'acceptation
8. **Budget estimatif** — Estimation en FCFA par phase

Adapte tout au contexte ivoirien : intégration Mobile Money (Orange Money, Wave, MTN MoMo), infrastructure locale, connexions instables, mobile-first.

Réponds en markdown structuré.`;

  return generateLongDocument(prompt, { maxTokens: 4096, temperature: 0.4 });
}

// ─── Génération de Business Plan ───
export async function generateBusinessPlan(
  projectData: ProjectData
): Promise<string> {
  const prompt = `Génère un business plan complet pour la startup "${projectData.name}" (${projectData.sector}) en ${projectData.country}.

Données du projet :
- Problème : ${projectData.problem}
- Solution : ${projectData.solution}
- Modèle économique : ${projectData.businessModel}
${projectData.teamInfo ? `- Équipe : ${projectData.teamInfo}` : ""}

Contexte juridique et économique :
- Droit OHADA (forme juridique : SARL ou SAS simplifiée)
- Monnaie : FCFA (XOF)
- Paiements : Mobile Money (Orange Money, Wave, MTN MoMo)
- Marché : Côte d'Ivoire → CEDEAO → Afrique francophone

Structure du business plan :
1. **Résumé exécutif** — Vision, mission, proposition de valeur
2. **Analyse du marché** — Taille, tendances, segments cibles en Côte d'Ivoire
3. **Produit/Service** — Description détaillée, avantages concurrentiels
4. **Stratégie commerciale** — Acquisition, canaux de distribution, marketing
5. **Modèle économique** — Sources de revenus, pricing en FCFA, projections
6. **Plan opérationnel** — Organisation, processus, outils
7. **Projections financières** — P&L sur 3 ans en FCFA, point mort, besoins de financement
8. **Équipe et gouvernance** — Structure juridique OHADA, organigramme
9. **Analyse des risques** — Risques identifiés et stratégies de mitigation
10. **Plan de financement** — Sources (fonds propres, investisseurs, subventions), utilisation

Tous les montants doivent être en FCFA. Mentionne les réalités locales : non-bancarisation, Mobile Money, marché informel.

Réponds en markdown structuré.`;

  return generateLongDocument(prompt, { maxTokens: 4096, temperature: 0.5 });
}

// ─── Génération de One-Pager ───
export async function generateOnePager(
  projectData: ProjectData
): Promise<{
  sections: {
    title: string;
    problem: string;
    solution: string;
    market: string;
    model: string;
    team: string;
    ask: string;
  };
}> {
  const prompt = `Génère un one-pager (résumé exécutif A4) pour la startup "${projectData.name}" (${projectData.sector}) en ${projectData.country}.

Données du projet :
- Problème : ${projectData.problem}
- Solution : ${projectData.solution}
- Modèle économique : ${projectData.businessModel}
${projectData.teamInfo ? `- Équipe : ${projectData.teamInfo}` : ""}

Le one-pager doit tenir sur une page A4. Pour chaque section, sois concis et percutant.

Sections :
- title : Nom du projet + tagline (1 ligne)
- problem : Le problème en 2-3 phrases max
- solution : La solution en 2-3 phrases max
- market : Taille du marché cible en FCFA, segments
- model : Comment le projet gagne de l'argent (2-3 lignes, montants en FCFA)
- team : Fondateurs et compétences clés (2-3 lignes)
- ask : Ce que vous cherchez (montant en FCFA, type de partenariat)

Adapte au contexte ivoirien. Montants en FCFA.

Réponds uniquement en JSON : {"sections": {"title": "...", "problem": "...", "solution": "...", "market": "...", "model": "...", "team": "...", "ask": "..."}}`;

  const result = await generateLongDocument(prompt, {
    maxTokens: 2048,
    temperature: 0.5,
  });
  try {
    return JSON.parse(result);
  } catch {
    return {
      sections: {
        title: projectData.name,
        problem: projectData.problem,
        solution: projectData.solution,
        market: "",
        model: projectData.businessModel,
        team: projectData.teamInfo ?? "",
        ask: "",
      },
    };
  }
}

// ─── Génération de Roadmap 12 mois ───
export async function generateRoadmap(
  projectData: ProjectData
): Promise<
  Array<{
    month: number;
    label: string;
    milestones: string[];
  }>
> {
  const prompt = `Génère une roadmap sur 12 mois pour la startup "${projectData.name}" (${projectData.sector}) en ${projectData.country}.

Données du projet :
- Problème : ${projectData.problem}
- Solution : ${projectData.solution}
- Modèle économique : ${projectData.businessModel}

Pour chaque mois, fournis :
- month : numéro du mois (1-12)
- label : titre du mois (ex: "MVP & Tests", "Lancement Abidjan")
- milestones : liste de jalons concrets et mesurables

Phases typiques :
- Mois 1-3 : Validation, MVP, premiers utilisateurs
- Mois 4-6 : Lancement, acquisition, itération
- Mois 7-9 : Croissance, partenariats, expansion
- Mois 10-12 : Scale, levée de fonds, expansion régionale

Adapte au contexte ivoirien : réalités de développement local, adoption Mobile Money, partenariats telcos.

Réponds uniquement en JSON : [{"month": 1, "label": "...", "milestones": ["...", "..."]}, ...]`;

  const result = await generateLongDocument(prompt, {
    maxTokens: 2048,
    temperature: 0.5,
  });
  try {
    return JSON.parse(result);
  } catch {
    return [];
  }
}

// ─── Génération de CGU (Conditions Générales d'Utilisation) ───
export async function generateCGU(
  projectName: string,
  sector: string
): Promise<string> {
  const prompt = `Génère des Conditions Générales d'Utilisation (CGU) complètes pour la plateforme "${projectName}" (secteur : ${sector}).

Contexte juridique :
- Droit applicable : OHADA (Organisation pour l'Harmonisation du Droit des Affaires en Afrique)
- Juridiction : Tribunaux d'Abidjan, Côte d'Ivoire
- Régulation des données : Loi ivoirienne relative à la protection des données à caractère personnel
- ARTCI (Autorité de Régulation des Télécommunications de Côte d'Ivoire)

Sections obligatoires :
1. Objet et champ d'application
2. Définitions
3. Accès et inscription à la plateforme
4. Description des services
5. Obligations de l'utilisateur
6. Propriété intellectuelle
7. Protection des données personnelles (conforme à la loi ivoirienne)
8. Responsabilités et limitations
9. Paiements et tarification (FCFA, Mobile Money)
10. Résiliation et suspension
11. Modification des CGU
12. Droit applicable et juridiction compétente (OHADA)
13. Contact et réclamations

Rédige en français juridique clair et accessible. Adapte au contexte OHADA, pas au droit français/européen.

Réponds en markdown structuré.`;

  return generateLongDocument(prompt, { maxTokens: 4096, temperature: 0.2 });
}

// ─── Analyse concurrentielle (avec recherche web) ───
export async function generateCompetitorAnalysis(
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

  const response = await anthropic.messages.create({
    model: MODEL_DOCUMENTS,
    system: SYSTEM_CONTEXT,
    max_tokens: 4096,
    temperature: 0.4,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5,
      },
    ],
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text?.trim() ?? "";
}

// ─── Vérification de nom à l'OAPI / RCCM (avec recherche web) ───
export async function verifyOAPIName(
  projectName: string
): Promise<{
  available: boolean;
  risques: string[];
  sources: string[];
}> {
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

  const response = await anthropic.messages.create({
    model: MODEL_DOCUMENTS,
    system: SYSTEM_CONTEXT,
    max_tokens: 1000,
    temperature: 0.2,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 5,
      },
    ],
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const result = textBlock?.text?.trim() ?? "";
  try {
    return JSON.parse(result);
  } catch {
    return { available: true, risques: [], sources: [] };
  }
}
