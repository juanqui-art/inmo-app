/**
 * Logger Utility
 *
 * Provides a clean abstraction over console methods with environment awareness.
 * - In development: All logs are shown (debug, info, warn, error)
 * - In production: Only error and warn are shown
 *
 * Usage:
 * import { logger } from '@/lib/utils/logger';
 *
 * logger.debug("Dev-only message"); // Hidden in production
 * logger.info("Important info"); // Hidden in production
 * logger.warn("Warning message"); // Shown everywhere
 * logger.error("Error message"); // Shown everywhere
 *
 * Benefits:
 * - Centralized control over logging behavior
 * - Easy to disable in production
 * - Smaller bundle size (no debug logs in prod)
 * - Better performance (less console.log overhead)
 */

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  /**
   * Debug level - Development only
   * Used for detailed diagnostics (render counts, timings, cache hits, etc)
   */
  debug: isDevelopment ? console.log : () => {},

  /**
   * Info level - Development only
   * Used for general information (component lifecycle, state changes)
   */
  info: isDevelopment ? console.log : () => {},

  /**
   * Warn level - All environments
   * Used for warnings that might indicate issues
   */
  warn: console.warn,

  /**
   * Error level - All environments
   * Used for errors that need attention
   */
  error: console.error,
};

export default logger;
