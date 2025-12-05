/**
 * RATE LIMIT HOC FOR SERVER ACTIONS
 *
 * Provides two ways to add rate limiting to Server Actions:
 *
 * 1. enforceRateLimit() - Simple function that throws on limit exceeded
 *    Best for adding to existing actions with minimal changes
 *
 * 2. withRateLimit() - HOC wrapper for full control
 *    Best for new actions or when you need detailed rate limit info
 *
 * Usage examples:
 *
 * ```typescript
 * // Method 1: enforceRateLimit (recommended for existing actions)
 * export async function myAction() {
 *   await enforceRateLimit({ tier: "auth" }); // Throws if limited
 *   // ... rest of action
 * }
 *
 * // Method 2: withRateLimit HOC
 * const myAction = withRateLimit(
 *   async (input) => { ... },
 *   { tier: "ai-search", getUserId: () => user?.id }
 * );
 * ```
 */

import {
  checkRateLimitByIP,
  checkRateLimitByUser,
  type RateLimitResult,
} from "./check";
import type { RateLimitTier } from "./config";

/**
 * Rate limit error with retry information
 */
export class RateLimitError extends Error {
  public readonly retryAfter?: number;
  public readonly tier: RateLimitTier;

  constructor(message: string, tier: RateLimitTier, retryAfter?: number) {
    super(message);
    this.name = "RateLimitError";
    this.tier = tier;
    this.retryAfter = retryAfter;
  }
}

/**
 * Options for enforceRateLimit
 */
export interface EnforceRateLimitOptions {
  /** User ID for user-based limiting (falls back to IP if not provided) */
  userId?: string | null;
  /** Rate limit tier to apply */
  tier: RateLimitTier;
}

/**
 * Enforce rate limit - throws RateLimitError if limit exceeded
 *
 * This is the simplest way to add rate limiting to existing Server Actions.
 * Just call this at the start of your action and catch the error.
 *
 * @example
 * ```typescript
 * export async function loginAction(formData: FormData) {
 *   try {
 *     await enforceRateLimit({ tier: "auth" });
 *   } catch (error) {
 *     if (error instanceof RateLimitError) {
 *       return { error: { general: error.message } };
 *     }
 *     throw error;
 *   }
 *   // ... rest of login logic
 * }
 * ```
 */
export async function enforceRateLimit(
  options: EnforceRateLimitOptions
): Promise<void> {
  const { userId, tier } = options;

  const result = userId
    ? await checkRateLimitByUser(userId, tier)
    : await checkRateLimitByIP(tier);

  if (!result.allowed) {
    throw new RateLimitError(
      result.error || "Rate limit exceeded",
      tier,
      result.retryAfter
    );
  }
}

/**
 * Check if an error is a RateLimitError
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}

// ============================================================================
// HOC Wrapper (alternative approach)
// ============================================================================

/**
 * Options for withRateLimit HOC
 */
interface WithRateLimitOptions {
  /** Rate limit tier to apply */
  tier: RateLimitTier;

  /**
   * Function to get user ID for user-based limiting.
   * If returns null/undefined, falls back to IP-based limiting.
   */
  getUserId?: () => Promise<string | null | undefined>;

  /**
   * Force IP-based limiting (for auth actions)
   * @default false
   */
  useIP?: boolean;
}

/**
 * Result from a rate-limited action
 */
export interface RateLimitedResult<T> {
  /** Whether the action was blocked by rate limiting */
  rateLimited: boolean;
  /** Rate limit details */
  rateLimit?: {
    limit: number;
    remaining: number;
    retryAfter?: number;
  };
  /** Action result (if not rate limited) */
  data?: T;
  /** Error message (if rate limited) */
  error?: string;
}

/**
 * Wrap a Server Action with rate limiting
 *
 * This HOC provides more control over rate limiting behavior
 * and returns detailed rate limit information.
 *
 * @example
 * ```typescript
 * const searchAction = withRateLimit(
 *   async (query: string) => {
 *     // ... search logic
 *     return { results: [...] };
 *   },
 *   {
 *     tier: "ai-search",
 *     getUserId: async () => {
 *       const user = await getCurrentUser();
 *       return user?.id;
 *     }
 *   }
 * );
 * ```
 */
export function withRateLimit<TInput extends unknown[], TOutput>(
  action: (...args: TInput) => Promise<TOutput>,
  options: WithRateLimitOptions
): (...args: TInput) => Promise<RateLimitedResult<TOutput>> {
  const { tier, getUserId, useIP = false } = options;

  return async (...args: TInput): Promise<RateLimitedResult<TOutput>> => {
    let rateLimitResult: RateLimitResult;

    // Determine limiting strategy
    if (useIP) {
      // IP-based (auth actions)
      rateLimitResult = await checkRateLimitByIP(tier);
    } else if (getUserId) {
      // User-based (authenticated actions)
      const userId = await getUserId();

      if (userId) {
        rateLimitResult = await checkRateLimitByUser(userId, tier);
      } else {
        // No user ID, fall back to IP
        rateLimitResult = await checkRateLimitByIP(tier);
      }
    } else {
      // Default to IP-based
      rateLimitResult = await checkRateLimitByIP(tier);
    }

    // Check if rate limited
    if (!rateLimitResult.allowed) {
      return {
        rateLimited: true,
        rateLimit: {
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          retryAfter: rateLimitResult.retryAfter,
        },
        error: rateLimitResult.error,
      };
    }

    // Execute the action
    const result = await action(...args);

    return {
      rateLimited: false,
      rateLimit: {
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
      },
      data: result,
    };
  };
}
