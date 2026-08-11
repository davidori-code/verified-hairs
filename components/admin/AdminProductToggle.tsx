"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminProductToggleProps {
  productId: string;
  isActive: boolean;
}

export function AdminProductToggle({ productId, isActive }: AdminProductToggleProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setError(null);
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not update product.");
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
      <button
        type="button"
        onClick={handleToggle}
        disabled={isUpdating}
        className={`rounded-xl border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
          isActive
            ? "border-red-300 text-red-700 hover:bg-red-50"
            : "border-green-300 text-green-700 hover:bg-green-50"
        }`}
      >
        {isUpdating ? "Updating..." : isActive ? "Deactivate" : "Reactivate"}
      </button>
    </div>
  );
}
