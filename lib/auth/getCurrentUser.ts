import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

/**
 * Reads the session cookie, verifies it, and looks up the corresponding
 * user. Returns null if there's no session, an invalid/expired token, or
 * the user no longer exists — callers should treat all of those as
 * "not logged in" rather than distinguishing between them.
 *
 * This will be the building block for protecting future routes/pages, e.g.:
 *   const user = await getCurrentUser();
 *   if (!user) redirect("/login");
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      emailVerified: true,
      vendorTermsAcceptedAt: true,
      status: true,
    },
  });

  // A suspension should take effect immediately — not just block future
  // logins while an already-issued session token keeps working for
  // however long it has left. Treating "suspended" as "not logged in"
  // here closes that gap.
  if (user && !user.status) {
    return null;
  }

  return user;
}
