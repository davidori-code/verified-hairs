"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CancelOrderButtonProps {
  orderId: string;
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not cancel order.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setIsSubmitting(false);
      setIsConfirming(false);
    }
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <span className="text-xs text-ink/70">Cancel this order?</span>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="rounded-xl bg-red-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
        >
          {isSubmitting ? "Cancelling..." : "Yes, cancel"}
        </button>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          disabled={isSubmitting}
          className="rounded-xl border border-stone-300 px-2.5 py-1 text-xs text-ink hover:bg-ivory"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      className="rounded-xl border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
    >
      Cancel Order
    </button>
  );
}
