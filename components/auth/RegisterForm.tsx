"use client";

import { FormEvent, useId, useState } from "react";
import Link from "next/link";

type AccountType = "BUYER" | "VENDOR";

type FieldErrors = Partial<
  Record<"firstName" | "lastName" | "email" | "phone" | "password" | "confirmPassword", string>
>;

const inputClassName =
  "block w-full rounded-xl border border-chestnut/15 bg-white px-4 py-3 text-sm text-ink shadow-sm transition-colors placeholder:text-ink/35 focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/40 disabled:cursor-not-allowed disabled:bg-ivory";

const labelClassName = "mb-1.5 block text-sm font-medium text-ink";

const errorTextClassName = "mt-1.5 text-xs text-red-600";

export function RegisterForm() {
  const formId = useId();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("BUYER");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, password, role: accountType }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.details) {
          setFieldErrors(data.details);
        } else {
          setFormError(data.error ?? "Registration failed. Please try again.");
        }
        return;
      }

      setIsSuccess(true);
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl sm:p-10">
        <h1 className="font-display text-2xl font-semibold text-jet">
          Account created
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Check your email to verify your account, then sign in to get started.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-jet px-6 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-chestnut"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl sm:p-10">
      <h1 className="font-display text-2xl font-semibold text-jet">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Join the trusted marketplace for verified hair products.
      </p>

      <form
        id={formId}
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 space-y-4"
        aria-labelledby={`${formId}-heading`}
      >
        <h2 id={`${formId}-heading`} className="sr-only">
          Registration form
        </h2>

        {formError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${formId}-firstName`} className={labelClassName}>
              First Name
            </label>
            <input
              id={`${formId}-firstName`}
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              aria-required="true"
              aria-invalid={!!fieldErrors.firstName}
              placeholder="Jennifer"
              className={inputClassName}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isSubmitting}
            />
            {fieldErrors.firstName && <p className={errorTextClassName}>{fieldErrors.firstName}</p>}
          </div>

          <div>
            <label htmlFor={`${formId}-lastName`} className={labelClassName}>
              Last Name
            </label>
            <input
              id={`${formId}-lastName`}
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              aria-required="true"
              aria-invalid={!!fieldErrors.lastName}
              placeholder="Daniels"
              className={inputClassName}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isSubmitting}
            />
            {fieldErrors.lastName && <p className={errorTextClassName}>{fieldErrors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor={`${formId}-email`} className={labelClassName}>
            Email Address
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            aria-required="true"
            aria-invalid={!!fieldErrors.email}
            placeholder="you@example.com"
            className={inputClassName}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          {fieldErrors.email && <p className={errorTextClassName}>{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor={`${formId}-phone`} className={labelClassName}>
            Phone Number
          </label>
          <input
            id={`${formId}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            aria-required="true"
            aria-invalid={!!fieldErrors.phone}
            placeholder="+2348100000000"
            className={inputClassName}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isSubmitting}
          />
          {!fieldErrors.phone && (
            <p className="mt-1.5 text-xs text-ink/45">Include the country code, e.g. +2348000000000</p>
          )}
          {fieldErrors.phone && <p className={errorTextClassName}>{fieldErrors.phone}</p>}
        </div>

        <div>
          <label htmlFor={`${formId}-password`} className={labelClassName}>
            Password
          </label>
          <input
            id={`${formId}-password`}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            aria-required="true"
            aria-invalid={!!fieldErrors.password}
            placeholder="Create a strong password"
            className={inputClassName}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
          {fieldErrors.password && <p className={errorTextClassName}>{fieldErrors.password}</p>}
        </div>

        <div>
          <label htmlFor={`${formId}-confirmPassword`} className={labelClassName}>
            Confirm Password
          </label>
          <input
            id={`${formId}-confirmPassword`}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            aria-required="true"
            aria-invalid={!!fieldErrors.confirmPassword}
            placeholder="Re-enter your password"
            className={inputClassName}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
          />
          {fieldErrors.confirmPassword && <p className={errorTextClassName}>{fieldErrors.confirmPassword}</p>}
        </div>

        <fieldset>
          <legend className={labelClassName}>Account Type</legend>
          <div className="mt-1 grid gap-3 sm:grid-cols-2">
            {(["BUYER", "VENDOR"] as const).map((type) => (
              <label
                key={type}
                htmlFor={`${formId}-${type}`}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                  accountType === type
                    ? "border-honey bg-honey-light/40 ring-2 ring-honey/30"
                    : "border-chestnut/15 bg-white hover:border-chestnut/30"
                }`}
              >
                <input
                  id={`${formId}-${type}`}
                  name="accountType"
                  type="radio"
                  value={type}
                  checked={accountType === type}
                  onChange={() => setAccountType(type)}
                  disabled={isSubmitting}
                  className="mt-0.5 size-4 shrink-0 border-chestnut/30 text-honey focus:ring-honey"
                />
                <span>
                  <span className="block text-sm font-medium text-jet">
                    {type === "BUYER" ? "Buyer" : "Vendor"}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink/50">
                    {type === "BUYER"
                      ? "Browse and purchase verified hair products."
                      : "List and sell your hair products on the marketplace."}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-jet py-3.5 text-sm font-semibold text-ivory shadow-sm transition-colors hover:bg-chestnut disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-honey-dark hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
