"use client";

/**
 * AI SEARCH BUTTON
 *
 * Trigger button para abrir el modal de búsqueda inteligente.
 * Dos variantes: navbar (integrado) y floating (sobre el mapa)
 */

import { Sparkles } from "lucide-react";
import { Button } from "@repo/ui";

interface AISearchButtonProps {
  variant?: "navbar" | "floating";
  showBadge?: boolean;
  onClick: () => void;
}

export function AISearchButton({
  variant = "navbar",
  showBadge = true,
  onClick,
}: AISearchButtonProps) {
  // Navbar variant: integrado en header
  if (variant === "navbar") {
    return (
      <Button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
      >
        <Sparkles className="w-5 h-5" />
        <span className="hidden sm:inline">Buscar con IA</span>
        {showBadge && (
          <span className="ml-1 px-2 py-0.5 bg-white text-blue-600 text-xs font-bold rounded-full">
            Nuevo
          </span>
        )}
      </Button>
    );
  }

  // Floating variant: posicionado sobre el mapa
  return (
    <button
      onClick={onClick}
      className="fixed top-16 left-1/2 -translate-x-1/2 z-40 px-6 py-3 bg-white dark:bg-oslo-gray-900 shadow-2xl rounded-full border border-oslo-gray-200 dark:border-oslo-gray-700 hover:shadow-2xl hover:scale-105 transition-all duration-200 font-semibold flex items-center gap-2"
    >
      <Sparkles className="w-5 h-5 text-blue-500" />
      <span>🤖 Buscar con IA</span>
      {showBadge && (
        <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
          Nuevo
        </span>
      )}
    </button>
  );
}
