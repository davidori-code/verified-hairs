import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await params;

  // deleteMany rather than delete: if the favorite doesn't exist (already
  // removed, e.g. from a second tab), this just does nothing instead of
  // throwing a "record not found" error.
  await prisma.favorite.deleteMany({
    where: { buyerId: user.id, productId },
  });

  return NextResponse.json({ success: true });
}
