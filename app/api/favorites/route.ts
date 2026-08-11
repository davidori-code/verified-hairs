import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

const addFavoriteSchema = z.object({
  productId: z.string().min(1),
});

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

  const parsed = addFavoriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Product is required" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // upsert: clicking favorite on something already favorited just returns
  // the existing row instead of erroring on the @unique constraint.
  const favorite = await prisma.favorite.upsert({
    where: {
      buyerId_productId: { buyerId: user.id, productId: parsed.data.productId },
    },
    create: { buyerId: user.id, productId: parsed.data.productId },
    update: {},
  });

  return NextResponse.json(favorite, { status: 201 });
}
