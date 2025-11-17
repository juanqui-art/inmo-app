"use client";

/**
 * AI SEARCH INLINE BAR
 *
 * Expandable search bar that lives in navbar
 * - Collapsed: Small width (~280px), pill shape
 * - Expanded: ~90% navbar width
 * - Smooth width animation with Motion
 * - Sparkle icon indicates AI
 */

import { Loader, Sparkles, X } from "lucide-react";
import { motion } from "motion/react";

interface AISearchInlineBarProps {
  isFocused: boolean;
  query: string;
  onFocus: () => void;
  onBlur: () => void;
  onClear: () => void;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function AISearchInlineBar({
  isFocused,
  query,
  onFocus,
  onBlur,
  onClear,
  onChange,
  onSearch,
  isLoading = false,
}: AISearchInlineBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      onSearch(query.trim());
    } else if (e.key === "Escape") {
      onBlur();
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <input
        type="text"
        placeholder="Buscar con IA..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        className={`w-full pl-9 py-2.5 pr-10 h-12 rounded-full border-1 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
          isFocused
            ? "border-white/40 bg-white/5"
            : "border-white/30 bg-white/0 hover:bg-white/[0.02]"
        }`}
      />

      {/* Sparkle Icon (left) */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut",
        }}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60"
      >
        <Sparkles className="w-4 h-4" />
      </motion.div>

      {/* Loading Spinner or Clear Button (right) */}
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
        >
          <Loader className="w-4 h-4" />
        </motion.div>
      ) : query ? (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
          type="button"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  );
}
