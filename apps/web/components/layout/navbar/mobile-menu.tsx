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
import { Heart, LogOut, PlusCircle, Search, Settings, User, X } from "lucide-react";
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
    <div
      className="fixed inset-0 z-50 bg-neutral-900 flex flex-col animate-in slide-in-from-bottom-5 duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-white/10">
        <span className="font-bold text-xl text-white tracking-tight">
          InmoApp
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          aria-label="Cerrar menú"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content - Centered & Scrollable */}
      <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col justify-center">
        <div
          ref={mobileMenuItemsRef}
          className="flex flex-col gap-4 w-full max-w-lg mx-auto"
        >
          {/* User Greeting (if auth) */}
          {isAuthenticated && user && (
            <div className="mb-6 flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {user.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">Hola, {user.email}</p>
                <p className="text-white/50 text-sm">Bienvenido de vuelta</p>
              </div>
            </div>
          )}

          {/* Search - Primary Action */}
          <Link
            href="/propiedades"
            onClick={onClose}
            className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-98"
          >
            <span className="text-xl font-semibold text-white">Buscar propiedades</span>
            <div className="p-2 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
              <Search className="w-5 h-5 text-white" />
            </div>
          </Link>

          {/* Publish - Highlighted Action */}
          <Link
            href="/vender"
            onClick={onClose}
            className="group flex items-center justify-between p-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all active:scale-98 shadow-lg shadow-indigo-900/20"
          >
            <span className="text-xl font-bold text-white">Publicar propiedad</span>
            <div className="p-2 rounded-full bg-white/20 transition-colors">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
          </Link>

          <div className="h-px bg-white/10 my-2" />

          {/* Navigation Links */}
          <div className="grid grid-cols-1 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 text-white/80 hover:text-white transition-colors text-lg font-medium"
              >
                {link.icon === "heart" && <Heart className="w-5 h-5" />}
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Dashboard Links (if auth) */}
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 text-white/80 hover:text-white transition-colors text-lg font-medium"
                >
                  <User className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/configuracion"
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 text-white/80 hover:text-white transition-colors text-lg font-medium"
                >
                  <Settings className="w-5 h-5" />
                  <span>Configuración</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-white/10">
        <div className="max-w-lg mx-auto space-y-6">
          {isAuthenticated ? (
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-red-400 font-medium hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar sesión</span>
              </button>
            </form>
          ) : (
            <AuthButtons variant="mobile" onNavigate={onClose} />
          )}

          {/* Social Media - Centered */}
          <div className="flex justify-center">
            <SocialLinks variant="mobile" />
          </div>
        </div>
      </div>
    </div>
  );
}
