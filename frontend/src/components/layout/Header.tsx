"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const NAV_LINKS = [
  { href: "/", label: "Swap" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/history", label: "History" },
  { href: "/docs", label: "Docs" },
] as const;

const Header = memo(function Header() {
  const navLinks = useMemo(() => NAV_LINKS, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2B2B2B] bg-[#0D0D0D]/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="text-xl font-bold text-[#FF007A]">xSwap</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[#9B9B9B] hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
});

export default Header;
