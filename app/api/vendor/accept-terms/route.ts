import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";

export async function POST() {
  const user = await requireRole(["VENDOR"]);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { vendorTermsAcceptedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
