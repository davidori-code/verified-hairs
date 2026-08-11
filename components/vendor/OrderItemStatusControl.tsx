"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statusOptions = ["CONFIRMED", "DELIVERED", "CANCELLED"] as const;

interface OrderItemStatusControlProps {
  orderItemId: string;
  currentStatus: string;
}

export function OrderItemStatusControl({
  orderItemId,
  currentStatus,
}: OrderItemStatusControlProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(newStatus: string) {
    setError(null);
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/vendor/orders/${orderItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not update status.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setIsUpdating(false);
    }
  }

  // Once an item is DELIVERED or CANCELLED, treat it as final — no more
  // status changes. This is a light guardrail, not a full state machine,
  // but it stops obviously wrong actions like "un-delivering" something.
  const isFinal = currentStatus === "DELIVERED" || currentStatus === "CANCELLED";

  if (isFinal) {
    return null;
  }

  return (
    <div>
      {error && <p className="mb-1 text-xs text-rose-600">{error}</p>}
      <select
        value=""
        onChange={(e) => {
          if (e.target.value) handleChange(e.target.value);
        }}
        disabled={isUpdating}
        className="rounded-lg border border-stone-300 px-2 py-1.5 text-xs text-stone-700 disabled:opacity-50"
      >
        <option value="">
          {isUpdating ? "Updating..." : "Update status..."}
        </option>
        {statusOptions
          .filter((status) => status !== currentStatus)
          .map((status) => (
            <option key={status} value={status}>
              Mark as {status}
            </option>
          ))}
      </select>
    </div>
  );
}
