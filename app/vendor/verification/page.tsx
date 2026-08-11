import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { VerificationForm } from "@/components/vendor/VerificationForm";
import { VendorTermsGate } from "@/components/vendor/VendorTermsGate";

export default async function VendorVerificationPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "VENDOR") {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="rounded-xl border border-chestnut/10 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-jet">
          Vendor Verification
        </h1>

        {!user.vendorTermsAcceptedAt ? (
          <div className="mt-4">
            <VendorTermsGate />
          </div>
        ) : (
          <VerificationStatus userId={user.id} />
        )}
      </div>
    </main>
  );
}

async function VerificationStatus({ userId }: { userId: string }) {
  const verification = await prisma.vendorVerification.findUnique({
    where: { userId },
  });

  return (
    <>
      {!verification && (
        <>
          <p className="mt-1 text-sm text-ivory0">
            Submit your business details to start selling on Verified Hairs.
          </p>
          <div className="mt-6">
            <VerificationForm />
          </div>
        </>
      )}

      {verification?.status === "PENDING" && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Your application is under review. We&apos;ll notify you once it&apos;s
          been processed.
        </div>
      )}

      {verification?.status === "APPROVED" && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          You&apos;re verified! You can now list products on the marketplace.
        </div>
      )}

      {verification?.status === "REJECTED" && (
        <>
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Your application was not approved.
            {verification.rejectionReason && (
              <p className="mt-1 font-medium">
                Reason: {verification.rejectionReason}
              </p>
            )}
          </div>
          <p className="mt-4 text-sm text-ivory0">
            You can update your details below and resubmit.
          </p>
          <div className="mt-4">
            <VerificationForm
              initialValues={{
                businessName: verification.businessName,
                businessAddress: verification.businessAddress,
              }}
            />
          </div>
        </>
      )}
    </>
  );
}
