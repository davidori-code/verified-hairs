import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/vendor/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "VENDOR") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  // Ownership check: a vendor can only edit their own listings — visiting
  // another vendor's product edit URL directly should look like the page
  // doesn't exist, not reveal that it belongs to someone else.
  if (!product || product.vendorId !== user.id) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-stone-900">Edit Product</h1>
        <div className="mt-6">
          <ProductForm
            existingProduct={{
              id: product.id,
              name: product.name,
              description: product.description,
              priceInSmallestUnit: product.priceInSmallestUnit,
              compareAtPriceInSmallestUnit: product.compareAtPriceInSmallestUnit,
              stockQuantity: product.stockQuantity,
              tags: product.tags,
              images: product.images,
            }}
          />
        </div>
      </div>
    </main>
  );
}
