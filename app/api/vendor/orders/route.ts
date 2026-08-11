import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";

export async function GET() {
  const user = await requireRole(["VENDOR"]);
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orderItems = await prisma.orderItem.findMany({
    where: { vendorId: user.id },
    include: {
      order: {
        select: {
          id: true,
          deliveryAddress: true,
          deliveryPhone: true,
          createdAt: true,
          buyer: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
  });

  return NextResponse.json(orderItems);
}
