import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { ProductForm } from "@/components/vendor/ProductForm";

export default async function NewProductPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "VENDOR") {
    redirect("/dashboard");
  }

  if (!user.isVerified) {
    redirect("/vendor/verification");
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-stone-900">
          Add a Product
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          List a new hair product on the marketplace.
        </p>
        <div className="mt-6">
          <ProductForm />
        </div>
      </div>
    </main>
  );
}
