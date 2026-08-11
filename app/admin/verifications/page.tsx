import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { VerificationReviewActions } from "@/components/admin/VerificationReviewActions";

export default async function AdminVerificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const pendingVerifications = await prisma.vendorVerification.findMany({
    where: { status: "PENDING" },
    orderBy: { submittedAt: "asc" },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold text-jet">
        Vendor Verification Queue
      </h1>
      <p className="mt-1 text-sm text-ivory0">
        {pendingVerifications.length} submission
        {pendingVerifications.length === 1 ? "" : "s"} awaiting review.
      </p>

      {pendingVerifications.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-ivory0">
          Nothing to review right now.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {pendingVerifications.map((verification) => (
            <div
              key={verification.id}
              className="rounded-xl border border-chestnut/10 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-jet">
                    {verification.businessName}
                  </p>
                  <p className="text-xs text-ivory0">
                    {verification.user.firstName} {verification.user.lastName} ·{" "}
                    {verification.user.email}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  Pending
                </span>
              </div>

              <p className="mt-2 text-sm text-ink/70">
                {verification.businessAddress}
              </p>

              <a
                href={verification.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-medium text-honey-dark underline"
              >
                View submitted document
              </a>

              <VerificationReviewActions verificationId={verification.id} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
