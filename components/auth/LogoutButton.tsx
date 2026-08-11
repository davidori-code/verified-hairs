"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // router.refresh() re-runs the server-side check on whatever page
      // we land on next, so the app immediately "forgets" the old session
      // instead of showing stale logged-in content until a manual reload.
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="rounded-full border border-chestnut/20 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:border-chestnut/40 hover:bg-chestnut/5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoggingOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
