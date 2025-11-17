"use client";

/**
 * AI SEARCH INPUT
 *
 * Input textarea con:
 * - Placeholder descriptivo
 * - Loading spinner
 * - Clear button
 * - Character counter
 * - Búsqueda con Enter (Shift+Enter para newline)
 */

import { Button } from "@repo/ui";
import { Loader, X } from "lucide-react";
import { useState } from "react";

interface AISearchInputProps {
  placeholder?: string;
  autoFocus?: boolean;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function AISearchInput({
  placeholder = "Ej: Casa moderna con 3 habitaciones cerca del centro",
  autoFocus = true,
  onSearch,
  isLoading = false,
}: AISearchInputProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sin Shift = buscar
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
    // Shift+Enter = nueva línea (comportamiento normal del textarea)
  };

  return (
    <div className="space-y-3">
      {/* Input */}
      <div className="relative">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-4 pr-14 rounded-xl border-2 border-oslo-gray-200 dark:border-oslo-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-oslo-gray-800 dark:text-white resize-none transition-colors duration-200"
          rows={3}
          maxLength={200}
          disabled={isLoading}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute right-4 top-4">
            <Loader className="w-5 h-5 animate-spin text-indigo-500" />
          </div>
        )}

        {/* Clear Button */}
        {!isLoading && query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-4 text-oslo-gray-400 hover:text-oslo-gray-600 dark:hover:text-oslo-gray-200 transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Character count + Search button */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-oslo-gray-500 dark:text-oslo-gray-400">
          {query.length}/200 caracteres
        </span>
        <Button
          onClick={handleSearch}
          disabled={!query.trim() || isLoading}
          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? "Buscando..." : "Buscar"}
        </Button>
      </div>
    </div>
  );
}
