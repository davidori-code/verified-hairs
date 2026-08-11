// Shared className strings for the Verified Hairs design system. Importing
// these instead of hand-writing Tailwind classes per-component is what
// keeps "the same feel everywhere" true structurally — a single edit here
// updates every form/button/card in the app at once, rather than relying
// on remembering to copy the right classes by hand each time.

export const inputClassName =
  "block w-full rounded-xl border border-chestnut/15 bg-white px-4 py-3 text-sm text-ink shadow-sm transition-colors placeholder:text-ink/35 focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/40 disabled:cursor-not-allowed disabled:bg-ivory";

export const labelClassName = "mb-1.5 block text-sm font-medium text-ink";

export const primaryButtonClassName =
  "rounded-full bg-jet px-5 py-3 text-sm font-semibold text-ivory shadow-sm transition-colors hover:bg-chestnut disabled:cursor-not-allowed disabled:bg-stone-300";

export const secondaryButtonClassName =
  "rounded-full border border-chestnut/20 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:border-chestnut/40 hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-50";

export const dangerButtonClassName =
  "rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50";

export const successButtonClassName =
  "rounded-full border border-green-200 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50";

export const cardClassName =
  "rounded-2xl border border-chestnut/10 bg-white shadow-sm";

export const errorBannerClassName =
  "rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700";

export const successBannerClassName =
  "rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800";

// Order/verification status colors are deliberately kept as universal
// semantic colors (amber/blue/green/red) rather than forced into the
// brand palette — status feedback relies on conventions people already
// recognize (green = good, red = bad), and overriding that for brand
// consistency would make the app harder to read at a glance, not easier.
export const statusBadgeStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  DELIVERED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-red-100 text-red-800",
};
