import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { AdminProductToggle } from "@/components/admin/AdminProductToggle";

function formatNaira(priceInSmallestUnit: number) {
  return `₦${(priceInSmallestUnit / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;
}

export default async function AdminProductsPage() {
  const admin = await getCurrentUser();

  if (!admin) {
    redirect("/login");
  }
  if (admin.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const products = await prisma.product.findMany({
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

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-semibold text-stone-900">All Products</h1>
      <p className="mt-1 text-sm text-stone-500">{products.length} total listings</p>

      <div className="mt-6 space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-stone-900">{product.name}</p>
              <p className="mt-0.5 text-xs text-stone-500">
                {product.vendor.vendorVerification?.businessName ??
                  `${product.vendor.firstName} ${product.vendor.lastName}`}{" "}
                · {formatNaira(product.priceInSmallestUnit)} ·{" "}
                {product.stockQuantity} in stock
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  product.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {product.isActive ? "Active" : "Hidden"}
              </span>
              <AdminProductToggle
                productId={product.id}
                isActive={product.isActive}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
