import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { HamburgerMenu } from "@/components/layout/HamburgerMenu";
import { AccountMenu } from "@/components/layout/AccountMenu";

export async function Navbar() {
  const user = await getCurrentUser();

  // "Become a Vendor" only makes sense for guests and buyers — someone
  // who's already a vendor (or an admin) doesn't need to see it.
  const showBecomeVendor = !user || user.role === "BUYER";

  return (
    <header className="border-b border-chestnut/10 bg-ivory">
      <nav className="mx-auto flex max-w-6xl items-center gap-2 p-3 sm:gap-3 sm:p-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-1.5 font-display text-base font-semibold text-jet sm:gap-2 sm:text-lg"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-honey sm:h-2 sm:w-2" />
          Verified Hairs
        </Link>

        <span className="hidden shrink-0 rounded-full bg-honey-light px-3 py-1 text-[11px] font-semibold text-chestnut lg:inline-block">
          🚴 Dispatch Services — Coming Soon
        </span>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
          {showBecomeVendor && (
            <Link
              href="/register"
              className="rounded-full bg-jet px-2.5 py-1.5 text-xs font-medium text-ivory transition-colors hover:bg-chestnut sm:px-4 sm:py-2 sm:text-sm"
            >
              {/* Shorter label on narrow screens so this button, the logo,
                  and both icon buttons can all fit on a single line without
                  wrapping. */}
              <span className="sm:hidden">Sell</span>
              <span className="hidden sm:inline">Become a Vendor</span>
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
