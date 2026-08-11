import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { ProductCard } from "@/components/products/ProductCard";
import { SearchBar } from "@/components/layout/SearchBar";
import { getProductCardExtras } from "@/lib/products/getProductCardExtras";
import { computeProductBadge } from "@/lib/products/computeProductBadge";

const browseTypes = [
  { label: "Wigs", tag: "wig" },
  { label: "Bundles", tag: "bundle" },
  { label: "Closures", tag: "closure" },
  { label: "Frontals", tag: "frontal" },
];

const steps = [
  {
    number: "01",
    title: "Browse Verified Vendors",
    description: "Every seller is checked before their first listing goes live.",
  },
  {
    number: "02",
    title: "Add to Cart",
    description: "Save what you love, compare, and build your order.",
  },
  {
    number: "03",
    title: "Pay on Delivery",
    description: "No card details upfront — pay when your order arrives.",
  },
  {
    number: "04",
    title: "Rate & Review",
    description: "Confirm receipt, then share your experience with others.",
  },
];

export default async function HomePage() {
  const [user, featuredProducts] = await Promise.all([
    getCurrentUser(),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 4,
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
              productId: { in: featuredProducts.map((p) => p.id) },
            },
            select: { productId: true },
          })
          .then((rows) => new Set(rows.map((r) => r.productId)))
      : Promise.resolve(new Set<string>()),
    getProductCardExtras(featuredProducts.map((p) => p.id)),
  ]);

  return (
    <main>
      {/* Hero: rounded "crystal" card floating in page padding. Warm
          chestnut-to-honey gradient rather than a heavy black/jet fill —
          keeps the bright, cozy feel while still reading as premium. */}
      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-12 sm:px-16 sm:py-16"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(250,247,242,0.10) 1px, transparent 1px), linear-gradient(to bottom right, var(--color-jet), var(--color-chestnut), var(--color-honey-dark))",
            backgroundSize: "24px 24px, 100% 100%",
          }}
        >
          <h1 className="max-w-xl font-display text-3xl font-semibold italic text-ivory sm:text-5xl">
            Hair worth trusting.
          </h1>
          <p className="mt-3 max-w-md text-ivory/80">
            Shop bundles, wigs, and extensions from vendors who&apos;ve been
            verified before their first sale.
          </p>

          <div className="mt-6 max-w-md">
            <SearchBar size="large" showButton />
          </div>

          <div className="mt-5 flex gap-3">
            <Link
              href="/products"
              className="rounded-full bg-ivory px-5 py-2.5 text-sm font-medium text-jet transition-colors hover:bg-ivory/90"
            >
              Shop the Collection
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-ivory/40 px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:border-ivory/70"
            >
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products — comes right after the hero, so real hair
          products are the next thing a visitor sees after the search
          bar, before anything else. */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-jet">
              New Arrivals
            </h2>
            <Link href="/products" className="text-sm font-medium text-honey-dark">
              See all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {featuredProducts.map((product) => {
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
        </section>
      )}

      {/* Browse by type */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-2xl font-semibold text-jet">
          Browse by Type
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {browseTypes.map((type) => (
            <Link
              key={type.tag}
              href={`/products?q=${type.tag}`}
              className="rounded-2xl border border-chestnut/10 bg-honey-light/50 p-6 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-display text-lg font-medium text-jet">
                {type.label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works — warm cream section instead of a heavy dark block,
          keeping jet reserved for text/footer per the "bright & cozy"
          direction. Honey does the visual heavy-lifting instead. */}
      <section className="bg-honey-light/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-2xl font-semibold text-jet">
            How Verified Hairs Works
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number}>
                <p className="font-display text-3xl font-semibold text-honey-dark">
                  {step.number}
                </p>
                <p className="mt-2 text-sm font-semibold text-jet">
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-ink/60">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
