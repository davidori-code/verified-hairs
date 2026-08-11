import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { ProductActiveToggle } from "@/components/vendor/ProductActiveToggle";

function formatNaira(priceInSmallestUnit: number) {
  return `₦${(priceInSmallestUnit / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;
}

export default async function VendorProductsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "VENDOR") {
    redirect("/dashboard");
  }

  const products = await prisma.product.findMany({
    where: { vendorId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-jet">My Products</h1>
        <Link
          href="/vendor/products/new"
          className="rounded-xl bg-jet px-4 py-2 text-sm font-semibold text-ivory shadow-sm transition-colors hover:bg-chestnut"
        >
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-ivory0">
          You haven&apos;t listed any products yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-xl border border-chestnut/10 bg-white shadow-sm"
            >
              {product.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-40 w-full object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-sm font-semibold text-jet">
                  {product.name}
                </h2>
                <p className="mt-1 text-sm text-ivory0">
                  {formatNaira(product.priceInSmallestUnit)}
                </p>
                <p className="mt-1 text-xs text-ink/40">
                  {product.stockQuantity} in stock ·{" "}
                  {product.isActive ? "Active" : "Hidden"}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/vendor/products/${product.id}/edit`}
                    className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs font-medium text-ink hover:bg-ivory"
                  >
                    Edit
                  </Link>
                  <ProductActiveToggle
                    productId={product.id}
                    isActive={product.isActive}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
