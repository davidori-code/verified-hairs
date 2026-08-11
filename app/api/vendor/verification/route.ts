import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";
import { vendorVerificationSchema } from "@/lib/validations/vendor";

export async function GET() {
  const user = await requireRole(["VENDOR"]);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const verification = await prisma.vendorVerification.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json(verification);
}

export async function POST(request: NextRequest) {
  const user = await requireRole(["VENDOR"]);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const parsed = vendorVerificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { businessName, businessAddress, documentUrl } = parsed.data;

  // upsert: if this vendor has never submitted, create a new record.
  // If they're resubmitting (e.g. after a rejection), overwrite the old
  // details AND reset status back to PENDING with a fresh submittedAt —
  // a resubmission should never keep a stale "REJECTED" status sitting
  // around.
  const verification = await prisma.vendorVerification.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      businessName,
      businessAddress,
      documentUrl,
    },
    update: {
      businessName,
      businessAddress,
      documentUrl,
      status: "PENDING",
      rejectionReason: null,
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
    },
  });

  return NextResponse.json(verification, { status: 201 });
}
