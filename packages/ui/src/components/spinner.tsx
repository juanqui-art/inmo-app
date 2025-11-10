"use client";

/**
 * SPINNER COMPONENT
 *
 * Unified loading spinner with variants for different use cases:
 * - generic: Default spinner for buttons, forms
 * - overlay: Full-page overlay spinner
 * - inline: Inline spinner for list items
 */

import { cn } from "../lib/utils";

export interface SpinnerProps {
  /** Size variant: sm (6), md (8), lg (12) */
  size?: "sm" | "md" | "lg";
  /** Visual variant */
  variant?: "generic" | "overlay" | "inline";
  /** Tailwind color class (e.g., "text-white", "text-indigo-500") */
  color?: string;
  /** ARIA label for screen readers */
  ariaLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Spinner({
  size = "md",
  variant = "generic",
  color = "text-white",
  ariaLabel = "Cargando...",
  className,
}: SpinnerProps) {
  const baseClasses = cn(
    "animate-spin",
    sizeMap[size],
    color,
    className,
  );

  const spinner = (
    <svg
      className={baseClasses}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label={ariaLabel}
    >
      <title>Loading</title>
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Overlay variant - full-page centered spinner
  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  // Inline variant - compact inline spinner
  if (variant === "inline") {
    return <div className="inline-flex items-center justify-center">{spinner}</div>;
  }

  // Generic variant - standalone spinner
  return spinner;
}

export default Spinner;
