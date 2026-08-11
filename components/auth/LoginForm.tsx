"use client";

import { FormEvent, useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputClassName =
  "block w-full rounded-xl border border-chestnut/15 bg-white px-4 py-3 text-sm text-ink shadow-sm transition-colors placeholder:text-ink/35 focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/40 disabled:cursor-not-allowed disabled:bg-ivory";

const labelClassName = "mb-1.5 block text-sm font-medium text-ink";

export function LoginForm() {
  const formId = useId();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error ?? "Login failed. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl sm:p-10">
      <h1 className="font-display text-2xl font-semibold text-jet">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Log in to your Verified Hairs account to continue where you left off.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {formError}
          </div>
        )}

        <div>
          <label htmlFor={`${formId}-email`} className={labelClassName}>
            Email Address
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className={inputClassName}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-password`} className={labelClassName}>
            Password
          </label>
          <div className="relative">
            <input
              id={`${formId}-password`}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              className={`${inputClassName} pr-11`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.5 5.2A10.4 10.4 0 0112 5c5 0 9 4 10 7-.4 1.2-1.2 2.6-2.3 3.8M6.3 6.3C4.4 7.6 3 9.4 2 12c1 3 5 7 10 7 1.3 0 2.5-.3 3.6-.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-chestnut/30 text-honey focus:ring-honey"
          />
          Remember me for 30 days
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-jet py-3.5 text-sm font-semibold text-ivory shadow-sm transition-colors hover:bg-chestnut disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>

        <p className="text-center text-sm text-ink/60">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-honey-dark hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
