/**
 * RATE LIMITING MODULE
 *
 * Provides rate limiting functionality using Upstash Redis.
 *
 * @example
 * ```typescript
 * import { enforceRateLimit, isRateLimitError } from "@/lib/rate-limit";
 *
 * // In a Server Action:
 * try {
 *   await enforceRateLimit({ tier: "auth" });
 * } catch (error) {
 *   if (isRateLimitError(error)) {
 *     return { error: { general: error.message } };
 *   }
 *   throw error;
 * }
 * ```
 */

export type { RateLimitResult } from "./check";
// Check functions
export { checkRateLimitByIP, checkRateLimitByUser } from "./check";

// Client
export {
  clearRateLimiterCache,
  getRateLimiter,
  isRateLimitingEnabled,
} from "./client";
export type { RateLimitConfig, RateLimitTier } from "./config";
// Configuration
export { getRetryAfterSeconds, RATE_LIMIT_CONFIGS } from "./config";
export type {
  EnforceRateLimitOptions,
  RateLimitedResult,
} from "./with-rate-limit";
// HOC and helpers
export {
  enforceRateLimit,
  isRateLimitError,
  RateLimitError,
  withRateLimit,
} from "./with-rate-limit";
