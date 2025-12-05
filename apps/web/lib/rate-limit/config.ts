/**
 * RATE LIMITING CONFIGURATION
 *
 * Defines rate limits per action type using sliding window algorithm.
 *
 * Limits are defined per:
 * - IP (for unauthenticated actions like login/signup)
 * - User ID (for authenticated actions)
 *
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

import type { Duration } from "@upstash/ratelimit";

export type RateLimitTier =
  | "auth" // Login/Signup - strictest (IP-based)
  | "ai-search" // AI Search - expensive operations (user-based)
  | "property-create" // Property creation (user-based)
  | "appointment" // Appointment booking (user-based)
  | "favorite" // Toggle favorites (user-based)
  | "default"; // Fallback

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Time window (e.g., "1 h", "15 m", "1 d") */
  window: Duration;
  /** Human-readable description for error messages */
  description: string;
}

/**
 * Rate limit configurations per tier
 *
 * Sliding window provides smoother rate limiting than fixed window:
 * - No "burst at window edge" problem
 * - More fair distribution of requests
 */
export const RATE_LIMIT_CONFIGS: Record<RateLimitTier, RateLimitConfig> = {
  // Auth: Strict limits to prevent brute force attacks
  // IP-based to catch attackers before authentication
  auth: {
    limit: 10,
    window: "15 m",
    description: "10 intentos cada 15 minutos",
  },

  // AI Search: Expensive OpenAI API calls ($0.02/request)
  // User-based to allow authenticated users fair access
  "ai-search": {
    limit: 30,
    window: "1 h",
    description: "30 búsquedas por hora",
  },

  // Property creation: Moderate limit (already tier-limited)
  // User-based, acts as secondary protection
  "property-create": {
    limit: 50,
    window: "1 d",
    description: "50 propiedades por día",
  },

  // Appointments: Reasonable booking limit
  // User-based for fair access
  appointment: {
    limit: 20,
    window: "1 d",
    description: "20 citas por día",
  },

  // Favorites: Higher limit for good UX
  // User-based, should not restrict normal usage
  favorite: {
    limit: 100,
    window: "1 h",
    description: "100 favoritos por hora",
  },

  // Default fallback for unspecified actions
  default: {
    limit: 100,
    window: "1 h",
    description: "100 solicitudes por hora",
  },
};

/**
 * Calculate seconds until rate limit reset
 * Used for Retry-After header
 *
 * @param resetTimestamp - Unix timestamp when limit resets
 * @returns Seconds until reset (minimum 0)
 */
export function getRetryAfterSeconds(resetTimestamp: number): number {
  return Math.max(0, Math.ceil((resetTimestamp - Date.now()) / 1000));
}
