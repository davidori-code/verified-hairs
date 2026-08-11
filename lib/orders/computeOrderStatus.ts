type ItemStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

/**
 * Derives the buyer-facing overall order status from the individual
 * per-vendor item statuses. Kept as a small, pure function (no database
 * access) so it's easy to test and reason about on its own.
 */
export function computeOrderStatus(itemStatuses: ItemStatus[]): ItemStatus {
  if (itemStatuses.length === 0) {
    return "PENDING";
  }

  const allCancelled = itemStatuses.every((s) => s === "CANCELLED");
  if (allCancelled) {
    return "CANCELLED";
  }

  const allFinal = itemStatuses.every((s) => s === "DELIVERED" || s === "CANCELLED");
  if (allFinal) {
    // At least one DELIVERED (otherwise allCancelled would have caught it
    // above), and everything else is done too — treat the order as
    // complete even if a subset of items were cancelled.
    return "DELIVERED";
  }

  const anyConfirmed = itemStatuses.some((s) => s === "CONFIRMED" || s === "DELIVERED");
  if (anyConfirmed) {
    return "CONFIRMED";
  }

  return "PENDING";
}
