"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  productId: string;
  initialIsFavorited: boolean;
  isLoggedIn: boolean;
}

export function FavoriteButton({
  productId,
  initialIsFavorited,
  isLoggedIn,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick(event: React.MouseEvent) {
    // Stops the click from also triggering a parent <Link> (the product
    // card links to the product page) — without this, tapping the heart
    // would both toggle the favorite AND navigate away.
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    // Optimistic update: flip the heart immediately rather than waiting
    // for the network response, since a favorite toggle is low-stakes and
    // near-instant feedback matters more here than for, say, checkout.
    const nextState = !isFavorited;
    setIsFavorited(nextState);

    try {
      if (nextState) {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      } else {
        await fetch(`/api/favorites/${productId}`, { method: "DELETE" });
      }
    } catch {
      // Roll back the optimistic update if the request actually failed.
      setIsFavorited(!nextState);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitting}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorited}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-105 disabled:opacity-50"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4.5 w-4.5"
        fill={isFavorited ? "#D4A24C" : "none"}
        stroke={isFavorited ? "#D4A24C" : "#78716c"}
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
