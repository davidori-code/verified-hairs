import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main
      className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gradient-to-br from-jet via-chestnut to-honey-dark p-6"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(250,247,242,0.10) 1px, transparent 1px), linear-gradient(to bottom right, var(--color-jet), var(--color-chestnut), var(--color-honey-dark))",
        backgroundSize: "24px 24px, 100% 100%",
      }}
    >
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl sm:p-10">
        <h1 className="font-display text-2xl font-semibold text-jet">
          Welcome, {user.firstName}
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          You&apos;re logged in as a <span className="font-medium text-ink">{user.role}</span>.
        </p>

        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between border-b border-chestnut/10 pb-2">
            <dt className="text-ink/50">Email</dt>
            <dd className="text-ink">{user.email}</dd>
          </div>
          <div className="flex justify-between border-b border-chestnut/10 pb-2">
            <dt className="text-ink/50">Account verified</dt>
            <dd className="text-ink">{user.isVerified ? "Yes" : "No"}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
