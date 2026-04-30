import { describe, expect, it } from "vitest";

import {
  normalizeAdminSearch,
  parseAdminOrderStatus,
  parseAdminPaymentStatus,
} from "@/lib/admin-list-filters";

describe("admin list filters", () => {
  it("normalizes search text for admin list pages", () => {
    expect(normalizeAdminSearch("  coffeeno  ")).toBe("coffeeno");
    expect(normalizeAdminSearch("x".repeat(100))).toHaveLength(80);
    expect(normalizeAdminSearch(undefined)).toBe("");
  });

  it("accepts only known order statuses", () => {
    expect(parseAdminOrderStatus("fulfilled")).toBe("fulfilled");
    expect(parseAdminOrderStatus("pending")).toBeNull();
    expect(parseAdminOrderStatus(undefined)).toBeNull();
  });

  it("accepts only known payment statuses", () => {
    expect(parseAdminPaymentStatus("verified")).toBe("verified");
    expect(parseAdminPaymentStatus("fulfilled")).toBeNull();
    expect(parseAdminPaymentStatus(undefined)).toBeNull();
  });
});
