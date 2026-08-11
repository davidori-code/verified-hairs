"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CartItemControlsProps {
  productId: string;
  quantity: number;
  stockQuantity: number;
}

export function CartItemControls({
  productId,
  quantity,
  stockQuantity,
}: CartItemControlsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateQuantity(newQuantity: number) {
    setError(null);
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/cart/items/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not update quantity.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function removeItem() {
    setError(null);
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/cart/items/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Could not remove item.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div>
      {error && <p className="mb-1 text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-stone-300">
          <button
            type="button"
            onClick={() => {
              if (quantity <= 1) {
                removeItem();
              } else {
                updateQuantity(quantity - 1);
              }
            }}
            disabled={isUpdating}
            className="px-2.5 py-1 text-sm text-ink/70 hover:bg-ivory disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-[2rem] px-2 text-center text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={isUpdating || quantity >= stockQuantity}
            className="px-2.5 py-1 text-sm text-ink/70 hover:bg-ivory disabled:opacity-50"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={removeItem}
          disabled={isUpdating}
          className="text-xs font-medium text-red-600 underline disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
