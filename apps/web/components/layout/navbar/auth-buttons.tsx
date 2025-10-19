/**
 * Auth Buttons Component
 *
 * Reusable authentication buttons (Login + CTA)
 * Supports both desktop and mobile variants
 */

"use client";

import Link from "next/link";
import {forwardRef} from "react";

interface AuthButtonsProps {
    variant: "desktop" | "mobile";
    isHomepage?: boolean;
    onNavigate?: () => void;
}

export const AuthButtons = forwardRef<HTMLDivElement, AuthButtonsProps>(
    ({variant   , isHomepage = false, onNavigate}, ref) => {
        if (variant === "desktop") {
            return (
                <div ref={ref} className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                            isHomepage
                                ? "text-white/80 hover:text-white hover:bg-white/10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                                : "text-oslo-gray-300 hover:text-oslo-gray-100 hover:bg-oslo-gray-800"
                        }`}
                    >
                        Ingresar
                    </Link>

                    <Link
                        href="/vender"
                        className={`px-4 py-2 font-semibold rounded-lg transition-all ${
                            isHomepage
                                ? "bg-neutral-800 text-white/80 hover:bg-neutral-800/60 hover:text-white hover:scale-105 shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
                                : "bg-blue-600 text-white hover:bg-blue-500 hover:scale-105"
                        }`}
                    >
                        Publicar anuncio
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

                <Link
                    href="/vender"
                    onClick={onNavigate}
                    className="block w-full px-4 py-3 text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                >
                    Publicar anuncio
                </Link>
            </div>
        );
    }
);

AuthButtons.displayName = "AuthButtons";
