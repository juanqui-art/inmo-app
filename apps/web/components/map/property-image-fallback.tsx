/**
 * PropertyImageFallback - Placeholder for missing property images
 *
 * PATTERN: Elegant fallback component for map property cards
 *
 * FEATURES:
 * - Icon + Text display
 * - Matches card styling
 * - Consistent with design system
 * - Responsive and accessible
 */

import { ImageOff } from "lucide-react";

interface PropertyImageFallbackProps {
  title?: string;
  className?: string;
}

/**
 * PropertyImageFallback Component
 *
 * Displays a professional placeholder when property images are unavailable.
 * Uses gradient background consistent with card design system.
 */
export function PropertyImageFallback({
  className = "",
}: PropertyImageFallbackProps) {
  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br from-oslo-gray-700 via-oslo-gray-800 to-oslo-gray-900 flex flex-col items-center justify-center ${className}`}
    >
      {/* Icon */}
      <ImageOff className="w-12 h-12 text-oslo-gray-400 mb-2" />

      {/* Text */}
      <p className="text-oslo-gray-300 text-sm font-medium text-center px-4">
        Sin imagen disponible
      </p>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_25%,rgba(68,68,68,.2)_50%,transparent_50%,transparent_75%,rgba(68,68,68,.2)_75%,rgba(68,68,68,.2))] bg-[length:60px_60px]" />
    </div>
  );
}
