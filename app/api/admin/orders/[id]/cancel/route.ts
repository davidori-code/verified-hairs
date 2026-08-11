import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireRole(["ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "CANCELLED" || order.status === "DELIVERED") {
    return NextResponse.json(
      { error: `Cannot cancel an order that is already ${order.status}` },
      { status: 409 }
    );
  }

  // Cancelling means: mark the order AND every item as CANCELLED, and give
  // back the stock that was reserved for it at checkout — all together,
  // in one transaction, so a failure partway through can't leave stock
  // permanently "lost" or an order half-cancelled.
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    await tx.orderItem.updateMany({
      where: { orderId: id },
      data: { status: "CANCELLED" },
    });

    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { increment: item.quantity } },
      });
    }
  });

  return NextResponse.json({ success: true });
}
