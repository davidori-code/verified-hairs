import { z } from "zod";

/**
 * E.164 international phone number format.
 *
 * Format: + followed by 1-3 digit country code, then subscriber number.
 * Total length (excluding the leading +) is 8-15 digits per the ITU-T E.164 spec.
 *
 * Examples that PASS:   +2348012345678   +14155552671
 * Examples that FAIL:   08012345678      (missing country code)
 *                       +234 801 234 5678 (spaces not allowed)
 *                       2348012345678    (missing leading +)
 */
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .regex(
    E164_REGEX,
    "Phone number must be in international format, e.g. +2348012345678"
  );

/**
 * Only BUYER and VENDOR are legal self-registration roles.
 * RIDER and ADMIN exist in the Prisma enum for future/internal use,
 * but must never be settable from a public-facing endpoint.
 */
export const registrableRoleSchema = z.enum(["BUYER", "VENDOR"]);

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: phoneSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters") // bcrypt silently truncates beyond 72 bytes
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: registrableRoleSchema,
});

// Single source of truth: the TypeScript type is inferred from the schema,
// so validation rules and types can never drift out of sync with each other.
export type RegisterInput = z.infer<typeof registerSchema>;
