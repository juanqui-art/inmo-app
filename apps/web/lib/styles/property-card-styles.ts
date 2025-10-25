/**
 * PROPERTY CARD STYLES
 *
 * Consolidated color system for badges and buttons across property cards
 *
 * DESIGN PRINCIPLES:
 * - NO hover effects on badges (causes confusion)
 * - Focus on clear visual hierarchy
 * - Use scale/transform effects for interactive feedback (not color changes)
 * - Glassmorphism for overlays
 *
 * PATTERN: Define colors first, then interactive states
 */

/**
 * Transaction Type Badges (SALE / RENT)
 * Applied to PropertyCardHorizontal and PropertyPopupCompact
 *
 * SALE: Blue - represents purchase/sale
 * RENT: Emerald/Green - represents rental
 */
export const TRANSACTION_BADGE_STYLES = {
  SALE: "bg-blue-500 text-white border-0 font-semibold px-3 py-1 rounded-full backdrop-blur-sm",
  RENT: "bg-emerald-500 text-white border-0 font-semibold px-3 py-1 rounded-full backdrop-blur-sm",
} as const;

/**
 * Category Badge Style
 * Used for property type badges (House, Apartment, Villa, etc.)
 * White overlay with glassmorphism effect
 */
export const CATEGORY_BADGE_STYLE =
  "bg-white/20 text-white backdrop-blur-md border border-white/30 font-semibold px-3 py-1 rounded-full";

/**
 * CTA Button Styles ("Ver Detalles")
 *
 * full: Horizontal card version (displayed over image background)
 *       - Slightly transparent with backdrop blur
 *       - Responds with scale animation on press
 *
 * compact: Compact card version (displayed on white background)
 *          - Solid background
 *          - Responds with scale animation on press
 */
export const CTA_BUTTON_STYLES = {
  full: "bg-blue-500/90 backdrop-blur-md text-oslo-gray-50 dark:text-white/90 font-semibold rounded-lg px-4 py-2 shadow-lg transition-transform active:scale-95 flex-shrink-0",
  compact:
    "w-full bg-blue-600 dark:bg-blue-700 text-white py-2 rounded font-semibold text-sm transition-transform active:scale-95",
} as const;

/**
 * Action Button Base Styles
 * Used for interactive buttons like Heart (favorites), Share, Close
 *
 * Pattern: Scale on hover/press, no color changes
 * Keeps focus on the action, not the button itself
 */
export const ACTION_BUTTON_BASE =
  "transition-transform hover:scale-110 active:scale-95";
