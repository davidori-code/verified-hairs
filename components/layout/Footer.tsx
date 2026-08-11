import Link from "next/link";

const linkClass = "text-sm text-ivory/70 transition-colors hover:text-honey";

export function Footer() {
  return (
    <footer className="mt-auto bg-jet">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-5">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-display text-lg font-semibold text-ivory">
              Verified Hairs
            </p>
            <p className="mt-2 text-sm text-ivory/60">
              A marketplace for verified hair vendors and buyers who value
              quality and trust.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-honey">
              Explore
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/products" className={linkClass}>
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/favorites" className={linkClass}>
                  Favorites
                </Link>
              </li>
              <li>
                <Link href="/cart" className={linkClass}>
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/orders" className={linkClass}>
                  Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-honey">
              Sell
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/register" className={linkClass}>
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link href="/vendor/verification" className={linkClass}>
                  Get Verified
                </Link>
              </li>
              <li>
                <Link href="/terms/vendor" className={linkClass}>
                  Vendor Terms
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-honey">
              Support
            </p>
            <ul className="mt-3 space-y-2 text-sm text-ivory/60">
              <li>support@verifiedhairs.app</li>
              <li>Lagos, Nigeria</li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-honey">
              Legal
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/terms/vendor" className={linkClass}>
                  Vendor Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={linkClass}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/*
          Social links are placeholders (href="#") until real profile
          URLs exist — shown for layout completeness, but not wired to
          anywhere yet. Swap the hrefs in when accounts are set up.
        */}
        <div className="mt-10 flex gap-4 border-t border-ivory/10 pt-6">
          {["Instagram", "TikTok", "X"].map((platform) => (
            <a
              key={platform}
              href="#"
              className="text-xs text-ivory/50 transition-colors hover:text-honey"
            >
              {platform}
            </a>
          ))}
        </div>

        {/* Straight, single-line bottom bar: copyright and legal links
            share the same flex row and items-center baseline, so nothing
            drifts out of alignment regardless of content length. */}
        <div className="mt-6 flex flex-col gap-2 border-t border-ivory/10 pt-6 text-xs text-ivory/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Verified Hairs. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms/vendor" className="hover:text-honey">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-honey">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
