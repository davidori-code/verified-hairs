import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import type { Role } from "@/app/generated/prisma/client";

/**
 * Like getCurrentUser(), but also checks the user's role. Returns the user
 * if they're logged in AND their role is in the allowed list; otherwise
 * returns null. Callers should treat null as "not allowed" regardless of
 * whether the reason was "not logged in" or "wrong role" — we don't want
 * to leak which one it was to someone probing the API.
 *
 * Usage in an API route:
 *   const user = await requireRole(["VENDOR"]);
 *   if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 */
export async function requireRole(allowedRoles: Role[]) {
  const user = await getCurrentUser();

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return user;
}
