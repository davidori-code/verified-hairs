import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { CartItemControls } from "@/components/cart/CartItemControls";

function formatNaira(priceInSmallestUnit: number) {
  return `₦${(priceInSmallestUnit / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;
}

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              priceInSmallestUnit: true,
              stockQuantity: true,
              isActive: true,
            },
          },
        },
        orderBy: { addedAt: "asc" },
      },
    },
  });

  const items = cart?.items ?? [];
  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.product.priceInSmallestUnit,
    0
  );

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold text-jet">Your Cart</h1>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-ivory0">
          Your cart is empty.{" "}
          <Link href="/products" className="font-medium text-honey-dark underline">
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-chestnut/10 bg-white p-4 shadow-sm"
              >
                {item.product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-chestnut/10 text-xs text-ink/40">
                    No image
                  </div>
                )}

                <div className="flex-1">
                  <Link
                    href={`/products/${item.product.id}`}
                    className="text-sm font-medium text-jet hover:underline"
                  >
                    {item.product.name}
                  </Link>
                  <p className="mt-1 text-sm text-ivory0">
                    {formatNaira(item.product.priceInSmallestUnit)}
                  </p>
                  {!item.product.isActive && (
                    <p className="mt-1 text-xs text-red-600">
                      This product is no longer available.
                    </p>
                  )}
                  <div className="mt-2">
                    <CartItemControls
                      productId={item.product.id}
                      quantity={item.quantity}
                      stockQuantity={item.product.stockQuantity}
                    />
                  </div>
                </div>

                <p className="text-sm font-medium text-jet">
                  {formatNaira(item.quantity * item.product.priceInSmallestUnit)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-chestnut/10 pt-4">
            <span className="text-sm font-medium text-ink">Total</span>
            <span className="text-lg font-semibold text-jet">
              {formatNaira(total)}
            </span>
          </div>

          {/* Checkout intentionally not wired up yet — next feature after this. */}
          <Link
            href="/checkout"
            className="mt-4 block w-full rounded-xl bg-jet px-4 py-3 text-center text-sm font-semibold text-ivory shadow-sm transition-colors hover:bg-chestnut"
          >
            Proceed to Checkout
          </Link>
        </>
      )}
    </main>
  );
}
