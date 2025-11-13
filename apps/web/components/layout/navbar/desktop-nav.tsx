/**
 * Desktop Navigation Component
 *
 * Complete desktop navigation section
 * - Navigation links
 * - Social media icons
 * - Search button
 * - Auth section (login/signup OR user dropdown)
 * - Favorites dropdown (when authenticated)
 */

"use client";

import type { SafeUser } from "@/lib/auth";
import { Heart } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { AuthButtons } from "./auth-buttons";
import { getNavLinks } from "./constants/nav-links";
import { useMagneticEffect } from "./hooks/use-navbar-animations";
import { SocialLinks } from "./social-links";
import { UserDropdown } from "./user-dropdown";
import { FavoritesDropdown } from "./favorites-dropdown";

interface DesktopNavProps {
  isAuthenticated: boolean;
  user: SafeUser;
}

export function DesktopNav({
  isAuthenticated,
  user,
}: DesktopNavProps) {
  const ctaButtonRef = useRef<HTMLDivElement>(null);
  const navLinks = getNavLinks(isAuthenticated);

  // Magnetic effect disabled (using consistent homepage style)
  useMagneticEffect(ctaButtonRef, false, 0.2);

  return (
    <div className="hidden md:flex items-center gap-6">
      {/* GROUP 1: Navigation Links */}
      <nav className="flex items-center gap-6">
        {navLinks.map((link) => {
          // Special handling for favorites: use dropdown instead of link
          if (link.icon === "heart" && isAuthenticated) {
            return (
              <FavoritesDropdown
                key={link.href}
                className="hover:opacity-80 transition-opacity"
              />
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all text-white/80 hover:text-white hover:bg-white/10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
            >
              {link.icon === "heart" && <Heart className="w-4 h-4" />}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Social Media Icons - Desktop */}
      <SocialLinks variant="desktop" />

      {/* Vertical Divider */}
      <div className="h-6 w-px bg-white/30" />

      {/* Auth Section */}
      {isAuthenticated ? (
        <UserDropdown user={user} />
      ) : (
        <AuthButtons
          ref={ctaButtonRef}
          variant="desktop"
        />
      )}
    </div>
  );
}
