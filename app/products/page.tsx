import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { ProductCard } from "@/components/products/ProductCard";
import { SearchBar } from "@/components/layout/SearchBar";
import { getProductCardExtras } from "@/lib/products/getProductCardExtras";
import { computeProductBadge } from "@/lib/products/computeProductBadge";

interface ProductsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { q } = await searchParams;
  const query = q?.trim();

  const [user, products] = await Promise.all([
    getCurrentUser(),
    prisma.product.findMany({
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
            vendorVerification: {
              select: { businessName: true, businessAddress: true },
            },
          },
        },
      },
    }),
  ]);

  const [favoritedIds, extrasMap] = await Promise.all([
    user
      ? prisma.favorite
          .findMany({
            where: {
              buyerId: user.id,
              productId: { in: products.map((p) => p.id) },
            },
            select: { productId: true },
          })
          .then((rows) => new Set(rows.map((r) => r.productId)))
      : Promise.resolve(new Set<string>()),
    getProductCardExtras(products.map((p) => p.id)),
  ]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-xl font-semibold text-jet">Shop Hair Products</h1>

      <div className="mt-4 max-w-md">
        <SearchBar defaultValue={query} />
      </div>

      <p className="mt-4 text-sm text-ink/50">
        {products.length} product{products.length === 1 ? "" : "s"}
        {query && ` matching "${query}"`}
      </p>

      {products.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-chestnut/20 p-8 text-center text-sm text-ink/50">
          No products found.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => {
            const extras = extrasMap.get(product.id);
            const badge = computeProductBadge({
              createdAt: product.createdAt,
              priceInSmallestUnit: product.priceInSmallestUnit,
              compareAtPriceInSmallestUnit: product.compareAtPriceInSmallestUnit,
              unitsSold: extras?.unitsSold ?? 0,
              favoriteCount: extras?.favoriteCount ?? 0,
            });

            return (
              <ProductCard
                key={product.id}
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
                isFavorited={favoritedIds.has(product.id)}
                isLoggedIn={!!user}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
