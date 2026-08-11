import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
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
        <h1 className="text-xl font-semibold text-stone-900">Your Profile</h1>

        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500">Email</dt>
            <dd className="text-stone-900">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">Account type</dt>
            <dd className="text-stone-900">{user.role}</dd>
          </div>
        </dl>
        <p className="mt-1 text-xs text-stone-400">
          Email can&apos;t be changed here since it&apos;s used to log in.
        </p>

        <div className="mt-6 border-t border-stone-100 pt-6">
          <ProfileForm
            initialFirstName={user.firstName}
            initialLastName={user.lastName}
            initialPhone={user.phone}
          />
        </div>
      </div>
    </main>
  );
}
