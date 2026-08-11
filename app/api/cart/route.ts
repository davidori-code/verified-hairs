import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              priceInSmallestUnit: true,
              stockQuantity: true,
              isActive: true,
            },
          },
        },
        orderBy: { addedAt: "asc" },
      },
    },
  });

  // No cart yet just means "empty cart" — not an error. We don't create
  // an empty Cart row until the user actually adds something.
  if (!cart) {
    return NextResponse.json({ items: [] });
  }

  return NextResponse.json(cart);
}
