import { z } from "zod";
import { phoneSchema } from "@/lib/validations/auth";

// Reuses the exact same phoneSchema as registration — this is a direct
// payoff of having pulled phone validation into its own reusable schema
// back when we first built it, instead of writing the regex twice.
export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  phone: phoneSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
