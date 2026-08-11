import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { OrderItemReceiveAndReview } from "@/components/orders/OrderItemReceiveAndReview";

function formatNaira(priceInSmallestUnit: number) {
  return `₦${(priceInSmallestUnit / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { review: true } } },
  });

  // Ownership check: a buyer can only see THEIR OWN orders — not just any
  // order ID they happen to guess or find. Admins are the one exception.
  if (!order || (order.buyerId !== user.id && user.role !== "ADMIN")) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="rounded-xl border border-chestnut/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-jet">
            Order Confirmed
          </h1>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status]}`}
          >
            {order.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-ivory0">
          Order #{order.id.slice(-8).toUpperCase()} · Placed{" "}
          {order.createdAt.toLocaleDateString("en-NG", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <div className="mt-6 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="border-b border-chestnut/10 pb-3 last:border-0">
              <div className="flex justify-between text-sm">
                <span className="text-ink/70">
                  {item.productNameAtPurchase} × {item.quantity}
                </span>
                <span className="text-jet">
                  {formatNaira(item.quantity * item.priceAtPurchase)}
                </span>
              </div>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[item.status]}`}
              >
                {item.status}
              </span>
              <OrderItemReceiveAndReview
                orderItemId={item.id}
                status={item.status}
                receivedByBuyer={item.receivedByBuyer}
                hasReview={!!item.review}
              />
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-between border-t border-chestnut/10 pt-3 text-sm font-semibold">
          <span>Total</span>
          <span>{formatNaira(order.totalInSmallestUnit)}</span>
        </div>

        <div className="mt-6 border-t border-chestnut/10 pt-4 text-sm">
          <p className="font-medium text-jet">Delivery to</p>
          <p className="mt-1 text-ink/70">{order.deliveryAddress}</p>
          <p className="text-ink/70">{order.deliveryPhone}</p>
        </div>

        <p className="mt-4 text-xs text-ivory0">
          Payment is collected on delivery.
        </p>
      </div>

      <p className="mt-4 text-center text-sm">
        <Link href="/orders" className="text-honey-dark underline">
          View all orders
        </Link>
      </p>
    </main>
  );
}
