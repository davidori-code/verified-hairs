import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";

export async function POST(request: NextRequest) {
  // 1. Parse JSON safely — a malformed body should never crash the route.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  // 2. Validate shape and content server-side. Client-side validation is for
  // UX (instant feedback); server-side validation is for security — the
  // client can always be bypassed with a direct API call.
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, phone, password, role } = parsed.data;

  // 3. Pre-check for existing email/phone. This gives a fast, friendly error
  // in the common case, but is NOT sufficient on its own — see step 5.
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });

  if (existingUser) {
    const field = existingUser.email === email ? "email" : "phone";
    return NextResponse.json(
      { error: `An account with this ${field} already exists` },
      { status: 409 }
    );
  }

  // 4. Hash the password. Never store or log the plain-text value anywhere
  // past this point.
  const passwordHash = await hashPassword(password);

  try {
    // 5. Create the user. The @unique constraints on email/phone are the
    // real source of truth — if two requests race past the check above at
    // the same instant, Postgres rejects the second insert here (error code
    // P2002), and we translate that into the same friendly 409 response.
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        passwordHash,
        role,
      },
    });

    // 6. Never return passwordHash in the response, even though it's
    // hashed. There's no reason for it to leave the server.
    return NextResponse.json(
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const conflictField = (error.meta?.target as string[])?.[0] ?? "field";
      return NextResponse.json(
        { error: `An account with this ${conflictField} already exists` },
        { status: 409 }
      );
    }

    // Unexpected errors: log server-side for debugging, but never leak
    // internals (stack traces, DB error messages) to the client.
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
