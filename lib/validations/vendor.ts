import { z } from "zod";

/**
 * The document itself is uploaded separately via UploadThing (before this
 * form is submitted) — by the time this schema runs, we only need the
 * resulting URL, not the file itself. That's why documentUrl is just a
 * URL string here, not a file upload field.
 */
export const vendorVerificationSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(100),
  businessAddress: z
    .string()
    .trim()
    .min(5, "Please enter a full business address")
    .max(200),
  documentUrl: z.string().url("A verification document upload is required"),
});

export type VendorVerificationInput = z.infer<typeof vendorVerificationSchema>;
