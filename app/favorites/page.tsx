import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/ProductCard";
import { getProductCardExtras } from "@/lib/products/getProductCardExtras";
import { computeProductBadge } from "@/lib/products/computeProductBadge";

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const favorites = await prisma.favorite.findMany({
    where: { buyerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          vendor: {
            select: {
              vendorVerification: {
                select: { businessName: true, businessAddress: true },
              },
            },
          },
        },
      },
    },
  });

  const extrasMap = await getProductCardExtras(
    favorites.map((f) => f.product.id)
  );

  // A favorited product might have been deactivated by its vendor (or an
  // admin) since it was saved. We still show it, but flag it clearly
  // rather than silently hiding it — the buyer bookmarked it for a
  // reason, and quietly disappearing would be more confusing than a
  // clear "no longer available" note.
  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-xl font-semibold text-jet">Your Favorites</h1>

      {favorites.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-chestnut/20 p-8 text-center text-sm text-ink/50">
          You haven&apos;t saved any products yet.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {favorites.map((favorite) => {
            const product = favorite.product;
            const extras = extrasMap.get(product.id);
            const badge = computeProductBadge({
              createdAt: product.createdAt,
              priceInSmallestUnit: product.priceInSmallestUnit,
              compareAtPriceInSmallestUnit: product.compareAtPriceInSmallestUnit,
              unitsSold: extras?.unitsSold ?? 0,
              favoriteCount: extras?.favoriteCount ?? 0,
            });

            return (
              <div key={favorite.id} className="relative">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  priceInSmallestUnit={product.priceInSmallestUnit}
                  compareAtPriceInSmallestUnit={product.compareAtPriceInSmallestUnit}
                  images={product.images}
                  businessName={product.vendor.vendorVerification?.businessName}
                  vendorLocation={product.vendor.vendorVerification?.businessAddress}
                  stockQuantity={product.stockQuantity}
                  tag={product.tags[0]}
                  averageRating={extras?.averageRating}
                  reviewCount={extras?.reviewCount}
                  badge={badge}
                  isFavorited={true}
                  isLoggedIn={true}
                />
                {!product.isActive && (
                  <p className="mt-1 text-center text-xs text-red-600">
                    No longer available
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
