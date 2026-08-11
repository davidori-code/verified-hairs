"use client";

import { useState } from "react";
import Link from "next/link";

interface AddToCartButtonProps {
  productId: string;
  stockQuantity: number;
}

export function AddToCartButton({ productId, stockQuantity }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  async function handleAddToCart() {
    setError(null);
    setAdded(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not add to cart. Please try again.");
        return;
      }

      setAdded(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (stockQuantity === 0) {
    return (
      <button
        type="button"
        disabled
        className="mt-4 w-full cursor-not-allowed rounded-xl bg-stone-300 px-4 py-3 text-sm font-semibold text-ivory0"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {error && (
        <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {added && (
        <div className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
          Added to cart.{" "}
          <Link href="/cart" className="font-medium underline">
            View cart
          </Link>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm text-ink">
          Qty
        </label>
        <select
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          disabled={isSubmitting}
          className="rounded-xl border border-stone-300 px-2 py-1.5 text-sm"
        >
          {Array.from({ length: Math.min(stockQuantity, 10) }, (_, i) => i + 1).map(
            (n) => (
              <option key={n} value={n}>
                {n}
              </option>
            )
          )}
        </select>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isSubmitting}
        className="w-full rounded-full bg-jet px-4 py-3 text-sm font-semibold text-ivory shadow-sm transition-colors hover:bg-chestnut disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}
