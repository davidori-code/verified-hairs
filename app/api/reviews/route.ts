import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { createReviewSchema } from "@/lib/validations/review";

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

  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { orderItemId, rating, comment } = parsed.data;

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: { select: { buyerId: true } }, review: true },
  });

  if (!orderItem || orderItem.order.buyerId !== user.id) {
    return NextResponse.json({ error: "Order item not found" }, { status: 404 });
  }

  // The real gate: you can only review something you've confirmed
  // receiving. This is what makes reviews meaningful "verified purchase"
  // signals rather than something anyone could post about any product.
  if (!orderItem.receivedByBuyer) {
    return NextResponse.json(
      { error: "You can only review an item after confirming you received it." },
      { status: 403 }
    );
  }

  if (orderItem.review) {
    return NextResponse.json(
      { error: "You've already reviewed this purchase." },
      { status: 409 }
    );
  }

  const review = await prisma.review.create({
    data: {
      orderItemId,
      productId: orderItem.productId,
      buyerId: user.id,
      rating,
      comment,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
