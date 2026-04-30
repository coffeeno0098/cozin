const orderStatuses = ["paid", "fulfilled", "cancelled", "refunded"] as const;
const paymentStatuses = ["pending", "verified", "rejected"] as const;

export type AdminOrderStatus = (typeof orderStatuses)[number];
export type AdminPaymentStatus = (typeof paymentStatuses)[number];

export function normalizeAdminSearch(value: string | undefined) {
  const query = value?.trim() ?? "";
  return query.length > 80 ? query.slice(0, 80) : query;
}

export function parseAdminOrderStatus(value: string | undefined): AdminOrderStatus | null {
  if (orderStatuses.includes(value as AdminOrderStatus)) {
    return value as AdminOrderStatus;
  }

  return null;
}

export function parseAdminPaymentStatus(value: string | undefined): AdminPaymentStatus | null {
  if (paymentStatuses.includes(value as AdminPaymentStatus)) {
    return value as AdminPaymentStatus;
  }

  return null;
}
