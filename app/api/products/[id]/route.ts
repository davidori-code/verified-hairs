import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      vendor: {
        select: {
          firstName: true,
          lastName: true,
          vendorVerification: { select: { businessName: true } },
        },
      },
    },
  });

  // Treat a hidden (isActive: false) product the same as "doesn't exist" —
  // a buyer with a saved/shared link shouldn't be able to view a listing
  // the vendor has taken down.
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
