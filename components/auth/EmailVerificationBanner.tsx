"use client";

import { useEffect, useState } from "react";

const AUTO_DISMISS_MS = 10_000;

export function EmailVerificationBanner() {
  // Visible by default; auto-dismisses after 10 seconds, or immediately
  // on manual close. Note that dismissing this toast only hides the
  // REMINDER — it does not verify the email. Buying and selling remain
  // blocked at the actual checkout/listing-creation routes regardless of
  // whether this toast is on screen, so a dismissed toast can never be
  // used to bypass the real requirement.
  const [isVisible, setIsVisible] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []);

  async function handleResend() {
    setMessage(null);
    setIsSending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error ?? "Could not resend verification email.");
        return;
      }

      setMessage("Verification email sent — check your inbox.");
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed right-4 top-20 z-50 w-80 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-jet">
          Please verify your email address.
        </p>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss"
          className="shrink-0 text-ink/40 hover:text-ink"
        >
          ×
        </button>
      </div>

      <p className="mt-1 text-xs text-ink/60">
        Required before you can buy or sell on Verified Hairs.
      </p>

      <button
        type="button"
        onClick={handleResend}
        disabled={isSending}
        className="mt-3 rounded-full bg-honey px-3 py-1.5 text-xs font-semibold text-jet transition-colors hover:bg-honey-dark disabled:opacity-50"
      >
        {isSending ? "Sending..." : "Resend verification email"}
      </button>

      {message && <p className="mt-2 text-xs text-ink/70">{message}</p>}
    </div>
  );
}
