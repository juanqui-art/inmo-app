/**
 * RATE LIMIT CHECKER
 *
 * Utility functions to check rate limits in Server Actions.
 * Supports both IP-based (auth) and user-based (authenticated) limiting.
 *
 * Features:
 * - IP extraction from various proxy headers
 * - User ID-based limiting for authenticated actions
 * - Graceful degradation when Redis unavailable
 * - Structured logging for monitoring
 */

import { headers } from "next/headers";
import { createRequestLogger } from "@/lib/utils/logger";
import { getRateLimiter, isRateLimitingEnabled } from "./client";
import {
  RATE_LIMIT_CONFIGS,
  getRetryAfterSeconds,
  type RateLimitTier,
} from "./config";

export interface RateLimitResult {
  /** Whether the request is allowed to proceed */
  allowed: boolean;
  /** Maximum requests allowed in the window */
  limit: number;
  /** Remaining requests in current window */
  remaining: number;
  /** Seconds until limit resets (for Retry-After header) */
  retryAfter?: number;
  /** Human-readable error message (in Spanish) */
  error?: string;
}

/**
 * Extract client IP from request headers
 *
 * Checks various proxy headers in order of reliability:
 * 1. x-forwarded-for (standard proxy header)
 * 2. x-real-ip (nginx)
 * 3. cf-connecting-ip (Cloudflare)
 * 4. x-vercel-forwarded-for (Vercel)
 */
async function getClientIP(): Promise<string> {
  const headersList = await headers();

  // Check common proxy headers in order of reliability
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    headersList.get("x-vercel-forwarded-for") ||
    "127.0.0.1"; // Fallback for local development

  return ip;
}

/**
 * Check rate limit by IP address
 *
 * Used for unauthenticated actions like login/signup
 * where we need to prevent brute force attacks before authentication.
 *
 * @param tier - Rate limit tier (defaults to "auth")
 */
export async function checkRateLimitByIP(
  tier: RateLimitTier = "auth"
): Promise<RateLimitResult> {
  const reqLogger = createRequestLogger();

  // Graceful degradation if Redis unavailable
  if (!isRateLimitingEnabled()) {
    reqLogger.debug({ tier }, "[RateLimit] Redis unavailable - allowing request");
    return {
      allowed: true,
      limit: RATE_LIMIT_CONFIGS[tier].limit,
      remaining: RATE_LIMIT_CONFIGS[tier].limit,
    };
  }

  const ip = await getClientIP();
  const identifier = `ip:${ip}`;

  return checkRateLimit(identifier, tier, reqLogger);
}

/**
 * Check rate limit by user ID
 *
 * Used for authenticated actions where we want to limit per-user.
 * Falls back to IP-based limiting if user ID not provided.
 *
 * @param userId - User ID to check limit for
 * @param tier - Rate limit tier (defaults to "default")
 */
export async function checkRateLimitByUser(
  userId: string,
  tier: RateLimitTier = "default"
): Promise<RateLimitResult> {
  const reqLogger = createRequestLogger();

  // Graceful degradation if Redis unavailable
  if (!isRateLimitingEnabled()) {
    reqLogger.debug(
      { tier, userId: userId.slice(0, 8) },
      "[RateLimit] Redis unavailable - allowing request"
    );
    return {
      allowed: true,
      limit: RATE_LIMIT_CONFIGS[tier].limit,
      remaining: RATE_LIMIT_CONFIGS[tier].limit,
    };
  }

  const identifier = `user:${userId}`;

  return checkRateLimit(identifier, tier, reqLogger);
}

/**
 * Internal rate limit check implementation
 *
 * @param identifier - Unique identifier (ip:xxx or user:xxx)
 * @param tier - Rate limit tier
 * @param reqLogger - Request logger instance
 */
async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier,
  reqLogger: ReturnType<typeof createRequestLogger>
): Promise<RateLimitResult> {
  const ratelimit = getRateLimiter(tier);

  if (!ratelimit) {
    // Fallback: allow request if limiter not available
    return {
      allowed: true,
      limit: RATE_LIMIT_CONFIGS[tier].limit,
      remaining: RATE_LIMIT_CONFIGS[tier].limit,
    };
  }

  try {
    const { success, limit, remaining, reset, pending } =
      await ratelimit.limit(identifier);

    // Don't await pending in serverless - it's for analytics
    // The promise will resolve in the background
    if (pending) {
      pending.catch((err) => {
        reqLogger.warn(
          { err, tier, identifier: maskIdentifier(identifier) },
          "[RateLimit] Analytics submission failed"
        );
      });
    }

    const config = RATE_LIMIT_CONFIGS[tier];

    if (!success) {
      const retryAfter = getRetryAfterSeconds(reset);

      reqLogger.warn(
        {
          tier,
          identifier: maskIdentifier(identifier),
          limit,
          remaining,
          retryAfter,
        },
        "[RateLimit] Rate limit exceeded"
      );

      return {
        allowed: false,
        limit,
        remaining,
        retryAfter,
        error: `Has excedido el límite de solicitudes (${config.description}). Intenta de nuevo en ${formatRetryTime(retryAfter)}.`,
      };
    }

    reqLogger.debug(
      { tier, remaining, limit },
      "[RateLimit] Request allowed"
    );

    return { allowed: true, limit, remaining };
  } catch (error) {
    // On Redis error, allow request (fail open strategy)
    reqLogger.error(
      { err: error, tier, identifier: maskIdentifier(identifier) },
      "[RateLimit] Redis error - allowing request (fail open)"
    );

    return {
      allowed: true,
      limit: RATE_LIMIT_CONFIGS[tier].limit,
      remaining: RATE_LIMIT_CONFIGS[tier].limit,
    };
  }
}

/**
 * Mask identifier for logging (privacy)
 * Shows only first 8 chars of user IDs
 */
function maskIdentifier(identifier: string): string {
  if (identifier.startsWith("user:")) {
    const userId = identifier.split(":")[1];
    return `user:${userId?.slice(0, 8)}...`;
  }
  return identifier; // IP addresses are fine to log
}

/**
 * Format retry time for user-friendly display
 */
function formatRetryTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} segundos`;
  }
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minuto${minutes > 1 ? "s" : ""}`;
  }
  const hours = Math.ceil(minutes / 60);
  return `${hours} hora${hours > 1 ? "s" : ""}`;
}
