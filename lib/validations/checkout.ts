import { z } from "zod";

export const checkoutSchema = z.object({
  deliveryAddress: z
    .string()
    .trim()
    .min(5, "Please enter a full delivery address")
    .max(300),
  deliveryPhone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/, "Enter a valid phone number, e.g. +2348012345678"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
