import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";
import { signEmailVerificationToken } from "@/lib/auth/emailVerificationToken";
import { sendVerificationEmail } from "@/lib/email/resend";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse JSON
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    // 2. Validate input
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, password, role } = parsed.data;

    // 3. Check whether email or phone already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "phone";

      return NextResponse.json(
        {
          error: `An account with this ${field} already exists`,
        },
        { status: 409 }
      );
    }

    // 4. Hash password
    const passwordHash = await hashPassword(password);

    // 5. Create user
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

    // 6. Create email verification token
    const token = signEmailVerificationToken(user.id);

    const verificationUrl =
      `${request.nextUrl.origin}/api/auth/verify-email?token=${token}`;

    // 7. Send verification email
    // Email failure should NOT prevent account creation.
    try {
      await sendVerificationEmail(user.email, verificationUrl);
    } catch (emailError) {
      console.error("Verification email failed:", emailError);
    }

    // 8. Return successful registration
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
    console.error("REGISTRATION ERROR:", error);

    if (error instanceof Error) {
      console.error("MESSAGE:", error.message);
      console.error("STACK:", error.stack);
    }

    // Handle unique constraint violations
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const conflictField =
        (error.meta?.target as string[])?.[0] ?? "field";

      return NextResponse.json(
        {
          error: `An account with this ${conflictField} already exists`,
        },
        { status: 409 }
      );
    }

    // Unexpected errors
    return NextResponse.json(
      {
        error: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}