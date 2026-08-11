import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { FavoriteButton } from "@/components/products/FavoriteButton";

function formatNaira(priceInSmallestUnit: number) {
  return `₦${(priceInSmallestUnit / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;
}

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;

  const [user, product, reviews, ratingAggregate] = await Promise.all([
    getCurrentUser(),
    prisma.product.findUnique({
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
    }),
    prisma.review.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      include: { buyer: { select: { firstName: true } } },
    }),
    prisma.review.aggregate({
      where: { productId: id },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  // notFound() renders Next.js's built-in 404 page. We treat a hidden
  // (isActive: false) product the same as "doesn't exist" — a buyer with
  // an old saved link shouldn't be able to view a delisted product.
  if (!product || !product.isActive) {
    notFound();
  }

  const isFavorited = user
    ? !!(await prisma.favorite.findUnique({
        where: { buyerId_productId: { buyerId: user.id, productId: product.id } },
      }))
    : false;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          {product.images.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[0]}
                alt={product.name}
                className="aspect-square w-full rounded-xl object-cover"
              />
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1).map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={url}
                      src={url}
                      alt={product.name}
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-chestnut/10 text-sm text-ink/40">
              No image available
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between">
            <h1 className="text-xl font-semibold text-jet">{product.name}</h1>
            <FavoriteButton
              productId={product.id}
              initialIsFavorited={isFavorited}
              isLoggedIn={!!user}
            />
          </div>
          {product.vendor.vendorVerification?.businessName && (
            <p className="mt-1 text-sm text-ivory0">
              Sold by {product.vendor.vendorVerification.businessName}
            </p>
          )}

          {ratingAggregate._count > 0 && (
            <p className="mt-1 text-sm text-ink/70">
              ★ {ratingAggregate._avg.rating?.toFixed(1)} ({ratingAggregate._count}{" "}
              review{ratingAggregate._count === 1 ? "" : "s"})
            </p>
          )}

          <p className="mt-3 text-2xl font-semibold text-chestnut">
            {formatNaira(product.priceInSmallestUnit)}
          </p>

          <p className="mt-1 text-sm text-ivory0">
            {product.stockQuantity > 0
              ? `${product.stockQuantity} in stock`
              : "Out of stock"}
          </p>

          <p className="mt-4 whitespace-pre-line text-sm text-ink">
            {product.description}
          </p>

          {product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-chestnut/10 px-2.5 py-1 text-xs text-ink/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <AddToCartButton
            productId={product.id}
            stockQuantity={product.stockQuantity}
          />
        </div>
      </div>

      <div className="mt-10 border-t border-chestnut/10 pt-6">
        <h2 className="text-lg font-semibold text-jet">
          Reviews {ratingAggregate._count > 0 && `(${ratingAggregate._count})`}
        </h2>

        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-ivory0">
            No reviews yet for this product.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-chestnut/10 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-jet">
                    {review.buyer.firstName}
                  </span>
                  <span className="text-sm text-amber-600">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-ink/70">{review.comment}</p>
                <p className="mt-1.5 text-xs text-ink/40">
                  {review.createdAt.toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
