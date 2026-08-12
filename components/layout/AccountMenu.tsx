"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClickOutside } from "@/lib/hooks/useClickOutside";
import {
  LoginIcon,
  SignUpIcon,
  DashboardIcon,
  ProfileIcon,
  BadgeCheckIcon,
  BoxIcon,
  OrdersIcon,
  ShieldIcon,
  LogoutIcon,
} from "@/components/layout/MenuIcons";

interface AccountMenuProps {
  isLoggedIn: boolean;
  role?: "BUYER" | "VENDOR" | "ADMIN" | "RIDER";
  isVerified?: boolean;
}

export function AccountMenu({ isLoggedIn, role, isVerified }: AccountMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsOpen(false);
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Account"
        aria-expanded={isOpen}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-chestnut/15 text-ink transition-colors hover:bg-ivory sm:h-8 sm:w-8"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4.5 20c1.5-4 5-6 7.5-6s6 2 7.5 6" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-chestnut/10 bg-white p-2 shadow-lg">
          {!isLoggedIn && (
            <>
              <MenuLink href="/login" icon={<LoginIcon />} onClick={() => setIsOpen(false)}>
                Login
              </MenuLink>
              <MenuLink href="/register" icon={<SignUpIcon />} onClick={() => setIsOpen(false)}>
                Sign up
              </MenuLink>
            </>
          )}

          {isLoggedIn && (
            <>
              <MenuLink href="/dashboard" icon={<DashboardIcon />} onClick={() => setIsOpen(false)}>
                Dashboard
              </MenuLink>
              <MenuLink href="/profile" icon={<ProfileIcon />} onClick={() => setIsOpen(false)}>
                Profile
              </MenuLink>

              {role === "VENDOR" && !isVerified && (
                <MenuLink href="/vendor/verification" icon={<BadgeCheckIcon />} onClick={() => setIsOpen(false)}>
                  Get Verified
                </MenuLink>
              )}

              {role === "VENDOR" && isVerified && (
                <>
                  <MenuLink href="/vendor/products" icon={<BoxIcon />} onClick={() => setIsOpen(false)}>
                    My Products
                  </MenuLink>
                  <MenuLink href="/vendor/orders" icon={<OrdersIcon />} onClick={() => setIsOpen(false)}>
                    Vendor Orders
                  </MenuLink>
                </>
              )}

              {role === "ADMIN" && (
                <MenuLink href="/admin" icon={<ShieldIcon />} onClick={() => setIsOpen(false)}>
                  Admin
                </MenuLink>
              )}

              <div className="my-1 border-t border-chestnut/10" />

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink/80 transition-colors hover:bg-ivory hover:text-jet disabled:opacity-50"
              >
                <span className="text-chestnut"><LogoutIcon /></span>
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  onClick,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink/80 transition-colors hover:bg-ivory hover:text-jet"
    >
      <span className="text-chestnut">{icon}</span>
      {children}
    </Link>
  );
}
