"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useClickOutside } from "@/lib/hooks/useClickOutside";
import { ShopIcon, HeartIcon, CartIcon, OrdersIcon } from "@/components/layout/MenuIcons";

interface HamburgerMenuProps {
  isLoggedIn: boolean;
}

export function HamburgerMenu({ isLoggedIn }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Menu"
        aria-expanded={isOpen}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-chestnut/15 text-ink transition-colors hover:bg-ivory sm:h-8 sm:w-8"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-48 rounded-2xl border border-chestnut/10 bg-white p-2 shadow-lg">
          <MenuLink href="/products" icon={<ShopIcon />} onClick={() => setIsOpen(false)}>
            Shop
          </MenuLink>
          {isLoggedIn && (
            <>
              <MenuLink href="/favorites" icon={<HeartIcon />} onClick={() => setIsOpen(false)}>
                Favorites
              </MenuLink>
              <MenuLink href="/cart" icon={<CartIcon />} onClick={() => setIsOpen(false)}>
                Cart
              </MenuLink>
              <MenuLink href="/orders" icon={<OrdersIcon />} onClick={() => setIsOpen(false)}>
                Orders
              </MenuLink>
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
