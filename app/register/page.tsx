import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | Verified Hairs",
  description:
    "Join Verified Hairs — the trusted marketplace for premium hair products. Register as a buyer or vendor.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-stone-50">
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-stone-900 transition-colors hover:text-rose-700"
          >
            Verified Hairs
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              Create your account
            </h1>
            <p className="mt-3 text-base leading-relaxed text-stone-600">
              Join the trusted marketplace for verified hair products.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <RegisterForm />
          </div>

          <p className="mt-6 text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-rose-700 underline-offset-4 transition-colors hover:text-rose-800 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
