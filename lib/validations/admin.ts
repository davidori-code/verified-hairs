import { z } from "zod";

/**
 * A discriminated union: the shape of valid input depends on which action
 * is chosen. Rejecting requires a reason (so the vendor knows what to fix);
 * approving doesn't need one at all. This makes "reject with no reason"
 * impossible to submit, rather than relying on us remembering to check it.
 */
export const reviewActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("APPROVE"),
  }),
  z.object({
    action: z.literal("REJECT"),
    rejectionReason: z
      .string()
      .trim()
      .min(5, "Please provide a reason (at least 5 characters)")
      .max(500),
  }),
]);

export type ReviewActionInput = z.infer<typeof reviewActionSchema>;
