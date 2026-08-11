import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { addToCartSchema } from "@/lib/validations/cart";

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

  const parsed = addToCartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { productId, quantity } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // A cart is created lazily — the first time someone actually adds
  // something, not at registration/login. upsert here means "use the
  // existing cart if there is one, otherwise create it in the same step."
  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  // If it's already in the cart, we're adding MORE of it, not replacing
  // the quantity — e.g. clicking "add to cart" twice should total 2, not
  // reset back to 1.
  const desiredQuantity = (existingItem?.quantity ?? 0) + quantity;

  if (desiredQuantity > product.stockQuantity) {
    return NextResponse.json(
      {
        error: `Only ${product.stockQuantity} in stock. You already have ${
          existingItem?.quantity ?? 0
        } in your cart.`,
      },
      { status: 409 }
    );
  }

  const cartItem = await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity: desiredQuantity },
    update: { quantity: desiredQuantity },
  });

  return NextResponse.json(cartItem, { status: 201 });
}
