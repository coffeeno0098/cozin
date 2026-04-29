import { describe, expect, it } from "vitest";

import { extractTrueMoneyVoucherCode, getTrueMoneyMessage } from "@/lib/truemoney";

describe("extractTrueMoneyVoucherCode", () => {
  it("extracts the voucher code from a TrueMoney gift link", () => {
    expect(
      extractTrueMoneyVoucherCode("https://gift.truemoney.com/campaign/?v=019dda9e1baf7de9a511b66237f327f421u"),
    ).toBe("019dda9e1baf7de9a511b66237f327f421u");
  });

  it("accepts a raw voucher code", () => {
    expect(extractTrueMoneyVoucherCode("abc123XYZ")).toBe("abc123XYZ");
  });

  it("rejects non-TrueMoney hosts", () => {
    expect(extractTrueMoneyVoucherCode("https://example.com/campaign/?v=abc123")).toBeNull();
  });

  it("rejects unsafe voucher characters", () => {
    expect(extractTrueMoneyVoucherCode("https://gift.truemoney.com/campaign/?v=abc-123")).toBeNull();
  });
});

describe("getTrueMoneyMessage", () => {
  it("maps common TrueMoney error codes to customer-friendly messages", () => {
    expect(getTrueMoneyMessage("VOUCHER_NOT_FOUND")).toBe("TrueMoney gift link was not found.");
    expect(getTrueMoneyMessage("VOUCHER_EXPIRED")).toBe("This TrueMoney gift link has expired.");
  });

  it("uses the fallback message for unknown TrueMoney errors", () => {
    expect(getTrueMoneyMessage("UNKNOWN_CODE", "Custom TrueMoney error")).toBe("Custom TrueMoney error");
  });

  it("returns a generic message when no code or fallback is available", () => {
    expect(getTrueMoneyMessage()).toBe("TrueMoney could not verify this gift link.");
  });
});
