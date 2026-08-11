import { prisma } from "@/lib/prisma";

export interface ProductCardExtras {
  averageRating: number | null;
  reviewCount: number;
  unitsSold: number;
  favoriteCount: number;
}

/**
 * Runs three grouped aggregate queries (one each for reviews, order items,
 * favorites) instead of one query PER product — for a page showing 20
 * products, that's 3 queries total instead of 60+.
 */
export async function getProductCardExtras(
  productIds: string[]
): Promise<Map<string, ProductCardExtras>> {
  if (productIds.length === 0) {
    return new Map();
  }

  const [ratings, sales, favorites] = await Promise.all([
    prisma.review.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds } },
      _avg: { rating: true },
      _count: true,
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds }, status: { not: "CANCELLED" } },
      _sum: { quantity: true },
    }),
    prisma.favorite.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds } },
      _count: true,
    }),
  ]);

  const ratingMap = new Map(ratings.map((r) => [r.productId, r]));
  const salesMap = new Map(sales.map((s) => [s.productId, s]));
  const favoriteMap = new Map(favorites.map((f) => [f.productId, f]));

  const result = new Map<string, ProductCardExtras>();
  for (const productId of productIds) {
    result.set(productId, {
      averageRating: ratingMap.get(productId)?._avg.rating ?? null,
      reviewCount: ratingMap.get(productId)?._count ?? 0,
      unitsSold: salesMap.get(productId)?._sum.quantity ?? 0,
      favoriteCount: favoriteMap.get(productId)?._count ?? 0,
    });
  }

  return result;
}
