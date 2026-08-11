"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrderItemReceiveAndReviewProps {
  orderItemId: string;
  status: string;
  receivedByBuyer: boolean;
  hasReview: boolean;
}

export function OrderItemReceiveAndReview({
  orderItemId,
  status,
  receivedByBuyer,
  hasReview,
}: OrderItemReceiveAndReviewProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  async function handleMarkReceived() {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/orders/items/${orderItemId}/receive`, {
        method: "PATCH",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not mark as received.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitReview() {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId, rating, comment }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not submit review.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Only relevant once the vendor has actually marked the item delivered.
  if (status !== "DELIVERED") {
    return null;
  }

  if (hasReview) {
    return (
      <p className="mt-2 text-xs font-medium text-green-700">
        You reviewed this purchase.
      </p>
    );
  }

  if (!receivedByBuyer) {
    return (
      <div className="mt-2">
        {error && <p className="mb-1 text-xs text-red-600">{error}</p>}
        <button
          type="button"
          onClick={handleMarkReceived}
          disabled={isSubmitting}
          className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ivory disabled:opacity-50"
        >
          {isSubmitting ? "Updating..." : "Mark as Received"}
        </button>
      </div>
    );
  }

  if (!showReviewForm) {
    return (
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setShowReviewForm(true)}
          className="text-xs font-medium text-honey-dark underline"
        >
          Leave a review
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-chestnut/10 p-3">
      {error && <p className="text-xs text-red-600">{error}</p>}

      <div>
        <label htmlFor={`rating-${orderItemId}`} className="mb-1 block text-xs font-medium text-ink">
          Rating
        </label>
        <select
          id={`rating-${orderItemId}`}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          disabled={isSubmitting}
          className="rounded-xl border border-stone-300 px-2 py-1.5 text-sm"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`comment-${orderItemId}`} className="mb-1 block text-xs font-medium text-ink">
          Comment
        </label>
        <textarea
          id={`comment-${orderItemId}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="How was the product?"
          disabled={isSubmitting}
          className="block w-full rounded-xl border border-stone-300 px-3 py-2 text-sm text-jet shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmitReview}
        disabled={isSubmitting}
        className="rounded-full bg-jet px-3 py-1.5 text-xs font-semibold text-ivory hover:bg-chestnut disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}
