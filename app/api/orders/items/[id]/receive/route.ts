import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const orderItem = await prisma.orderItem.findUnique({
    where: { id },
    include: { order: { select: { buyerId: true } } },
  });

  // Ownership check: only the buyer who placed the order can confirm
  // receipt of it — not the vendor, not another buyer.
  if (!orderItem || orderItem.order.buyerId !== user.id) {
    return NextResponse.json({ error: "Order item not found" }, { status: 404 });
  }

  if (orderItem.status !== "DELIVERED") {
    return NextResponse.json(
      { error: "This item hasn't been marked as delivered by the vendor yet." },
      { status: 409 }
    );
  }

  if (orderItem.receivedByBuyer) {
    return NextResponse.json(
      { error: "This item has already been marked as received." },
      { status: 409 }
    );
  }

  const updated = await prisma.orderItem.update({
    where: { id },
    data: { receivedByBuyer: true, receivedAt: new Date() },
  });

  return NextResponse.json(updated);
}
