// Simple in-memory rate limiter per key (e.g., userId) using a sliding window
// Not durable across processes; suitable for basic dev/prototype protection
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = buckets.get(key) || [];
  const cutoff = now - windowMs;
  const recent = arr.filter((t) => t > cutoff);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  return true;
}
