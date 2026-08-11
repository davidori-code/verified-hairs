"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VendorTermsContent } from "@/components/vendor/VendorTermsContent";

export function VendorTermsGate() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    if (!agreed) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/vendor/accept-terms", { method: "POST" });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Could not continue. Please try again.");
        return;
      }

      // Re-runs the parent server component, which will now see
      // vendorTermsAcceptedAt is set and show the verification form
      // instead of this gate.
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-ink/70">
        Before you can submit for verification, please review and accept the
        Vendor Terms &amp; Conditions.
      </p>

      <div className="mt-4 max-h-80 overflow-y-auto rounded-xl border border-chestnut/10 bg-ivory p-4">
        <VendorTermsContent />
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <label className="mt-4 flex items-start gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5"
        />
        I have read and agree to the Vendor Terms &amp; Conditions.
      </label>

      <button
        type="button"
        onClick={handleContinue}
        disabled={!agreed || isSubmitting}
        className="mt-4 w-full rounded-full bg-jet px-4 py-3 text-sm font-semibold text-ivory shadow-sm transition-colors hover:bg-chestnut disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {isSubmitting ? "Continuing..." : "Agree & Continue"}
      </button>
    </div>
  );
}
