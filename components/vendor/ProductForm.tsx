"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";

const inputClassName =
  "block w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-jet shadow-sm transition-colors placeholder:text-ink/40 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:bg-ivory";

const labelClassName = "mb-1.5 block text-sm font-medium text-ink";

interface ExistingProduct {
  id: string;
  name: string;
  description: string;
  priceInSmallestUnit: number;
  compareAtPriceInSmallestUnit?: number | null;
  stockQuantity: number;
  tags: string[];
  images: string[];
}

interface ProductFormProps {
  // When provided, the form runs in EDIT mode: fields are pre-filled and
  // submitting sends a PATCH to update this specific product instead of
  // creating a new one.
  existingProduct?: ExistingProduct;
}

export function ProductForm({ existingProduct }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = !!existingProduct;

  const [name, setName] = useState(existingProduct?.name ?? "");
  const [description, setDescription] = useState(existingProduct?.description ?? "");
  // Collected from the vendor as a normal Naira amount (e.g. "1500.00"),
  // then converted to kobo (the smallest unit) right before submitting.
  const [priceNaira, setPriceNaira] = useState(
    existingProduct ? (existingProduct.priceInSmallestUnit / 100).toFixed(2) : ""
  );
  // Optional — only filled in when the vendor wants to show a discount.
  const [compareAtPriceNaira, setCompareAtPriceNaira] = useState(
    existingProduct?.compareAtPriceInSmallestUnit
      ? (existingProduct.compareAtPriceInSmallestUnit / 100).toFixed(2)
      : ""
  );
  const [stockQuantity, setStockQuantity] = useState(
    String(existingProduct?.stockQuantity ?? 0)
  );
  const [tagsInput, setTagsInput] = useState(existingProduct?.tags.join(", ") ?? "");
  const [images, setImages] = useState<string[]>(existingProduct?.images ?? []);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (images.length === 0) {
      setFormError("Please upload at least one product image.");
      return;
    }

    const priceValue = Number(priceNaira);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      setFormError("Please enter a valid price.");
      return;
    }
    // Math.round guards against floating-point weirdness like
    // 1500.1 * 100 producing 150009.99999999999 instead of 150010.
    const priceInSmallestUnit = Math.round(priceValue * 100);

    let compareAtPriceInSmallestUnit: number | null = null;
    if (compareAtPriceNaira.trim()) {
      const compareValue = Number(compareAtPriceNaira);
      if (Number.isNaN(compareValue) || compareValue <= 0) {
        setFormError("Please enter a valid original price, or leave it blank.");
        return;
      }
      if (compareValue * 100 <= priceInSmallestUnit) {
        setFormError("Original price must be higher than the current price.");
        return;
      }
      compareAtPriceInSmallestUnit = Math.round(compareValue * 100);
    }

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      name,
      description,
      priceInSmallestUnit,
      compareAtPriceInSmallestUnit,
      stockQuantity: Number(stockQuantity) || 0,
      tags,
      images,
    };

    const url = isEditMode
      ? `/api/vendor/products/${existingProduct.id}`
      : "/api/vendor/products";
    const method = isEditMode ? "PATCH" : "POST";

    setIsSubmitting(true);
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setFormError(
          data.error ?? `Failed to ${isEditMode ? "update" : "create"} product.`
        );
        return;
      }

      router.push("/vendor/products");
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
        <label htmlFor="name" className={labelClassName}>
          Product Name
        </label>
        <input
          id="name"
          type="text"
          required
          placeholder="Brazilian Curly Bundle, 20 inch"
          className={inputClassName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClassName}>
          Description
        </label>
        <textarea
          id="description"
          required
          rows={4}
          placeholder="Describe the product's texture, origin, length, and care instructions..."
          className={inputClassName}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className={labelClassName}>
            Price (₦)
          </label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="15000.00"
            className={inputClassName}
            value={priceNaira}
            onChange={(e) => setPriceNaira(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="compareAtPrice" className={labelClassName}>
            Original Price (₦) <span className="text-ink/40">— optional</span>
          </label>
          <input
            id="compareAtPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="18000.00"
            className={inputClassName}
            value={compareAtPriceNaira}
            onChange={(e) => setCompareAtPriceNaira(e.target.value)}
            disabled={isSubmitting}
          />
          <p className="mt-1.5 text-xs text-ivory0">
            Set this to show a discount badge and strikethrough price.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="stockQuantity" className={labelClassName}>
            Stock Quantity
          </label>
          <input
            id="stockQuantity"
            type="number"
            min="0"
            step="1"
            className={inputClassName}
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label htmlFor="tags" className={labelClassName}>
          Tags
        </label>
        <input
          id="tags"
          type="text"
          placeholder="wig, human hair, curly (comma-separated)"
          className={inputClassName}
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          disabled={isSubmitting}
        />
        <p className="mt-1.5 text-xs text-ivory0">
          Separate tags with commas. These help buyers find your product.
        </p>
      </div>

      <div>
        <span className={labelClassName}>Product Images</span>
        <p className="mb-2 text-xs text-ivory0">
          Upload 1–5 images. The first image is used as the main thumbnail.
        </p>

        {images.length > 0 && (
          <div className="mb-3 grid grid-cols-5 gap-2">
            {images.map((url, index) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-xl border border-chestnut/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                  className="absolute right-1 top-1 rounded-full bg-white/90 px-1.5 text-xs font-bold text-red-700 shadow"
                  aria-label={`Remove image ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < 5 && (
          <UploadButton
            endpoint="productImages"
            onClientUploadComplete={(res) => {
              const urls = res?.map((file) => file.ufsUrl ?? file.url) ?? [];
              setImages((prev) => [...prev, ...urls].slice(0, 5));
              setFormError(null);
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
        {isSubmitting
          ? isEditMode
            ? "Saving changes..."
            : "Creating listing..."
          : isEditMode
            ? "Save Changes"
            : "Create Listing"}
      </button>
    </form>
  );
}
