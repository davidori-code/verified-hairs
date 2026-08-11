import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { OrderItemStatusControl } from "@/components/vendor/OrderItemStatusControl";

function formatNaira(priceInSmallestUnit: number) {
  return `₦${(priceInSmallestUnit / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

export default async function VendorOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "VENDOR") {
    redirect("/dashboard");
  }

  const orderItems = await prisma.orderItem.findMany({
    where: { vendorId: user.id },
    include: {
      order: {
        select: {
          id: true,
          deliveryAddress: true,
          deliveryPhone: true,
          createdAt: true,
          buyer: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
  });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold text-stone-900">Incoming Orders</h1>

      {orderItems.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
          No orders yet.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orderItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    {item.productNameAtPurchase} × {item.quantity}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    Ordered by {item.order.buyer.firstName}{" "}
                    {item.order.buyer.lastName} ·{" "}
                    {item.order.createdAt.toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[item.status]}`}
                >
                  {item.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-stone-600">
                {formatNaira(item.priceAtPurchase * item.quantity)}
              </p>

              <div className="mt-2 rounded-lg bg-stone-50 p-2 text-xs text-stone-600">
                <p className="font-medium text-stone-700">Deliver to:</p>
                <p>{item.order.deliveryAddress}</p>
                <p>{item.order.deliveryPhone}</p>
              </div>

              <div className="mt-3">
                <OrderItemStatusControl
                  orderItemId={item.id}
                  currentStatus={item.status}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
