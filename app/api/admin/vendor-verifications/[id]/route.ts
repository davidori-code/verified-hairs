import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";
import { reviewActionSchema } from "@/lib/validations/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const parsed = reviewActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const verification = await prisma.vendorVerification.findUnique({
    where: { id },
  });

  if (!verification) {
    return NextResponse.json({ error: "Verification not found" }, { status: 404 });
  }

  if (verification.status !== "PENDING") {
    return NextResponse.json(
      { error: "This verification has already been reviewed" },
      { status: 409 }
    );
  }

  if (parsed.data.action === "APPROVE") {
    // $transaction: either BOTH updates succeed, or NEITHER does. Without
    // this, a crash between the two writes could leave the verification
    // marked "approved" while the user is still isVerified: false —
    // two records disagreeing about the same fact.
    const [updatedVerification] = await prisma.$transaction([
      prisma.vendorVerification.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedBy: admin.id,
          rejectionReason: null,
        },
      }),
      prisma.user.update({
        where: { id: verification.userId },
        data: { isVerified: true },
      }),
    ]);

    return NextResponse.json(updatedVerification);
  }

  // action === "REJECT"
  const updatedVerification = await prisma.vendorVerification.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: admin.id,
      rejectionReason: parsed.data.rejectionReason,
    },
  });

  return NextResponse.json(updatedVerification);
}
