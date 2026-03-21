// ─── Score de complétude du projet ───
// Algorithme basé sur la spec PROJECT_BUILDER_SPEC

export interface ProjectScoreResult {
  global: number;
  identity: { score: number; items: Record<string, boolean | string> };
  vision: { score: number; items: Record<string, boolean | string> };
  technique: { score: number; items: Record<string, boolean | string> };
  financier: { score: number; items: Record<string, boolean | string> };
  protection: { score: number; items: Record<string, boolean | string> };
  status: "start" | "building" | "almost" | "ready" | "complete";
  statusLabel: string;
  statusColor: string;
}

interface ProjectData {
  name?: string;
  tagline?: string;
  logo_url?: string;
  domain_name?: string;
  description_short?: string;
  description?: string;
  problem_statement?: string;
  solution?: string;
  target_personas?: unknown[];
  competitors?: unknown[];
  business_model?: string;
  tech_stack?: string[];
  cahier_charges?: boolean;
  mvp_defined?: boolean;
  roadmap?: boolean;
  business_plan?: boolean;
  previsionnel?: boolean;
  one_pager?: boolean;
  timestamp_hash?: string;
  oapi_checked?: boolean;
  cgu?: boolean;
}

// Pondérations par catégorie
const WEIGHTS = {
  identity: 0.25,
  vision: 0.25,
  technique: 0.20,
  financier: 0.20,
  protection: 0.10,
};

// Points par élément dans chaque catégorie
const IDENTITY_POINTS: Record<string, number> = {
  name: 5,
  tagline: 5,
  logo: 8,
  domain: 5,
  description_short: 2,
};

const VISION_POINTS: Record<string, number> = {
  problem: 5,
  solution: 5,
  personas: 5,
  competitors: 5,
  business_model: 5,
};

const TECHNIQUE_POINTS: Record<string, number> = {
  cahier_charges: 10,
  mvp: 5,
  stack: 3,
  roadmap: 2,
};

const FINANCIER_POINTS: Record<string, number> = {
  business_plan: 8,
  previsionnel: 7,
  one_pager: 5,
};

const PROTECTION_POINTS: Record<string, number> = {
  timestamp: 5,
  oapi: 3,
  cgu: 2,
};

function calcCategoryScore(items: Record<string, boolean>, points: Record<string, number>): number {
  const total = Object.values(points).reduce((a, b) => a + b, 0);
  const earned = Object.entries(points).reduce((acc, [key, pts]) => {
    return acc + (items[key] ? pts : 0);
  }, 0);
  return Math.round((earned / total) * 100);
}

export function calculateProjectScore(data: ProjectData): ProjectScoreResult {
  // Déterminer la présence de chaque élément
  const identityItems: Record<string, boolean> = {
    name: !!data.name?.trim(),
    tagline: !!data.tagline?.trim(),
    logo: !!data.logo_url,
    domain: !!data.domain_name?.trim(),
    description_short: !!(data.description_short?.trim() || data.description?.trim()),
  };

  const visionItems: Record<string, boolean> = {
    problem: !!data.problem_statement?.trim(),
    solution: !!data.solution?.trim(),
    personas: !!(data.target_personas && data.target_personas.length > 0),
    competitors: !!(data.competitors && data.competitors.length > 0),
    business_model: !!data.business_model?.trim(),
  };

  const techniqueItems: Record<string, boolean> = {
    cahier_charges: !!data.cahier_charges,
    mvp: !!data.mvp_defined,
    stack: !!(data.tech_stack && data.tech_stack.length > 0),
    roadmap: !!data.roadmap,
  };

  const financierItems: Record<string, boolean> = {
    business_plan: !!data.business_plan,
    previsionnel: !!data.previsionnel,
    one_pager: !!data.one_pager,
  };

  const protectionItems: Record<string, boolean> = {
    timestamp: !!data.timestamp_hash,
    oapi: !!data.oapi_checked,
    cgu: !!data.cgu,
  };

  const identityScore = calcCategoryScore(identityItems, IDENTITY_POINTS);
  const visionScore = calcCategoryScore(visionItems, VISION_POINTS);
  const techniqueScore = calcCategoryScore(techniqueItems, TECHNIQUE_POINTS);
  const financierScore = calcCategoryScore(financierItems, FINANCIER_POINTS);
  const protectionScore = calcCategoryScore(protectionItems, PROTECTION_POINTS);

  const globalScore = Math.round(
    identityScore * WEIGHTS.identity +
    visionScore * WEIGHTS.vision +
    techniqueScore * WEIGHTS.technique +
    financierScore * WEIGHTS.financier +
    protectionScore * WEIGHTS.protection
  );

  // Déterminer le statut
  let status: ProjectScoreResult["status"];
  let statusLabel: string;
  let statusColor: string;

  if (globalScore <= 30) {
    status = "start";
    statusLabel = "Démarrage";
    statusColor = "#ef4444"; // red
  } else if (globalScore <= 59) {
    status = "building";
    statusLabel = "En construction";
    statusColor = "#f97316"; // orange
  } else if (globalScore <= 79) {
    status = "almost";
    statusLabel = "Presque prêt";
    statusColor = "#eab308"; // yellow
  } else if (globalScore <= 94) {
    status = "ready";
    statusLabel = "Prêt";
    statusColor = "#84cc16"; // lime
  } else {
    status = "complete";
    statusLabel = "Dossier complet";
    statusColor = "#22c55e"; // green
  }

  return {
    global: globalScore,
    identity: { score: identityScore, items: identityItems },
    vision: { score: visionScore, items: visionItems },
    technique: { score: techniqueScore, items: techniqueItems },
    financier: { score: financierScore, items: financierItems },
    protection: { score: protectionScore, items: protectionItems },
    status,
    statusLabel,
    statusColor,
  };
}
