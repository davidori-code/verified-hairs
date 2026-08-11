import { z } from "zod";

const productBaseSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(150),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000),

  // Whole number in the smallest currency unit (e.g. kobo). The form
  // collects a naira-and-kobo amount and converts it before sending here.
  priceInSmallestUnit: z
    .number()
    .int("Price must be a whole number of kobo")
    .positive("Price must be greater than zero"),

  // Optional — only set when the product is genuinely on sale. Validated
  // below (via .refine on the create schema) to ensure it's actually
  // higher than the current price, so a "discount" badge can never be
  // shown for a fake or backwards markdown.
  compareAtPriceInSmallestUnit: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),

  images: z
    .array(z.string().url())
    .min(1, "At least one product image is required")
    .max(5, "You can upload up to 5 images"),

  tags: z
    .array(z.string().trim().toLowerCase().min(1).max(30))
    .max(10, "You can add up to 10 tags")
    .default([]),

  stockQuantity: z
    .number()
    .int("Stock quantity must be a whole number")
    .nonnegative("Stock quantity cannot be negative")
    .default(0),
});

function hasValidCompareAtPrice(data: {
  priceInSmallestUnit?: number;
  compareAtPriceInSmallestUnit?: number | null;
}) {
  return (
    !data.compareAtPriceInSmallestUnit ||
    data.priceInSmallestUnit === undefined ||
    data.compareAtPriceInSmallestUnit > data.priceInSmallestUnit
  );
}

export const productSchema = productBaseSchema.refine(hasValidCompareAtPrice, {
  message: "Original price must be higher than the current price",
  path: ["compareAtPriceInSmallestUnit"],
});

export type ProductInput = z.infer<typeof productSchema>;

/**
 * For editing an existing product. Every field is optional here (.partial())
 * since an edit might only touch, say, the price — the vendor shouldn't have
 * to resend everything. isActive is added separately since it's not part of
 * creating a NEW product (a product is always active when first created).
 */
export const productUpdateSchema = productBaseSchema
  .partial()
  .extend({ isActive: z.boolean().optional() })
  .refine(hasValidCompareAtPrice, {
    message: "Original price must be higher than the current price",
    path: ["compareAtPriceInSmallestUnit"],
  });

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
