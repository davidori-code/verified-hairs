import Link from "next/link";
import { FavoriteButton } from "@/components/products/FavoriteButton";
import { computeProductBadge, type ProductBadge } from "@/lib/products/computeProductBadge";

function formatNaira(priceInSmallestUnit: number) {
  return `₦${(priceInSmallestUnit / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;
}

interface ProductCardProps {
  id: string;
  name: string;
  priceInSmallestUnit: number;
  compareAtPriceInSmallestUnit?: number | null;
  images: string[];
  businessName?: string | null;
  vendorLocation?: string | null;
  stockQuantity: number;
  tag?: string | null;
  averageRating?: number | null;
  reviewCount?: number;
  badge?: ProductBadge | null;
  isFavorited?: boolean;
  isLoggedIn?: boolean;
}

export function ProductCard({
  id,
  name,
  priceInSmallestUnit,
  compareAtPriceInSmallestUnit,
  images,
  businessName,
  vendorLocation,
  stockQuantity,
  tag,
  averageRating,
  reviewCount = 0,
  badge,
  isFavorited = false,
  isLoggedIn = false,
}: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-chestnut/10 bg-white shadow-sm transition-shadow hover:shadow-md">
      {badge && (
        <span
          className={`absolute left-2 top-2 z-10 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            badge.tone === "honey"
              ? "bg-honey text-jet"
              : "bg-jet/90 text-ivory"
          }`}
        >
          {badge.label}
        </span>
      )}

      <div className="absolute right-2 top-2 z-10">
        <FavoriteButton
          productId={id}
          initialIsFavorited={isFavorited}
          isLoggedIn={isLoggedIn}
        />
      </div>

      <Link href={`/products/${id}`} className="block">
        {/* overflow-hidden on this wrapper + scale on the image itself is
            what makes the zoom stay contained within the card's rounded
            corners instead of spilling out over neighboring content. */}
        <div className="overflow-hidden">
          {images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[0]}
              alt={name}
              className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center bg-ivory text-xs text-ink/40">
              No image
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-jet">{name}</h3>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-ink/50">
            {businessName && <span>{businessName}</span>}
            {businessName && vendorLocation && <span>·</span>}
            {vendorLocation && (
              <span className="truncate" title={vendorLocation}>
                {vendorLocation}
              </span>
            )}
          </div>

          {averageRating !== null && averageRating !== undefined && (
            <div className="mt-1 flex items-center gap-1 text-xs text-ink/60">
              <span className="text-honey-dark">★</span>
              <span>{averageRating.toFixed(1)}</span>
              <span className="text-ink/40">({reviewCount})</span>
            </div>
          )}

          {tag && (
            <span className="mt-1.5 inline-block rounded-full bg-ivory px-2 py-0.5 text-[11px] text-ink/60">
              {tag}
            </span>
          )}

          <div className="mt-2 flex items-baseline gap-2">
            <p className="price text-base font-bold text-jet">
              {formatNaira(priceInSmallestUnit)}
            </p>
            {compareAtPriceInSmallestUnit &&
              compareAtPriceInSmallestUnit > priceInSmallestUnit && (
                <p className="price text-xs text-ink/40 line-through">
                  {formatNaira(compareAtPriceInSmallestUnit)}
                </p>
              )}
          </div>

          <p className="mt-1 text-xs text-ink/50">
            {stockQuantity > 0
              ? `${stockQuantity} unit${stockQuantity === 1 ? "" : "s"} left`
              : "Out of stock"}
          </p>
        </div>
      </Link>
    </div>
  );
}
