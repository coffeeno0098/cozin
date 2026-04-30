import { describe, expect, it } from "vitest";

import { getStockStatus, LOW_STOCK_THRESHOLD } from "@/lib/admin-dashboard";

describe("getStockStatus", () => {
  it("marks zero or negative stock as out", () => {
    expect(getStockStatus(0)).toBe("out");
    expect(getStockStatus(-1)).toBe("out");
  });

  it("marks stock at the threshold as low", () => {
    expect(getStockStatus(1)).toBe("low");
    expect(getStockStatus(LOW_STOCK_THRESHOLD)).toBe("low");
  });

  it("marks stock above the threshold as healthy", () => {
    expect(getStockStatus(LOW_STOCK_THRESHOLD + 1)).toBe("healthy");
  });
});
