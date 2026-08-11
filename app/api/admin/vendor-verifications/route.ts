import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";

export async function GET() {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const verifications = await prisma.vendorVerification.findMany({
    where: { status: "PENDING" },
    orderBy: { submittedAt: "asc" }, // oldest submissions reviewed first — fairness
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  return NextResponse.json(verifications);
}
