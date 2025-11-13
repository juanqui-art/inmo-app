/**
 * PublicHeaderClient - Interactive Header Component
 *
 * Client Component that handles:
 * - Mobile menu toggle
 * - User dropdown menu
 * - Auth-aware navigation
 *
 * Receives props from Server Component (PublicHeader)
 *
 * REFACTORED: Now uses separated components for better maintainability
 */

"use client";

import type { SafeUser } from "@/lib/auth";
import { Home as HomeIcon, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DesktopNav } from "./navbar/desktop-nav";
import { useMobileMenu } from "./navbar/hooks/use-mobile-menu";
import { MobileMenu } from "./navbar/mobile-menu";

interface PublicHeaderClientProps {
  isAuthenticated: boolean;
  user: SafeUser;
}

export function PublicHeaderClient({
  isAuthenticated,
  user,
}: PublicHeaderClientProps) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const mobileMenu = useMobileMenu();

  return (
    <header
      data-navbar={isHomepage ? "homepage" : "pages"}
      className="sticky top-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10 shadow-lg shadow-black/20"
    >
      <nav className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div
          data-navbar-container="true"
          className="flex items-center justify-between h-14"
        >
          {/* Logo */}
          <Link
            href="/"
            data-navbar-logo-text="true"
            className="flex items-center gap-2 font-bold text-xl text-white/80 hover:text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          >
            <HomeIcon data-navbar-logo-icon="true" className="w-6 h-6" />
            <span>InmoApp</span>
          </Link>

          {/* Desktop Navigation */}
          <DesktopNav isAuthenticated={isAuthenticated} user={user} />

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={mobileMenu.toggle}
            className="md:hidden p-2 rounded-lg transition-all hover:bg-white/10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            aria-label="Abrir menú"
            aria-expanded={mobileMenu.isOpen}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={mobileMenu.isOpen}
        isAuthenticated={isAuthenticated}
        user={user}
        onClose={mobileMenu.close}
      />
    </header>
  );
}
