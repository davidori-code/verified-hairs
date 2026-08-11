import Link from "next/link";

export default function VerifyEmailSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md items-center p-6">
      <div className="w-full rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <h1 className="text-lg font-semibold text-green-900">
          Email Verified
        </h1>
        <p className="mt-2 text-sm text-green-800">
          Your email has been verified. You can now check out and use all
          features of your account.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block rounded-xl bg-jet px-4 py-2 text-sm font-semibold text-ivory hover:bg-chestnut"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}
