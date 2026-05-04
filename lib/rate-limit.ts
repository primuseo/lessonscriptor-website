import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return redis;
}

type RateLimitConfig = {
  requests: number;
  window: `${number} s` | `${number} m` | `${number} h`;
};

const limiters = new Map<string, Ratelimit>();

function getLimiter(name: string, config: RateLimitConfig): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;

  const key = `${name}:${config.requests}:${config.window}`;
  if (limiters.has(key)) return limiters.get(key)!;

  const limiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: `rl:${name}`,
  });
  limiters.set(key, limiter);
  return limiter;
}

export async function checkRateLimit(
  name: string,
  config: RateLimitConfig,
  identifier: string
): Promise<{ success: boolean; headers: Record<string, string> }> {
  const limiter = getLimiter(name, config);

  // No Redis configured — allow all (dev mode)
  if (!limiter) {
    return { success: true, headers: {} };
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return {
    success,
    headers: {
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(reset),
    },
  };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
