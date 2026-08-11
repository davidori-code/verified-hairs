import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { CancelOrderButton } from "@/components/admin/CancelOrderButton";

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

export default async function AdminOrdersPage() {
  const admin = await getCurrentUser();

  if (!admin) {
    redirect("/login");
  }
  if (admin.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { firstName: true, lastName: true, email: true } },
      items: true,
    },
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-semibold text-stone-900">All Orders</h1>
      <p className="mt-1 text-sm text-stone-500">{orders.length} total orders</p>

      <div className="mt-6 space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-sm font-medium text-stone-900 hover:underline"
                >
                  Order #{order.id.slice(-8).toUpperCase()}
                </Link>
                <p className="mt-0.5 text-xs text-stone-500">
                  {order.buyer.firstName} {order.buyer.lastName} ({order.buyer.email})
                  · {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
                  {order.createdAt.toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-stone-900">
                  {formatNaira(order.totalInSmallestUnit)}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
              <div className="mt-3">
                <CancelOrderButton orderId={order.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
