/**
 * PublicHeaderClient - Interactive Header Component
 *
 * Client Component that handles:
 * - Mobile menu toggle
 * - User dropdown menu
 * - Auth-aware navigation
 * - Mobile: Search IA + Filter button integration
 *
 * Receives props from Server Component (PublicHeader)
 *
 * REFACTORED: Now uses separated components for better maintainability
 * UPDATED (Dec 2025): Mobile navbar includes Search IA + Filters for better UX
 */

"use client";

import type { SafeUser } from "@/lib/auth";
import { Home as HomeIcon, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DesktopNav } from "./navbar/desktop-nav";
import { useMobileMenu } from "./navbar/hooks/use-mobile-menu";
import { MobileMenu } from "./navbar/mobile-menu";
import { MobileSearchAndFilters } from "./navbar/mobile-search-filters";

interface PublicHeaderClientProps {
  isAuthenticated: boolean;
  user: SafeUser;
}

export function PublicHeaderClient({
  isAuthenticated,
  user,
}: PublicHeaderClientProps) {
  const pathname = usePathname();
  const isTransparentNavbar = pathname === "/" || pathname === "/vender";
  const mobileMenu = useMobileMenu();

  // Show mobile search/filters only on property pages
  const showMobileSearch =
    pathname === "/propiedades" ||
    pathname === "/comprar" ||
    pathname === "/rentar" ||
    pathname.startsWith("/propiedades");

  return (
    <>
      <header
        data-navbar={isTransparentNavbar ? "homepage" : "pages"}
        className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 shadow-lg shadow-black/20"
      >
        <nav className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-navbar-container="true"
            className="flex items-center justify-between h-14 gap-2"
          >
            {/* Logo */}
            <Link
              href="/"
              data-navbar-logo-icon="true"
              className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              aria-label="Ir a inicio"
            >
              <HomeIcon className="w-5 h-5 text-white" />
            </Link>

            {/* Mobile: Search IA + Filters (only on property pages) */}
            {showMobileSearch && (
              <div className="flex-1 md:hidden">
                <MobileSearchAndFilters />
              </div>
            )}

            {/* Desktop Navigation */}
            <DesktopNav isAuthenticated={isAuthenticated} user={user} />

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={mobileMenu.toggle}
              className="md:hidden flex-shrink-0 p-2 rounded-lg transition-all hover:bg-white/10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              aria-label="Abrir menú"
              aria-expanded={mobileMenu.isOpen}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay - Outside header for proper z-index stacking */}
      <MobileMenu
        isOpen={mobileMenu.isOpen}
        isAuthenticated={isAuthenticated}
        user={user}
        onClose={mobileMenu.close}
      />
    </>
  );
}
