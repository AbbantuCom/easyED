import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RateLimitedError } from '@/lib/errors';

interface WindowConfig {
  limit: number;
  windowSeconds: number;
}

let upstashLimiters: Map<string, Ratelimit> | null = null;

function getUpstashLimiter(name: string, config: WindowConfig): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  if (!upstashLimiters) upstashLimiters = new Map();
  const cached = upstashLimiters.get(name);
  if (cached) return cached;

  const limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(config.limit, `${config.windowSeconds} s`),
    prefix: `easyed:ratelimit:${name}`,
  });
  upstashLimiters.set(name, limiter);
  return limiter;
}

declare global {
  var _inProcessRateLimitStore: Map<string, number[]> | undefined;
}

function getInProcessStore(): Map<string, number[]> {
  if (!global._inProcessRateLimitStore) {
    global._inProcessRateLimitStore = new Map();
  }
  return global._inProcessRateLimitStore;
}

function checkInProcessLimit(
  key: string,
  config: WindowConfig,
): { success: boolean; retryAfterSeconds: number } {
  const store = getInProcessStore();
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const timestamps = (store.get(key) ?? []).filter((ts) => now - ts < windowMs);

  if (timestamps.length >= config.limit) {
    const oldestTs = timestamps[0];
    const retryAfterSeconds = Math.ceil((windowMs - (now - oldestTs)) / 1000);
    return { success: false, retryAfterSeconds };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { success: true, retryAfterSeconds: 0 };
}

export async function enforceRateLimit(
  name: string,
  identifier: string,
  config: WindowConfig,
): Promise<void> {
  const limiter = getUpstashLimiter(name, config);

  if (limiter) {
    const result = await limiter.limit(identifier);
    if (!result.success) {
      const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
      throw new RateLimitedError(retryAfterSeconds);
    }
    return;
  }

  const key = `${name}:${identifier}`;
  const result = checkInProcessLimit(key, config);
  if (!result.success) {
    throw new RateLimitedError(result.retryAfterSeconds);
  }
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
