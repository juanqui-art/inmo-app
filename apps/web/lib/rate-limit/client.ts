/**
 * UPSTASH REDIS RATE LIMITER CLIENT
 *
 * Creates and manages rate limiter instances for different tiers.
 *
 * Features:
 * - Lazy initialization (connects only when needed)
 * - Singleton pattern for Redis client
 * - Graceful degradation if Redis unavailable
 * - In-memory cache for rate limiter instances
 * - Analytics enabled for Upstash dashboard
 *
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@repo/env";
import { logger } from "@/lib/utils/logger";
import { RATE_LIMIT_CONFIGS, type RateLimitTier } from "./config";

// Singleton Redis client (lazy initialization)
let redisClient: Redis | null = null;
let redisInitialized = false;

/**
 * Get or create Redis client
 *
 * Returns null if credentials not configured, allowing graceful degradation.
 * Logs warning on first call if not configured.
 */
function getRedisClient(): Redis | null {
  // Return cached client if already initialized
  if (redisInitialized) {
    return redisClient;
  }

  redisInitialized = true;

  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;

  // Check if credentials are configured
  if (!url || !token) {
    logger.warn(
      { component: "rate-limit" },
      "Upstash Redis credentials not configured - rate limiting disabled"
    );
    return null;
  }

  try {
    redisClient = new Redis({ url, token });
    logger.info(
      { component: "rate-limit" },
      "Upstash Redis client initialized successfully"
    );
    return redisClient;
  } catch (error) {
    logger.error(
      { err: error, component: "rate-limit" },
      "Failed to initialize Upstash Redis client"
    );
    return null;
  }
}

// Cache for rate limiter instances (one per tier)
const rateLimiters = new Map<RateLimitTier, Ratelimit>();

/**
 * Get or create a rate limiter for a specific tier
 *
 * Uses sliding window algorithm for smoother rate limiting.
 * Returns null if Redis is not available.
 *
 * @param tier - The rate limit tier to get limiter for
 */
export function getRateLimiter(tier: RateLimitTier): Ratelimit | null {
  // Check cache first
  const cached = rateLimiters.get(tier);
  if (cached) return cached;

  const redis = getRedisClient();
  if (!redis) return null;

  const config = RATE_LIMIT_CONFIGS[tier];

  // Create rate limiter with sliding window algorithm
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    prefix: `@inmoapp/ratelimit/${tier}`,
    // In-memory cache for performance (reduces Redis calls)
    ephemeralCache: new Map(),
    // Enable analytics for Upstash dashboard monitoring
    analytics: true,
  });

  rateLimiters.set(tier, ratelimit);
  return ratelimit;
}

/**
 * Check if rate limiting is available
 *
 * Returns true if Redis client is configured and initialized.
 * Useful for conditional logic in Server Actions.
 */
export function isRateLimitingEnabled(): boolean {
  return getRedisClient() !== null;
}

/**
 * Clear rate limiter cache (useful for testing)
 */
export function clearRateLimiterCache(): void {
  rateLimiters.clear();
  redisClient = null;
  redisInitialized = false;
}
