import Link from "next/link";

export default function VerifyEmailInvalidPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md items-center p-6">
      <div className="w-full rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-lg font-semibold text-red-900">
          Link Expired or Invalid
        </h1>
        <p className="mt-2 text-sm text-red-800">
          This verification link is no longer valid. Log in and request a
          new one from your dashboard.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-xl bg-jet px-4 py-2 text-sm font-semibold text-ivory hover:bg-chestnut"
        >
          Log In
        </Link>
      </div>
    </main>
  );
}
