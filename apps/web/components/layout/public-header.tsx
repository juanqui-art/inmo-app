/**
 * PublicHeader - Site-wide Navigation for Public Pages
 *
 * PATTERN: Sticky Header with Responsive Mobile Menu
 *
 * WHY sticky header?
 * - Accessibility: Navigation always available (no scroll back to top)
 * - Conversion: Login/Signup CTAs always visible
 * - UX: Modern expectation (users expect sticky headers)
 * - Industry standard: Zillow, Redfin, Realtor all use sticky
 *
 * ALTERNATIVE 1: Static header (not sticky)
 * ❌ Have to scroll to top for navigation
 * ❌ Lower conversion (CTAs hidden)
 * ✅ Simpler CSS
 * ✅ Slightly better performance
 *
 * ALTERNATIVE 2: Hide on scroll down, show on scroll up
 * ✅ More screen space
 * ✅ Modern pattern
 * ❌ More complex (JavaScript required)
 * ❌ Can be confusing
 *
 * ✅ We chose Always Sticky because:
 * - Simple implementation
 * - Predictable behavior
 * - Better conversion (CTAs visible)
 * - Users expect it
 *
 * MOBILE MENU PATTERN:
 * - Hamburger icon (☰)
 * - Full-screen overlay menu
 * - Animated slide-in
 * - Close button (X)
 *
 * WHY full-screen overlay?
 * - Mobile-first: Large touch targets
 * - Focus: One task at a time
 * - Modern: Common pattern (not slide-out drawer)
 * - Simple: Easy to implement
 *
 * PERFORMANCE:
 * - Mostly static: Logo + links
 * - Small JavaScript: Mobile menu toggle only
 * - No heavy animations
 * - Fast: Minimal DOM
 *
 * PITFALLS:
 * - ⚠️ Sticky header covers content (add margin-top to body)
 * - ⚠️ Mobile menu must trap focus (accessibility)
 * - ⚠️ Don't make header too tall (wastes space)
 * - ⚠️ Ensure z-index is high enough (above all content)
 *
 * RESOURCES:
 * - https://web.dev/css-position-sticky/
 * - https://www.nngroup.com/articles/sticky-headers/
 * - https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */

"use client";

