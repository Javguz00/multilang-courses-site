// Simple in-memory rate limiter (per-process). Suitable for MVP and local testing.
// For production, use a distributed store (e.g., Redis) and robust libraries.

export type RateLimitOptions = {
  limit: number; // max requests
  windowMs: number; // time window in ms
};

type Bucket = {
  count: number;
  resetAt: number; // epoch ms
};

export function createRateLimiter(options: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();
  const { limit, windowMs } = options;

  function check(key: string) {
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || now > existing.resetAt) {
      // reset window
      const resetAt = now + windowMs;
      buckets.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt,
      };
    }

    if (existing.count < limit) {
      existing.count += 1;
      return {
        allowed: true,
        remaining: limit - existing.count,
        resetAt: existing.resetAt,
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  return { check };
}

// A default limiter: 5 requests per minute.
export const defaultRegisterLimiter = createRateLimiter({ limit: 5, windowMs: 60_000 });

// Convenience one-off function
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const limiter = createRateLimiter({ limit, windowMs });
  return limiter.check(key).allowed;
}
