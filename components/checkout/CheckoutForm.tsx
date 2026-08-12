"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

const inputClassName =
  "block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-jet shadow-sm placeholder:text-ink/40 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:bg-ivory";

const labelClassName = "mb-1.5 block text-sm font-medium text-ink";

export function CheckoutForm() {
  const router = useRouter();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryAddress, deliveryPhone }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.details) {
          setFieldErrors(data.details);
        } else {
          setFormError(data.error ?? "Checkout failed. Please try again.");
        }
        return;
      }

      router.push(`/orders/${data.id}`);
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {formError}
        </div>
      )}

      <div>
        <label htmlFor="deliveryAddress" className={labelClassName}>
          Delivery Address
        </label>
        <input
          id="deliveryAddress"
          type="text"
          required
          placeholder="12 Marina Street, Lagos"
          className={inputClassName}
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          disabled={isSubmitting}
        />
        {fieldErrors.deliveryAddress && (
          <p className="mt-1.5 text-xs text-red-600">{fieldErrors.deliveryAddress}</p>
        )}
      </div>

      <div>
        <label htmlFor="deliveryPhone" className={labelClassName}>
          Delivery Phone Number
        </label>
        <input
          id="deliveryPhone"
          type="tel"
          required
          placeholder="+2348012345678"
          className={inputClassName}
          value={deliveryPhone}
          onChange={(e) => setDeliveryPhone(e.target.value)}
          disabled={isSubmitting}
        />
        {fieldErrors.deliveryPhone && (
          <p className="mt-1.5 text-xs text-red-600">{fieldErrors.deliveryPhone}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-jet px-4 py-3 text-sm font-semibold text-ivory shadow-sm transition-colors hover:bg-chestnut disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {isSubmitting ? "Placing order..." : "Place Order"}
      </button>
    </form>
  );
}
