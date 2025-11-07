'use client'

/**
 * Loading Spinner Component
 *
 * Reusable SVG spinner for loading states across the app
 * - Accessible (ARIA labels, role="status")
 * - Customizable size and color
 * - Smooth CSS animation
 */

interface SpinnerProps {
  /**
   * Size in tailwind units (e.g., "8", "12", "16")
   * @default "8"
   */
  size?: string

  /**
   * Tailwind color class (e.g., "text-white", "text-indigo-500")
   * @default "text-white"
   */
  color?: string

  /**
   * Aria label for screen readers
   * @default "Cargando..."
   */
  ariaLabel?: string
}

export function Spinner({
  size = '8',
  color = 'text-white',
  ariaLabel = 'Cargando...',
}: SpinnerProps) {
  return (
    <svg
      className={`animate-spin h-${size} w-${size} ${color}`}
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
  )
}
