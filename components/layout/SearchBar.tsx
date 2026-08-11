"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  size?: "compact" | "regular" | "large";
  showButton?: boolean;
}

const sizeClasses = {
  compact: "py-2 text-sm",
  regular: "py-2.5 text-sm",
  large: "py-3.5 text-base",
};

export function SearchBar({
  defaultValue = "",
  placeholder = "Search wigs, bundles, closures...",
  size = "regular",
  showButton = false,
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    router.push(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : "/products");
  }

  function handleClear() {
    // Clearing resubmits an empty search immediately, rather than just
    // emptying the box and leaving the user to press Enter again — one
    // click gets back to the full unfiltered list.
    setValue("");
    router.push("/products");
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <div className="relative flex-1">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-full border border-chestnut/15 bg-white pl-10 pr-9 text-ink shadow-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-honey ${sizeClasses[size]}`}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-ink/40 hover:bg-ivory hover:text-ink"
          >
            ×
          </button>
        )}
      </div>

      {showButton && (
        <button
          type="submit"
          className="shrink-0 rounded-full bg-honey px-6 text-sm font-semibold text-jet transition-colors hover:bg-honey-dark"
        >
          Search
        </button>
      )}
    </form>
  );
}
