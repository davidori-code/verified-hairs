import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { updateCartItemSchema } from "@/lib/validations/cart";

async function getOwnedCartItem(userId: string, productId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return null;

  return prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
    include: { product: { select: { stockQuantity: true } } },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const parsed = updateCartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const existingItem = await getOwnedCartItem(user.id, productId);
  if (!existingItem) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  if (parsed.data.quantity > existingItem.product.stockQuantity) {
    return NextResponse.json(
      { error: `Only ${existingItem.product.stockQuantity} in stock.` },
      { status: 409 }
    );
  }

  const updated = await prisma.cartItem.update({
    where: { id: existingItem.id },
    data: { quantity: parsed.data.quantity },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await params;

  const existingItem = await getOwnedCartItem(user.id, productId);
  if (!existingItem) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: existingItem.id } });

  return NextResponse.json({ success: true });
}
