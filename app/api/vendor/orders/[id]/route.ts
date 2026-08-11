import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/requireRole";
import { updateOrderItemStatusSchema } from "@/lib/validations/orderItem";
import { computeOrderStatus } from "@/lib/orders/computeOrderStatus";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole(["VENDOR"]);
  if (!user) {
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

  const parsed = updateOrderItemStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const orderItem = await prisma.orderItem.findUnique({ where: { id } });

  // Ownership check: this item must actually belong to the vendor making
  // the request — a vendor can never touch another vendor's order item,
  // even within the same shared order.
  if (!orderItem || orderItem.vendorId !== user.id) {
    return NextResponse.json({ error: "Order item not found" }, { status: 404 });
  }

  // Both writes happen together: update this item's status, AND
  // recalculate + save the parent order's overall status. Doing this in
  // one transaction means the buyer never sees a moment where the item
  // says "DELIVERED" but the order as a whole still says "PENDING".
  const updated = await prisma.$transaction(async (tx) => {
    const updatedItem = await tx.orderItem.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    const allItems = await tx.orderItem.findMany({
      where: { orderId: orderItem.orderId },
      select: { status: true },
    });

    const newOrderStatus = computeOrderStatus(allItems.map((item) => item.status));

    await tx.order.update({
      where: { id: orderItem.orderId },
      data: { status: newOrderStatus },
    });

    return updatedItem;
  });

  return NextResponse.json(updated);
}
