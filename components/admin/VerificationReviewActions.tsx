"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface VerificationReviewActionsProps {
  verificationId: string;
}

export function VerificationReviewActions({
  verificationId,
}: VerificationReviewActionsProps) {
  const router = useRouter();
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendReview(body: object) {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/vendor-verifications/${verificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Action failed. Please try again.");
        return;
      }

      // Re-runs the server component fetch, so this row disappears from
      // the pending list once it's been reviewed.
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleApprove() {
    sendReview({ action: "APPROVE" });
  }

  function handleRejectSubmit() {
    if (rejectionReason.trim().length < 5) {
      setError("Please provide a reason (at least 5 characters)");
      return;
    }
    sendReview({ action: "REJECT", rejectionReason });
  }

  if (isRejecting) {
    return (
      <div className="mt-3 space-y-2">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Reason for rejection..."
          rows={2}
          className="block w-full rounded-xl border border-stone-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          disabled={isSubmitting}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRejectSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Confirm Rejection"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRejecting(false);
              setError(null);
            }}
            disabled={isSubmitting}
            className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ivory"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isSubmitting}
          className="rounded-xl bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
        >
          {isSubmitting ? "Working..." : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => setIsRejecting(true)}
          disabled={isSubmitting}
          className="rounded-xl border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
