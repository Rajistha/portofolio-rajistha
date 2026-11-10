// Best-effort in-memory limiter. On serverless each instance keeps its own
// counters, so this only blunts bursts from a single client — it is not a
// substitute for a shared store if abuse becomes a real problem.
const hits = new Map<string, { count: number; resetAt: number }>();

/** Returns true when the request is allowed, false when the limit is exceeded. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }

  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}
