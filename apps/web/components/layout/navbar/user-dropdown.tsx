/**
 * User Dropdown Component
 *
 * Dropdown menu for authenticated users
 * - User info
 * - Links to Dashboard & Settings
 * - Logout button
 */

"use client";

import type { SafeUser } from "@/lib/auth";
import { LogOut, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface UserDropdownProps {
  user: SafeUser;
}

export function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full transition-all overflow-hidden bg-white/20 hover:bg-white/30 hover:scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] border border-white/40"
        aria-label="Menú de usuario"
        aria-expanded={isOpen}
      >
        {user?.avatar ? (
          <Image
            src={user.avatar}
            alt="Avatar"
            width={40}
            height={40}
            className="w-10 h-10 object-cover"
            unoptimized
          />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-oslo-gray-900/95 backdrop-blur-xl rounded-lg shadow-xl border border-oslo-gray-700/50 z-40">
            <div className="p-3 border-b border-oslo-gray-800">
              <p className="text-sm text-oslo-gray-400">Conectado como</p>
              <p className="text-sm font-medium text-oslo-gray-100 truncate">
                {user?.email}
              </p>
            </div>

            <div className="py-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-2 text-oslo-gray-300 hover:bg-oslo-gray-800 hover:text-oslo-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/configuracion"
                className="flex items-center gap-3 px-4 py-2 text-oslo-gray-300 hover:bg-oslo-gray-800 hover:text-oslo-gray-100 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </Link>
            </div>

            <div className="border-t border-oslo-gray-800 py-2">
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-3 w-full px-4 py-2 text-red-400 hover:bg-oslo-gray-800 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
