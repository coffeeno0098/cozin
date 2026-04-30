import { headers } from "next/headers";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export const rateLimitWindows = {
  login: { limit: 10, windowMs: 5 * 60 * 1000 },
  register: { limit: 5, windowMs: 10 * 60 * 1000 },
  topup: { limit: 8, windowMs: 10 * 60 * 1000 },
  purchase: { limit: 40, windowMs: 60 * 1000 },
} satisfies Record<string, RateLimitOptions>;

export function checkRateLimit(key: string, options: RateLimitOptions, now = Date.now()): RateLimitResult {
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + options.windowMs;
    store.set(key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      remaining: options.limit - 1,
      retryAfterSeconds: 0,
      resetAt,
    };
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
      resetAt: current.resetAt,
    };
  }

  current.count += 1;

  return {
    allowed: true,
    remaining: options.limit - current.count,
    retryAfterSeconds: 0,
    resetAt: current.resetAt,
  };
}

export function resetRateLimitStore() {
  store.clear();
}

export function getClientIpFromHeaders(headerList: Headers) {
  const forwardedFor = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headerList.get("x-real-ip")?.trim();
  const cfIp = headerList.get("cf-connecting-ip")?.trim();

  return forwardedFor || realIp || cfIp || "unknown";
}

export async function buildRateLimitKey(scope: string, ...parts: Array<string | null | undefined>) {
  const headerList = await headers();
  const ip = getClientIpFromHeaders(headerList);
  const normalizedParts = parts.map((part) => part?.trim().toLowerCase()).filter(Boolean);

  return [scope, ip, ...normalizedParts].join(":");
}
