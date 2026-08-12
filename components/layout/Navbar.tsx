import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { SearchBar } from "@/components/layout/SearchBar";
import { HamburgerMenu } from "@/components/layout/HamburgerMenu";
import { AccountMenu } from "@/components/layout/AccountMenu";

export async function Navbar() {
  const user = await getCurrentUser();

  // "Become a Vendor" only makes sense for guests and buyers — someone
  // who's already a vendor (or an admin) doesn't need to see it.
  const showBecomeVendor = !user || user.role === "BUYER";

  return (
    <header className="border-b border-chestnut/10 bg-ivory">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 p-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-display text-lg font-semibold text-jet"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-honey" />
          Verified Hairs
        </Link>

        <span className="hidden shrink-0 rounded-full bg-honey-light px-3 py-1 text-[11px] font-semibold text-chestnut sm:inline-block">
          🚴 Dispatch Services — Coming Soon
        </span>

        {/* Centralized search — same search that lives on /products, now
            reachable from anywhere. flex-basis-full makes it wrap onto
            its own row on narrow screens instead of disappearing, so it
            stays usable on mobile too. */}
        <div className="order-3 w-full flex-1 sm:order-none sm:w-auto sm:max-w-md">
          <SearchBar size="compact" />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {showBecomeVendor && (
            <Link
              href="/register"
              className="rounded-full bg-jet px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-chestnut"
            >
              Become a Vendor
            </Link>
          )}

          <HamburgerMenu isLoggedIn={!!user} />
          <AccountMenu
            isLoggedIn={!!user}
            role={user?.role}
            isVerified={user?.isVerified}
          />
        </div>
      </nav>

    </header>
  );
}
