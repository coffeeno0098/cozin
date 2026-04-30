import { isRetryableTrueMoneyFailure } from "@/lib/truemoney";

type ExistingPayment = {
  userId: string;
  status: "pending" | "verified" | "rejected";
  rawResponse: unknown;
};

export type ExistingPaymentDecision =
  | { action: "create" }
  | { action: "retry" }
  | { action: "reject"; error: "processing" | "duplicate" };

export function decideExistingTopupPayment(
  existingPayment: ExistingPayment | null | undefined,
  currentUserId: string,
): ExistingPaymentDecision {
  if (!existingPayment) {
    return { action: "create" };
  }

  if (existingPayment.status === "pending") {
    return { action: "reject", error: "processing" };
  }

  if (existingPayment.status === "verified" || existingPayment.userId !== currentUserId) {
    return { action: "reject", error: "duplicate" };
  }

  if (!isRetryableTrueMoneyFailure(existingPayment.rawResponse)) {
    return { action: "reject", error: "duplicate" };
  }

  return { action: "retry" };
}
