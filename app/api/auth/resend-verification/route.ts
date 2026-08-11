import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { signEmailVerificationToken } from "@/lib/auth/emailVerificationToken";
import { sendVerificationEmail } from "@/lib/email/resend";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.emailVerified) {
    return NextResponse.json(
      { error: "Your email is already verified." },
      { status: 409 }
    );
  }

  const token = signEmailVerificationToken(user.id);
  const verificationUrl = `${request.nextUrl.origin}/api/auth/verify-email?token=${token}`;

  try {
    await sendVerificationEmail(user.email, verificationUrl);
  } catch {
    return NextResponse.json(
      { error: "Could not send verification email. Please try again shortly." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
