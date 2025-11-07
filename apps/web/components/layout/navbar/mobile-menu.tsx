/**
 * Mobile Menu Component
 *
 * Complete mobile menu overlay
 * - Full-screen overlay with backdrop
 * - Navigation links
 * - User info (if authenticated)
 * - Search, Dashboard, Settings
 * - Auth buttons or logout
 * - Social media links
 */

"use client";

import type { SafeUser } from "@/lib/auth";
import { Heart, LogOut, Search, Settings, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { AuthButtons } from "./auth-buttons";
import { getNavLinks } from "./constants/nav-links";
import { useStaggerAnimation } from "./hooks/use-navbar-animations";
import { SocialLinks } from "./social-links";

interface MobileMenuProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  user: SafeUser;
  onClose: () => void;
}

export function MobileMenu({
  isOpen,
  isAuthenticated,
  user,
  onClose,
}: MobileMenuProps) {
  const mobileMenuItemsRef = useRef<HTMLDivElement>(null);
  const navLinks = getNavLinks(isAuthenticated);

  // Apply stagger animation when menu opens
  useStaggerAnimation(mobileMenuItemsRef, isOpen, "a, button");

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        className="fixed inset-y-0 right-0 w-full max-w-sm bg-oslo-gray-900/95 backdrop-blur-xl z-50 shadow-xl border-l border-oslo-gray-700/50 animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-oslo-gray-800">
            <span className="font-bold text-lg text-oslo-gray-100">Menú</span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-oslo-gray-800 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-6 h-6 text-oslo-gray-300" />
            </button>
          </div>

          {/* User Info (if authenticated) */}
          {isAuthenticated && user && (
            <div className="p-4 border-b border-oslo-gray-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-oslo-gray-800 border border-oslo-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="Avatar"
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="w-6 h-6 text-oslo-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-oslo-gray-100">
                  Mi cuenta
                </p>
                <p className="text-xs text-oslo-gray-400">Conectado</p>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div
            ref={mobileMenuItemsRef}
            className="flex flex-col p-4 gap-1 flex-1"
          >
            {/* Search - First priority on mobile */}
            <Link
              href="/propiedades"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-oslo-gray-100 font-medium hover:bg-oslo-gray-800 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
              <span>Buscar propiedades</span>
            </Link>

            {/* Main nav links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-oslo-gray-100 font-medium hover:bg-oslo-gray-800 rounded-lg transition-colors"
              >
                {link.icon === "heart" && <Heart className="w-5 h-5" />}
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Dashboard link (if authenticated) */}
            {isAuthenticated && (
              <>
                <div className="h-px bg-oslo-gray-800 my-2" />
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-oslo-gray-100 font-medium hover:bg-oslo-gray-800 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/configuracion"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-oslo-gray-100 font-medium hover:bg-oslo-gray-800 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Configuración</span>
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons / Logout */}
          {isAuthenticated ? (
            <div className="p-4 border-t border-oslo-gray-800">
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-center text-red-400 font-medium border-2 border-red-400/30 rounded-lg hover:bg-red-400/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar sesión</span>
                </button>
              </form>
            </div>
          ) : (
            <AuthButtons variant="mobile" onNavigate={onClose} />
          )}

          {/* Social Media Links */}
          <SocialLinks variant="mobile" />
        </div>
      </div>
    </>
  );
}
