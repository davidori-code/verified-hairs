"use client";

import { FormEvent, useId, useState } from "react";

type AccountType = "BUYER" | "VENDOR";

type FieldErrors = Partial<
  Record<"firstName" | "lastName" | "email" | "phone" | "password" | "confirmPassword", string>
>;

const inputClassName =
  "block w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm transition-colors placeholder:text-stone-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:cursor-not-allowed disabled:bg-stone-50";

const labelClassName = "mb-1.5 block text-sm font-medium text-stone-700";

const errorTextClassName = "mt-1.5 text-xs text-rose-600";

export function RegisterForm() {
  const formId = useId();

  // Every field is now "controlled" — its value lives in React state, and
  // the input just displays whatever that state currently holds. This is
  // what lets us read the values on submit, reset the form on success, and
  // validate as the user types.
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

    // Client-side check that doesn't need the server at all: do the two
    // password fields match? No point calling the API if they don't.
    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          role: accountType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Our API sends field-specific errors (400) or a single message
        // (409 conflict, 500 server error) — handle both shapes.
        if (response.status === 400 && data.details) {
          setFieldErrors(data.details);
        } else {
          setFormError(data.error ?? "Registration failed. Please try again.");
        }
        return;
      }

      setIsSuccess(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setAccountType("BUYER");
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div
        role="status"
        className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-center"
      >
        <p className="text-sm font-medium text-stone-900">
          Account created successfully.
        </p>
        <p className="mt-1 text-sm text-stone-500">
          You can now sign in with your new account.
        </p>
      </div>
    );
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
      aria-labelledby={`${formId}-heading`}
    >
      <h2 id={`${formId}-heading`} className="sr-only">
        Registration form
      </h2>

      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          {formError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
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
            aria-describedby={fieldErrors.firstName ? `${formId}-firstName-error` : undefined}
            placeholder="Jane"
            className={inputClassName}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isSubmitting}
          />
          {fieldErrors.firstName && (
            <p id={`${formId}-firstName-error`} className={errorTextClassName}>
              {fieldErrors.firstName}
            </p>
          )}
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
            aria-describedby={fieldErrors.lastName ? `${formId}-lastName-error` : undefined}
            placeholder="Doe"
            className={inputClassName}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isSubmitting}
          />
          {fieldErrors.lastName && (
            <p id={`${formId}-lastName-error`} className={errorTextClassName}>
              {fieldErrors.lastName}
            </p>
          )}
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
          aria-describedby={fieldErrors.email ? `${formId}-email-error` : undefined}
          placeholder="you@example.com"
          className={inputClassName}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />
        {fieldErrors.email && (
          <p id={`${formId}-email-error`} className={errorTextClassName}>
            {fieldErrors.email}
          </p>
        )}
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
          aria-describedby={fieldErrors.phone ? `${formId}-phone-error` : `${formId}-phone-hint`}
          placeholder="+15550000000"
          className={inputClassName}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isSubmitting}
        />
        {!fieldErrors.phone && (
          <p id={`${formId}-phone-hint`} className="mt-1.5 text-xs text-stone-500">
            Include the country code, e.g. +15550000000
          </p>
        )}
        {fieldErrors.phone && (
          <p id={`${formId}-phone-error`} className={errorTextClassName}>
            {fieldErrors.phone}
          </p>
        )}
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
          aria-describedby={fieldErrors.password ? `${formId}-password-error` : undefined}
          placeholder="Create a strong password"
          className={inputClassName}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
        />
        {fieldErrors.password && (
          <p id={`${formId}-password-error`} className={errorTextClassName}>
            {fieldErrors.password}
          </p>
        )}
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
          aria-describedby={
            fieldErrors.confirmPassword ? `${formId}-confirmPassword-error` : undefined
          }
          placeholder="Re-enter your password"
          className={inputClassName}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isSubmitting}
        />
        {fieldErrors.confirmPassword && (
          <p id={`${formId}-confirmPassword-error`} className={errorTextClassName}>
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <fieldset>
        <legend className={labelClassName}>Account Type</legend>
        <div className="mt-1 grid gap-3 sm:grid-cols-2">
          <label
            htmlFor={`${formId}-buyer`}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
              accountType === "BUYER"
                ? "border-rose-500 bg-rose-50 ring-2 ring-rose-500/20"
                : "border-stone-200 bg-white hover:border-stone-300"
            }`}
          >
            <input
              id={`${formId}-buyer`}
              name="accountType"
              type="radio"
              value="BUYER"
              checked={accountType === "BUYER"}
              onChange={() => setAccountType("BUYER")}
              disabled={isSubmitting}
              className="mt-0.5 size-4 shrink-0 border-stone-300 text-rose-600 focus:ring-rose-500"
            />
            <span>
              <span className="block text-sm font-medium text-stone-900">
                Buyer
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-stone-500">
                Browse and purchase verified hair products.
              </span>
            </span>
          </label>

          <label
            htmlFor={`${formId}-vendor`}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
              accountType === "VENDOR"
                ? "border-rose-500 bg-rose-50 ring-2 ring-rose-500/20"
                : "border-stone-200 bg-white hover:border-stone-300"
            }`}
          >
            <input
              id={`${formId}-vendor`}
              name="accountType"
              type="radio"
              value="VENDOR"
              checked={accountType === "VENDOR"}
              onChange={() => setAccountType("VENDOR")}
              disabled={isSubmitting}
              className="mt-0.5 size-4 shrink-0 border-stone-300 text-rose-600 focus:ring-rose-500"
            />
            <span>
              <span className="block text-sm font-medium text-stone-900">
                Vendor
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-stone-500">
                List and sell your hair products on the marketplace.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-rose-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 active:bg-rose-900 disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {isSubmitting ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}
