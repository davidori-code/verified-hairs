import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

interface EmailVerificationPayload {
  userId: string;
  purpose: "email-verification";
}

export function signEmailVerificationToken(userId: string): string {
  const payload: EmailVerificationPayload = { userId, purpose: "email-verification" };
  // 24-hour expiry — long enough that someone checking email a bit later
  // in the day doesn't hit a dead link, short enough that an old,
  // forgotten link eventually stops working on its own.
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: "24h" });
}

export function verifyEmailVerificationToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET as string) as EmailVerificationPayload;

    // The "purpose" check matters: without it, a session token (which is
    // also just a JWT signed with the same secret) could theoretically be
    // reused here as if it were a verification link, or vice versa. This
    // makes the two kinds of token structurally incompatible with each
    // other, not just conventionally different.
    if (payload.purpose !== "email-verification") {
      return null;
    }

    return payload.userId;
  } catch {
    return null;
  }
}
