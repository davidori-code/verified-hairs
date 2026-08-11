import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

function formatNaira(priceInSmallestUnit: number) {
  return `₦${(priceInSmallestUnit / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Run every count/aggregate in parallel rather than one after another —
  // these queries don't depend on each other, so there's no reason to
  // make the page wait for them sequentially.
  const [
    totalBuyers,
    totalVendors,
    verifiedVendors,
    totalProducts,
    activeProducts,
    totalOrders,
    pendingVerifications,
    revenueResult,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "BUYER" } }),
    prisma.user.count({ where: { role: "VENDOR" } }),
    prisma.user.count({ where: { role: "VENDOR", isVerified: true } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.vendorVerification.count({ where: { status: "PENDING" } }),
    // Revenue is only counted from DELIVERED orders — a PENDING or
    // CANCELLED order hasn't actually resulted in a completed sale, so
    // including it would overstate real revenue.
    prisma.order.aggregate({
      where: { status: "DELIVERED" },
      _sum: { totalInSmallestUnit: true },
    }),
  ]);

  const revenue = revenueResult._sum.totalInSmallestUnit ?? 0;

  const stats = [
    { label: "Buyers", value: totalBuyers },
    { label: "Vendors", value: `${verifiedVendors} / ${totalVendors} verified` },
    { label: "Products", value: `${activeProducts} / ${totalProducts} active` },
    { label: "Orders", value: totalOrders },
    { label: "Revenue (Delivered)", value: formatNaira(revenue) },
    { label: "Pending Verifications", value: pendingVerifications },
  ];

  const links = [
    { href: "/admin/verifications", label: "Vendor Verifications" },
    { href: "/admin/users", label: "Manage Users" },
    { href: "/admin/orders", label: "All Orders" },
    { href: "/admin/products", label: "All Products" },
  ];

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-semibold text-jet">Admin Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-chestnut/10 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-ivory0">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold text-jet">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-chestnut/10 bg-white p-4 text-center text-sm font-medium text-ink shadow-sm hover:border-honey hover:text-honey-dark"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
