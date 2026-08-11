import { z } from "zod";

/**
 * A vendor can move their item forward (or cancel it), but "PENDING" is
 * deliberately excluded here — that's the automatic starting state set at
 * checkout, never something a vendor manually sets it back to.
 */
export const updateOrderItemStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "DELIVERED", "CANCELLED"]),
});

export type UpdateOrderItemStatusInput = z.infer<typeof updateOrderItemStatusSchema>;
