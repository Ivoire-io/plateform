import { supabaseAdmin } from "@/lib/supabase/admin";
import { TABLES } from "@/lib/utils";
import crypto from "crypto";

// ─── Cost rates per model ───────────────────────────────────────────────────────

const COST_RATES = {
  "gpt-4o-mini": { input_per_1m: 0.15, output_per_1m: 0.6 },
  "gpt-4o": { input_per_1m: 2.5, output_per_1m: 10.0 },
  "claude-sonnet-4-6": { input_per_1m: 3.0, output_per_1m: 15.0 },
  "claude-haiku-4-5": { input_per_1m: 0.8, output_per_1m: 4.0 },
  "nanobanana-pro": { per_image: 0.08 },
} as Record<
  string,
  { input_per_1m?: number; output_per_1m?: number; per_image?: number }
>;

const USD_TO_FCFA = 655;

// ─── Cache TTL (hours) per task type ────────────────────────────────────────────

const CACHE_TTL_HOURS: Record<string, number> = {
  tagline: 24,
  description_short: 24,
  description_long: 24,
  names: 24,
  personas: 48,
  interview_analysis: 24,
  pitch_deck: 72,
  cahier_charges: 72,
  business_plan: 72,
  one_pager: 72,
  roadmap: 48,
  cgu: 168,
  competitors: 72,
  oapi_check: 168,
  logo: 720,
};

// ─── Cost calculation ───────────────────────────────────────────────────────────

export function calculateCost(
  model: string,
  tokensInput: number,
  tokensOutput: number,
  imageCount?: number
): { usd: number; fcfa: number } {
  const rates = COST_RATES[model];
  if (!rates) return { usd: 0, fcfa: 0 };

  let usd: number;

  if (rates.per_image !== undefined) {
    usd = rates.per_image * (imageCount ?? 0);
  } else {
    usd =
      (tokensInput / 1_000_000) * (rates.input_per_1m ?? 0) +
      (tokensOutput / 1_000_000) * (rates.output_per_1m ?? 0);
  }

  return { usd, fcfa: Math.round(usd * USD_TO_FCFA) };
}

// ─── Track AI usage ─────────────────────────────────────────────────────────────

export async function trackAIUsage(params: {
  profileId: string;
  task: string;
  provider: string;
  model: string;
  tokensInput?: number;
  tokensOutput?: number;
  durationMs?: number;
  cached?: boolean;
  cacheKey?: string;
}): Promise<void> {
  const {
    profileId,
    task,
    provider,
    model,
    tokensInput = 0,
    tokensOutput = 0,
    durationMs,
    cached = false,
    cacheKey,
  } = params;

  const { usd, fcfa } = calculateCost(model, tokensInput, tokensOutput);

  supabaseAdmin
    .from(TABLES.ai_usage)
    .insert({
      profile_id: profileId,
      task,
      provider,
      model,
      tokens_input: tokensInput,
      tokens_output: tokensOutput,
      cost_usd: usd,
      cost_fcfa: fcfa,
      duration_ms: durationMs ?? null,
      cached,
      cache_key: cacheKey ?? null,
    })
    .then(({ error }) => {
      if (error) console.error("[trackAIUsage] insert failed:", error);
    });
}

// ─── Cache key generation ───────────────────────────────────────────────────────

export function generateCacheKey(
  task: string,
  inputs: Record<string, unknown>
): string {
  const sorted = JSON.stringify(inputs, Object.keys(inputs).sort());
  return crypto.createHash("sha256").update(`${task}:${sorted}`).digest("hex");
}

// ─── Get cached result ──────────────────────────────────────────────────────────

export async function getCachedResult(
  cacheKey: string
): Promise<unknown | null> {
  const { data, error } = await supabaseAdmin
    .from(TABLES.ai_cache)
    .select("id, result")
    .eq("cache_key", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;

  // Increment hits in the background (fire and forget)
  supabaseAdmin
    .rpc("increment_cache_hits", { row_id: data.id })
    .then(({ error: rpcError }) => {
      if (rpcError) {
        // Fallback: raw update if the RPC does not exist
        supabaseAdmin
          .from(TABLES.ai_cache)
          .update({ hits: (data as Record<string, unknown>).hits ? Number((data as Record<string, unknown>).hits) + 1 : 1 })
          .eq("id", data.id)
          .then(({ error: updateError }) => {
            if (updateError)
              console.error("[getCachedResult] increment hits failed:", updateError);
          });
      }
    });

  return data.result;
}

// ─── Set cached result ──────────────────────────────────────────────────────────

export async function setCachedResult(params: {
  cacheKey: string;
  task: string;
  profileId: string;
  inputHash: string;
  result: unknown;
  ttlHours?: number;
}): Promise<void> {
  const { cacheKey, task, profileId, inputHash, result, ttlHours } = params;

  const ttl = ttlHours ?? getCacheTTL(task);
  const expiresAt = new Date(Date.now() + ttl * 60 * 60 * 1000).toISOString();

  supabaseAdmin
    .from(TABLES.ai_cache)
    .upsert(
      {
        cache_key: cacheKey,
        task,
        profile_id: profileId,
        input_hash: inputHash,
        result,
        expires_at: expiresAt,
        hits: 0,
      },
      { onConflict: "cache_key" }
    )
    .then(({ error }) => {
      if (error) console.error("[setCachedResult] upsert failed:", error);
    });
}

// ─── Get cache TTL ──────────────────────────────────────────────────────────────

export function getCacheTTL(task: string): number {
  return CACHE_TTL_HOURS[task] ?? 24;
}
