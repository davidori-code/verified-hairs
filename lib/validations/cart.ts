import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1")
    .max(99, "Quantity cannot exceed 99"),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1")
    .max(99, "Quantity cannot exceed 99"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
