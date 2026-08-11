import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

function formatNaira(priceInSmallestUnit: number) {
  return `₦${(priceInSmallestUnit / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;
}

export default async function CheckoutPage() {
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
            select: { name: true, priceInSmallestUnit: true, stockQuantity: true },
          },
        },
      },
    },
  });

  const items = cart?.items ?? [];

  if (items.length === 0) {
    redirect("/cart");
  }

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.product.priceInSmallestUnit,
    0
  );

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-xl font-semibold text-stone-900">Checkout</h1>

      <div className="mt-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">Order Summary</h2>
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-stone-600">
                {item.product.name} × {item.quantity}
              </span>
              <span className="text-stone-900">
                {formatNaira(item.quantity * item.product.priceInSmallestUnit)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-stone-100 pt-3 text-sm font-semibold">
          <span>Total</span>
          <span>{formatNaira(total)}</span>
        </div>
        <p className="mt-2 text-xs text-stone-500">
          Payment on delivery — no payment is collected online.
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-stone-900">
          Delivery Details
        </h2>
        <div className="mt-4">
          <CheckoutForm />
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-stone-400">
        <Link href="/cart" className="underline">
          Back to cart
        </Link>
      </p>
    </main>
  );
}
