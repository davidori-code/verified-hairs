import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { checkoutSchema } from "@/lib/validations/checkout";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }

  // Re-check stock and availability RIGHT NOW, at checkout time — not just
  // trusting whatever was true when the item was added to the cart. Time
  // may have passed, and someone else could have bought the last units.
  for (const item of cart.items) {
    if (!item.product.isActive) {
      return NextResponse.json(
        { error: `"${item.product.name}" is no longer available.` },
        { status: 409 }
      );
    }
    if (item.quantity > item.product.stockQuantity) {
      return NextResponse.json(
        {
          error: `Only ${item.product.stockQuantity} of "${item.product.name}" left in stock.`,
        },
        { status: 409 }
      );
    }
  }

  const totalInSmallestUnit = cart.items.reduce(
    (sum, item) => sum + item.quantity * item.product.priceInSmallestUnit,
    0
  );

  // Everything below happens as ONE transaction: create the order, create
  // its items, reduce each product's stock, and empty the cart. If
  // anything fails partway through (e.g. a stock update conflict), the
  // WHOLE thing rolls back — we never end up with an order that was
  // charged for but never actually reserved the stock, or vice versa.
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        buyerId: user.id,
        totalInSmallestUnit,
        deliveryAddress: parsed.data.deliveryAddress,
        deliveryPhone: parsed.data.deliveryPhone,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            vendorId: item.product.vendorId,
            productNameAtPurchase: item.product.name,
            priceAtPurchase: item.product.priceInSmallestUnit,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  return NextResponse.json(order, { status: 201 });
}
