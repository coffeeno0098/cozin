import { describe, expect, it } from "vitest";

import { sanitizeAuditMetadata } from "@/lib/admin-audit";

describe("sanitizeAuditMetadata", () => {
  it("removes sensitive metadata keys", () => {
    expect(
      sanitizeAuditMetadata({
        gameAccountId: "player-1",
        gamePassword: "secret-password",
        apiToken: "token",
        nested: {
          voucherUrl: "https://gift.truemoney.com/campaign/?v=test",
          safe: "ok",
        },
      }),
    ).toEqual({
      gameAccountId: "player-1",
      nested: {
        safe: "ok",
      },
    });
  });

  it("returns null for non-object metadata", () => {
    expect(sanitizeAuditMetadata(null)).toBeNull();
    expect(sanitizeAuditMetadata("metadata")).toBeNull();
  });
});
