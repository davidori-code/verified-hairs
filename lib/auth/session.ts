import jwt from "jsonwebtoken";
import type { Role } from "@/app/generated/prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  // Fail loudly at startup rather than silently signing tokens with
  // `undefined` as the secret — that would make every token forgeable.
  throw new Error("JWT_SECRET environment variable is not set");
}

export const SESSION_COOKIE_NAME = "session";

export interface SessionPayload {
  userId: string;
  role: Role;
}

export function signSessionToken(payload: SessionPayload, expiresIn: string = "1d"): string {
  // expiresIn is a backstop, independent of the cookie's own lifetime.
  // Even if a browser keeps the cookie around longer than a real "session"
  // (some browsers restore cookies on reopen), the token itself stops being
  // valid after this window, so it can never work forever unnoticed.
  // "Remember me" passes a longer window here (see the login route) —
  // otherwise the default 1-day backstop would silently log someone out
  // well before the "remembered" cookie itself expires.
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as SessionPayload;
  } catch {
    // Covers both "expired" and "tampered with / invalid signature" — in
    // both cases the correct behavior is the same: treat it as logged out.
    return null;
  }
}
