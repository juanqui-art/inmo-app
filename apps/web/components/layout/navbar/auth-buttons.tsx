/**
 * Auth Buttons Component
 *
 * Reusable authentication buttons (Login + CTA)
 * Supports both desktop and mobile variants
 */

"use client";

import Link from "next/link";
import { forwardRef } from "react";

interface AuthButtonsProps {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
  // FIX: Added explicit type for aria attributes to improve accessibility
}

export const AuthButtons = forwardRef<HTMLDivElement, AuthButtonsProps>(
  ({ variant, onNavigate }, ref) => {
    if (variant === "desktop") {
      return (
        <div ref={ref} className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-3 py-2 rounded-lg font-semibold transition-all text-white/80 hover:text-white hover:bg-white/10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          >
            Ingresar
          </Link>
        </div>
      );
    }

    // Mobile variant
    return (
      <div className="p-4 border-t border-oslo-gray-800 space-y-3">
        <Link
          href="/login"
          onClick={onNavigate}
          className="block w-full px-4 py-3 text-center text-oslo-gray-100 font-medium border-2 border-oslo-gray-700 rounded-lg hover:bg-oslo-gray-800 transition-colors"
        >
          Ingresar
        </Link>
      </div>
    );
  },
);

AuthButtons.displayName = "AuthButtons";
