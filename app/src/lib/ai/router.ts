// ─── AI Router — Aiguillage des tâches vers le bon provider ───
// Mappe chaque type de tâche IA vers le provider approprié

export type AITask =
  | "tagline"
  | "description_short"
  | "description_long"
  | "names"
  | "personas"
  | "classification"
  | "improve_text"
  | "interview_analysis"
  | "pitch_deck"
  | "cahier_charges"
  | "business_plan"
  | "one_pager"
  | "roadmap"
  | "cgu"
  | "competitors"
  | "oapi_check"
  | "logo";

export type AIProvider = "openai" | "anthropic" | "crunai";

const TASK_PROVIDER_MAP: Record<AITask, AIProvider> = {
  // OpenAI — Textes courts, classification, suggestions rapides
  tagline: "openai",
  description_short: "openai",
  names: "openai",
  personas: "openai",
  classification: "openai",

  // Anthropic — Documents longs, analyses approfondies, génération structurée
  description_long: "anthropic",
  improve_text: "anthropic",
  interview_analysis: "anthropic",
  pitch_deck: "anthropic",
  cahier_charges: "anthropic",
  business_plan: "anthropic",
  one_pager: "anthropic",
  roadmap: "anthropic",
  cgu: "anthropic",
  // OpenAI — Recherche web (migré depuis Anthropic pour réduire les coûts)
  competitors: "openai",
  oapi_check: "openai",

  // crun.ai — Génération d'images (logos)
  logo: "crunai",
};

export function getProviderForTask(task: AITask): AIProvider {
  return TASK_PROVIDER_MAP[task];
}
