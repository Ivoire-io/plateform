// In-memory rate limiter — resets on server restart (acceptable for now)

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  userId: string,
  maxPerDay: number | null
): { allowed: boolean; remaining: number; resetAt: Date } {
  // If maxPerDay is null, unlimited
  if (maxPerDay === null) {
    return { allowed: true, remaining: Infinity, resetAt: new Date() };
  }

  const now = Date.now();
  const key = `ai:${userId}`;
  const entry = rateLimitMap.get(key);

  // If no entry or expired, create new
  if (!entry || now > entry.resetAt) {
    const resetAt = now + 24 * 60 * 60 * 1000; // 24h from now
    rateLimitMap.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxPerDay - 1, resetAt: new Date(resetAt) };
  }

  // Check if under limit
  if (entry.count < maxPerDay) {
    entry.count++;
    return { allowed: true, remaining: maxPerDay - entry.count, resetAt: new Date(entry.resetAt) };
  }

  // Rate limited
  return { allowed: false, remaining: 0, resetAt: new Date(entry.resetAt) };
}

// Cleanup old entries periodically (every 1h)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 60 * 60 * 1000);