import { Heart, Home as HomeIcon, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  /**
   * Toggle mobile menu
   * ACCESSIBILITY: Locks body scroll when menu is open
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);

    // Prevent body scroll when menu is open
    // WHY? Mobile menu is full-screen overlay, body shouldn't scroll
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  /**
   * Navigation links - Client-focused
   *
   * PATTERN: Action-oriented navigation
   * - Comprar/Rentar: Core property search actions
   * - Favoritos: Engagement + personalization (heart icon)
   *
   * WHY this structure?
   * - Simple: Only 3 core actions
   * - Clear intent: Users know what they'll find
   * - Engagement: Favoritos promotes return visits
   */
  const navLinks = [
    { href: "/propiedades?transactionType=SALE", label: "Comprar" },
    { href: "/propiedades?transactionType=RENT", label: "Rentar" },
    { href: "/favoritos", label: "Favoritos", icon: "heart" },
  ];

  return (
    <header
      className={
        isHomepage
          ? "absolute top-0 left-0 right-0 z-50  "
          : "sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md "
      }
    >
      {/*
        ADAPTIVE HEADER:
        - Homepage: Absolute positioned, floats over hero
        - Other pages: Sticky, solid background

        WHY conditional styling?
        - Homepage: Full-screen hero needs floating header
        - Other pages: Traditional sticky header for consistency
        - Best of both worlds: Immersive landing + functional navigation
      */}

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/*
            HEIGHT: h-16 (4rem / 64px)
            WHY 64px?
            - Not too tall (wastes space)
            - Not too short (hard to tap on mobile)
            - Industry standard (most sites use 56-72px)
            - Comfortable click target (min 44x44px)
          */}

          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center gap-2 font-bold text-xl transition-colors ${
              isHomepage
                ? "text-white hover:text-blue-300 drop-shadow-md"
                : "text-gray-100 hover:text-blue-400"
            }`}
          >
            <HomeIcon className="w-6 h-6" />
            <span>InmoApp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/*
              NAVIGATION STRUCTURE:
              Group 1: Navigation Links (Comprar, Rentar, Favoritos)
              Group 2: Search Icon (visual separator)
              Group 3: Auth Actions (Ingresar, Empezar)

              SPACING:
              - gap-6: Between nav links (consistent)
              - gap-8: Between groups (clear separation)
              - Divider: Visual separator between search and auth
            */}

            {/* GROUP 1: Navigation Links */}
            <nav className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1 font-medium transition-colors ${
                    isHomepage
                      ? "text-white/90 hover:text-white drop-shadow-md"
                      : "text-gray-300 hover:text-gray-100"
                  }`}
                >
                  {link.icon === "heart" && <Heart className="w-4 h-4" />}
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* GROUP 2: Search (visual separator between nav and auth) */}
            <div className="flex items-center">
              <Link
                href="/propiedades"
                className={`p-2 rounded-lg transition-colors ${
                  isHomepage
                    ? "text-white/90 hover:text-white hover:bg-white/10"
                    : "text-gray-300 hover:text-gray-100 hover:bg-gray-800"
                }`}
                aria-label="Buscar propiedades"
              >
                <Search className="w-5 h-5" />
              </Link>
            </div>

            {/* Vertical Divider */}
            <div
              className={`h-6 w-px ${
                isHomepage ? "bg-white/20" : "bg-gray-700"
              }`}
            />

            {/* GROUP 3: Auth Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={`font-medium transition-colors ${
                  isHomepage
                    ? "text-white/90 hover:text-white drop-shadow-md"
                    : "text-gray-300 hover:text-gray-100"
                }`}
              >
                Ingresar
              </Link>

              <Link
                href="/signup"
                className={`px-5 py-2 font-semibold rounded-lg transition-all ${
                  isHomepage
                    ? "bg-white text-gray-900 hover:bg-blue-50 hover:scale-105 shadow-lg"
                    : "bg-blue-600 text-white hover:bg-blue-500"
                }`}
              >
                Empezar
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isHomepage
                ? "hover:bg-white/10 text-white"
                : "hover:bg-gray-800 text-gray-300"
            }`}
            aria-label="Abrir menú"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={toggleMobileMenu}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-gray-900/95 backdrop-blur-xl z-50 shadow-xl border-l border-gray-700/50"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            {/*
              MOBILE MENU DESIGN:
              - fixed: Overlays content
              - inset-y-0 right-0: Full height, slides from right
              - max-w-sm: Max 384px wide (comfortable, not full screen)
              - z-50: Above backdrop (z-40)

              WHY slide from right?
              - Common pattern (iOS, Android use this)
              - Feels natural (swipe from edge)
              - Thumb-friendly (right side on right-handed phones)

              ALTERNATIVE: Slide from left
              - Also common
              - Matches reading direction
              - Choose based on brand preference
            */}

            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <span className="font-bold text-lg text-gray-100">Menú</span>
                <button
                  type="button"
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="w-6 h-6 text-gray-300" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col p-4 gap-1 flex-1">
                {/* Search - First priority on mobile */}
                <Link
                  href="/propiedades"
                  onClick={toggleMobileMenu}
                  className="
                    flex items-center gap-3
                    px-4 py-3
                    text-gray-100 font-medium
                    hover:bg-gray-800
                    rounded-lg
                    transition-colors
                  "
                >
                  <Search className="w-5 h-5" />
                  <span>Buscar propiedades</span>
                </Link>

                {/* Main nav links */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={toggleMobileMenu}
                    className="
                      flex items-center gap-3
                      px-4 py-3
                      text-gray-100 font-medium
                      hover:bg-gray-800
                      rounded-lg
                      transition-colors
                    "
                  >
                    {link.icon === "heart" && <Heart className="w-5 h-5" />}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>

              {/* Auth Buttons */}
              <div className="p-4 border-t border-gray-800 space-y-3">
                <Link
                  href="/login"
                  onClick={toggleMobileMenu}
                  className="
                    block w-full
                    px-4 py-3
                    text-center
                    text-gray-100 font-medium
                    border-2 border-gray-700
                    rounded-lg
                    hover:bg-gray-800
                    transition-colors
                  "
                >
                  Ingresar
                </Link>

                <Link
                  href="/signup"
                  onClick={toggleMobileMenu}
                  className="
                    block w-full
                    px-4 py-3
                    text-center
                    bg-blue-600 hover:bg-blue-500
                    text-white font-semibold
                    rounded-lg
                    transition-colors
                  "
                >
                  Empezar
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

/**
 * DESIGN DECISIONS:
 *
 * 1. Logo Position (left):
 *    - Western reading direction (left to right)
 *    - Expected location (F-pattern eye tracking)
 *    - Click to homepage (universal pattern)
 *
 * 2. Navigation Center:
 *    - Primary actions (Browse properties)
 *    - Most important for users
 *    - Easy to scan
 *
 * 3. Auth Buttons Right:
 *    - Secondary actions
 *    - Expected location
 *    - Sign Up highlighted (primary CTA)
 *
 * 4. Color Hierarchy:
 *    - Logo: Black (brand)
 *    - Nav links: Gray (secondary)
 *    - Login: Gray (tertiary)
 *    - Signup: Blue (primary CTA)
 *
 * 5. Mobile Menu from Right:
 *    - Thumb-friendly (right-handed users)
 *    - Modern pattern (iOS, Android)
 *    - Not full width (shows context behind)
 *
 * ACCESSIBILITY:
 *
 * - Semantic HTML: <header>, <nav>, <button>
 * - ARIA labels: aria-label, aria-expanded, aria-modal
 * - Keyboard: All interactive elements focusable
 * - Focus trap: Menu traps focus when open (TODO)
 * - Screen reader: Announces menu state
 *
 * PERFORMANCE:
 *
 * - Client Component: Needs interactivity (menu toggle)
 * - Small JavaScript: Just menu state
 * - No heavy dependencies
 * - CSS animations: GPU accelerated
 *
 * FUTURE ENHANCEMENTS:
 *
 * 1. Search bar in header:
 *    - Reuse HeroSearchBar component
 *    - Appears on scroll down
 *    - Quick access from any page
 *
 * 2. User dropdown (when logged in):
 *    - Profile icon
 *    - Dropdown menu (Dashboard, Settings, Logout)
 *    - Avatar image
 *
 * 3. Notifications bell:
 *    - New messages
 *    - Property alerts
 *    - Badge with count
 *
 * 4. Language switcher:
 *    - ES / EN toggle
 *    - Flag icons
 *    - Dropdown for more languages
 *
 * 5. Dark mode toggle:
 *    - Moon/Sun icon
 *    - Respects system preference
 *    - Persists in localStorage
 *
 * But keep it simple for MVP: Current header is clean and functional.
 */
