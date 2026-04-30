import { describe, expect, it } from "vitest";

import { decideExistingTopupPayment } from "@/lib/topup-safety";

describe("decideExistingTopupPayment", () => {
  it("allows a new voucher payment when no matching payment exists", () => {
    expect(decideExistingTopupPayment(null, "user-1")).toEqual({ action: "create" });
  });

  it("blocks a voucher that is already being processed", () => {
    expect(
      decideExistingTopupPayment(
        {
          userId: "user-1",
          status: "pending",
          rawResponse: { note: "Waiting for TrueMoney verification" },
        },
        "user-1",
      ),
    ).toEqual({ action: "reject", error: "processing" });
  });

  it("blocks verified vouchers even for the same user", () => {
    expect(
      decideExistingTopupPayment(
        {
          userId: "user-1",
          status: "verified",
          rawResponse: { statusCode: 200 },
        },
        "user-1",
      ),
    ).toEqual({ action: "reject", error: "duplicate" });
  });

  it("blocks rejected vouchers from another user", () => {
    expect(
      decideExistingTopupPayment(
        {
          userId: "user-2",
          status: "rejected",
          rawResponse: { statusCode: 503 },
        },
        "user-1",
      ),
    ).toEqual({ action: "reject", error: "duplicate" });
  });

  it("allows same-user retries for temporary TrueMoney failures", () => {
    expect(
      decideExistingTopupPayment(
        {
          userId: "user-1",
          status: "rejected",
          rawResponse: { statusCode: 503 },
        },
        "user-1",
      ),
    ).toEqual({ action: "retry" });
  });

  it("blocks same-user retries for final TrueMoney business failures", () => {
    expect(
      decideExistingTopupPayment(
        {
          userId: "user-1",
          status: "rejected",
          rawResponse: { code: "VOUCHER_OUT_OF_STOCK", statusCode: 400 },
        },
        "user-1",
      ),
    ).toEqual({ action: "reject", error: "duplicate" });
  });
});
