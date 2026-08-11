import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/auth/password";
import { signSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password, rememberMe } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // Deliberately the SAME error message and status whether the email
  // doesn't exist OR the password is wrong. If we said "no account with
  // that email" specifically, an attacker could use that to figure out
  // which emails are registered on the platform (email enumeration).
  const invalidCredentials = () =>
    NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  if (!user) {
    return invalidCredentials();
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    return invalidCredentials();
  }

  // Checked AFTER password verification on purpose: if we checked this
  // first, a wrong password on a suspended account would return a
  // different error than a wrong password on a normal account — which
  // would let someone probe whether a specific email is suspended, even
  // without knowing its password.
  if (!user.status) {
    return NextResponse.json(
      { error: "This account has been suspended. Contact support for help." },
      { status: 403 }
    );
  }

  const token = rememberMe
    ? signSessionToken({ userId: user.id, role: user.role }, 1000 * 60 * 60 * 24 * 30)
    : signSessionToken({ userId: user.id, role: user.role });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true, // JavaScript in the browser can't read this — protects against XSS stealing it
    secure: process.env.NODE_ENV === "production", // only sent over HTTPS in production
    sameSite: "lax", // blocks the cookie being sent along with cross-site requests, a CSRF mitigation
    path: "/",
    // "Remember me" checked: cookie survives 30 days, even across browser
    // restarts. Unchecked (default): no maxAge at all, making it a true
    // browser "session cookie" that clears when the browser fully closes.
    ...(rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}),
  });

  return NextResponse.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  });
}
