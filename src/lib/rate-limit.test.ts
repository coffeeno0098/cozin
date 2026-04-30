import { beforeEach, describe, expect, it } from "vitest";

import { checkRateLimit, resetRateLimitStore } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("allows requests under the configured limit", () => {
    const options = { limit: 3, windowMs: 60_000 };

    expect(checkRateLimit("login:test", options, 1_000).allowed).toBe(true);
    expect(checkRateLimit("login:test", options, 2_000).allowed).toBe(true);
    expect(checkRateLimit("login:test", options, 3_000)).toMatchObject({
      allowed: true,
      remaining: 0,
    });
  });

  it("blocks requests over the configured limit until the window resets", () => {
    const options = { limit: 2, windowMs: 60_000 };

    checkRateLimit("topup:test", options, 1_000);
    checkRateLimit("topup:test", options, 2_000);

    expect(checkRateLimit("topup:test", options, 3_000)).toMatchObject({
      allowed: false,
      retryAfterSeconds: 58,
    });
    expect(checkRateLimit("topup:test", options, 61_000).allowed).toBe(true);
  });
});
