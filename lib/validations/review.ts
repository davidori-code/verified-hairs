import { z } from "zod";

export const createReviewSchema = z.object({
  orderItemId: z.string().min(1, "Order item is required"),
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5),
  comment: z
    .string()
    .trim()
    .min(5, "Comment must be at least 5 characters")
    .max(1000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
