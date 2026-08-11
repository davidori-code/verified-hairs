import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailVerificationToken } from "@/lib/auth/emailVerificationToken";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/verify-email/invalid", request.url));
  }

  const userId = verifyEmailVerificationToken(token);

  if (!userId) {
    // Covers both "expired" and "tampered with" — same page either way,
    // since the fix is the same for the user: request a new link.
    return NextResponse.redirect(new URL("/verify-email/invalid", request.url));
  }

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true },
  });

  return NextResponse.redirect(new URL("/verify-email/success", request.url));
}
