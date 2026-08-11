import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(query && {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { tags: { has: query.toLowerCase() } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
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

  return NextResponse.json(products);
}
