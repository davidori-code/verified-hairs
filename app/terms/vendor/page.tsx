import { VendorTermsContent } from "@/components/vendor/VendorTermsContent";

export default function VendorTermsPage() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-semibold text-stone-900">
        Vendor Terms &amp; Conditions
      </h1>
      <div className="mt-6">
        <VendorTermsContent />
      </div>
    </main>
  );
}
