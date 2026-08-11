import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { UserStatusToggle } from "@/components/admin/UserStatusToggle";

export default async function AdminUsersPage() {
  const admin = await getCurrentUser();

  if (!admin) {
    redirect("/login");
  }
  if (admin.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isVerified: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-xl font-semibold text-stone-900">Manage Users</h1>
      <p className="mt-1 text-sm text-stone-500">{users.length} total users</p>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-left text-xs text-stone-500">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-stone-100 last:border-0">
                <td className="px-4 py-3 text-stone-900">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-4 py-3 text-stone-600">{u.email}</td>
                <td className="px-4 py-3 text-stone-600">
                  {u.role}
                  {u.role === "VENDOR" && !u.isVerified && (
                    <span className="ml-1 text-xs text-amber-600">(unverified)</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.status
                        ? "bg-green-100 text-green-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {u.status ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.id === admin.id ? (
                    <span className="text-xs text-stone-400">This is you</span>
                  ) : (
                    <UserStatusToggle userId={u.id} status={u.status} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
