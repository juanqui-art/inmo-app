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

// Configuration
export { RATE_LIMIT_CONFIGS, getRetryAfterSeconds } from "./config";
export type { RateLimitTier, RateLimitConfig } from "./config";

// Client
export { getRateLimiter, isRateLimitingEnabled, clearRateLimiterCache } from "./client";

// Check functions
export { checkRateLimitByIP, checkRateLimitByUser } from "./check";
export type { RateLimitResult } from "./check";

// HOC and helpers
export {
  enforceRateLimit,
  withRateLimit,
  isRateLimitError,
  RateLimitError,
} from "./with-rate-limit";
export type {
  EnforceRateLimitOptions,
  RateLimitedResult,
} from "./with-rate-limit";
