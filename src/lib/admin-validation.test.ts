import { describe, expect, it } from "vitest";

import { pointAdjustmentFormSchema } from "@/lib/admin-validation";

describe("pointAdjustmentFormSchema", () => {
  it("accepts positive and negative non-zero point adjustments with a reason", () => {
    expect(
      pointAdjustmentFormSchema.safeParse({
        userId: "3a6c545c-6672-4ab8-b87c-e1ff7ee1bd17",
        pointsDelta: "10",
        reason: "Customer support adjustment",
      }).success,
    ).toBe(true);

    expect(
      pointAdjustmentFormSchema.safeParse({
        userId: "3a6c545c-6672-4ab8-b87c-e1ff7ee1bd17",
        pointsDelta: "-5",
        reason: "Correction",
      }).success,
    ).toBe(true);
  });

  it("rejects zero point adjustments", () => {
    expect(
      pointAdjustmentFormSchema.safeParse({
        userId: "3a6c545c-6672-4ab8-b87c-e1ff7ee1bd17",
        pointsDelta: "0",
        reason: "No change",
      }).success,
    ).toBe(false);
  });

  it("requires a valid user id and reason", () => {
    expect(
      pointAdjustmentFormSchema.safeParse({
        userId: "not-a-uuid",
        pointsDelta: "10",
        reason: "ok",
      }).success,
    ).toBe(false);
  });
});
