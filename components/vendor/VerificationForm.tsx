"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";

const inputClassName =
  "block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-jet shadow-sm transition-colors placeholder:text-ink/40 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:bg-ivory";

const labelClassName = "mb-1.5 block text-sm font-medium text-ink";

interface VerificationFormProps {
  initialValues?: {
    businessName: string;
    businessAddress: string;
  };
}

export function VerificationForm({ initialValues }: VerificationFormProps) {
  const router = useRouter();

  const [businessName, setBusinessName] = useState(initialValues?.businessName ?? "");
  const [businessAddress, setBusinessAddress] = useState(
    initialValues?.businessAddress ?? ""
  );
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    // The document must finish uploading (to UploadThing) before we can
    // submit the form at all — there's no valid documentUrl otherwise.
    if (!documentUrl) {
      setFormError("Please upload a verification document before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/vendor/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, businessAddress, documentUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(data.error ?? "Submission failed. Please try again.");
        return;
      }

      // Re-fetch the server component (VendorVerificationPage) so it now
      // shows the "pending review" status instead of the form.
      router.refresh();
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {formError}
        </div>
      )}

      <div>
        <label htmlFor="businessName" className={labelClassName}>
          Business Name
        </label>
        <input
          id="businessName"
          type="text"
          required
          placeholder="Jane's Hair Emporium"
          className={inputClassName}
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="businessAddress" className={labelClassName}>
          Business Address
        </label>
        <input
          id="businessAddress"
          type="text"
          required
          placeholder="12 Marina Street, Lagos"
          className={inputClassName}
          value={businessAddress}
          onChange={(e) => setBusinessAddress(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <span className={labelClassName}>Verification Document</span>
        <p className="mb-2 text-xs text-ivory0">
          Upload a government-issued ID or business registration document
          (image or PDF, up to 8MB).
        </p>

        {documentName ? (
          <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <span>{documentName} uploaded</span>
            <button
              type="button"
              onClick={() => {
                setDocumentUrl(null);
                setDocumentName(null);
              }}
              className="text-xs font-medium text-green-700 underline"
            >
              Replace
            </button>
          </div>
        ) : (
          <UploadButton
            endpoint="vendorDocument"
            onClientUploadComplete={(res) => {
              const uploaded = res?.[0];
              if (uploaded) {
                setDocumentUrl(uploaded.ufsUrl ?? uploaded.url);
                setDocumentName(uploaded.name);
                setFormError(null);
              }
            }}
            onUploadError={(error) => {
              setFormError(`Upload failed: ${error.message}`);
            }}
          />
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-jet px-4 py-3 text-sm font-semibold text-ivory shadow-sm transition-colors hover:bg-chestnut focus:outline-none focus:ring-2 focus:ring-honey focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {isSubmitting ? "Submitting..." : "Submit for Verification"}
      </button>
    </form>
  );
}
