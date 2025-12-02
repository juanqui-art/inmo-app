/**
 * Structured Logger with Pino + Sentry Integration
 *
 * Provides structured JSON logging with:
 * - Request ID tracking
 * - Contextual metadata
 * - Environment-aware behavior
 * - Pretty printing in development
 * - JSON output in production
 * - Automatic Sentry error reporting
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/utils/logger';
 *
 * // Simple logging
 * logger.debug("Dev-only message");
 * logger.info("Important info");
 * logger.warn("Warning message");
 * logger.error("Error occurred"); // Also sent to Sentry
 *
 * // With context (object first, message second - Pino style)
 * logger.info({ userId: "123", action: "login" }, "User logged in");
 *
 * // Or message first, object second (backward compatibility)
 * logger.info("User logged in", { userId: "123", action: "login" });
 *
 * // With error object (automatically reported to Sentry)
 * logger.error({ err: error }, "Failed to process request");
 *
 * // Create child logger with context
 * const childLogger = logger.child({ requestId: "abc-123" });
 * childLogger.info("Processing request");
 * ```
 */

import pino from "pino";
import * as Sentry from "@sentry/nextjs";

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

/**
 * Create Pino logger instance with appropriate configuration
 */
const pinoLogger = pino({
	level: isTest ? "silent" : isDevelopment ? "debug" : "info",

	// Development: Pretty print to console
	// Production: JSON output
	...(isDevelopment && !isTest
		? {
				transport: {
					target: "pino-pretty",
					options: {
						colorize: true,
						translateTime: "HH:MM:ss",
						ignore: "pid,hostname",
						singleLine: false,
					},
				},
		  }
		: {}),

	// Base configuration
	base: {
		env: process.env.NODE_ENV,
	},

	// Format timestamps
	timestamp: pino.stdTimeFunctions.isoTime,

	// Serialize errors properly
	serializers: {
		err: pino.stdSerializers.err,
		error: pino.stdSerializers.err,
	},
});

/**
 * Helper to normalize log arguments
 * Supports both: (msg, obj) and (obj, msg) patterns
 */
function normalizeArgs(
	arg1: unknown,
	arg2?: unknown,
): [obj: object, msg: string] {
	// Case 1: Both args present
	if (arg1 !== undefined && arg2 !== undefined) {
		// If first is string, treat as (msg, obj) - swap them
		if (typeof arg1 === "string") {
			const obj = arg2 && typeof arg2 === "object" ? arg2 : { value: arg2 };
			return [obj, arg1];
		}
		// If first is object, treat as (obj, msg) - Pino standard
		if (arg1 && typeof arg1 === "object") {
			const msg = typeof arg2 === "string" ? arg2 : String(arg2);
			return [arg1, msg];
		}
		// Fallback: wrap first arg
		return [{ value: arg1 }, typeof arg2 === "string" ? arg2 : String(arg2)];
	}

	// Case 2: Only one arg
	if (typeof arg1 === "string") {
		return [{}, arg1];
	}
	if (arg1 && typeof arg1 === "object") {
		return [arg1, ""];
	}
	return [{ value: arg1 }, ""];
}

/**
 * Logger wrapper with convenience methods
 */
export const logger = {
	/**
	 * Debug level - Development only
	 * Used for detailed diagnostics (render counts, timings, cache hits, etc)
	 */
	debug: (...args: unknown[]) => {
		const [obj, msg] = normalizeArgs(args[0], args[1]);
		pinoLogger.debug(obj, msg);
	},

	/**
	 * Info level - Important information
	 * Used for general information (component lifecycle, state changes)
	 */
	info: (...args: unknown[]) => {
		const [obj, msg] = normalizeArgs(args[0], args[1]);
		pinoLogger.info(obj, msg);
	},

	/**
	 * Warn level - All environments
	 * Used for warnings that might indicate issues
	 * Sent to Sentry as warnings
	 */
	warn: (...args: unknown[]) => {
		const [obj, msg] = normalizeArgs(args[0], args[1]);
		pinoLogger.warn(obj, msg);

		// Send to Sentry as warning
		if (typeof window !== "undefined" || process.env.NEXT_RUNTIME === "nodejs") {
			Sentry.captureMessage(msg || "Warning", {
				level: "warning",
				extra: obj && typeof obj === "object" ? (obj as Record<string, unknown>) : {},
			});
		}
	},

	/**
	 * Error level - All environments
	 * Used for errors that need attention
	 * Automatically reported to Sentry
	 */
	error: (...args: unknown[]) => {
		const [obj, msg] = normalizeArgs(args[0], args[1]);
		pinoLogger.error(obj, msg);

		// Send to Sentry
		if (typeof window !== "undefined" || process.env.NEXT_RUNTIME === "nodejs") {
			const error = obj && typeof obj === "object" && "err" in obj
				? (obj.err as Error)
				: new Error(msg);

			Sentry.captureException(error, {
				level: "error",
				extra: obj && typeof obj === "object" ? (obj as Record<string, unknown>) : {},
			});
		}
	},

	/**
	 * Create a child logger with additional context
	 * Useful for adding request IDs, user IDs, etc.
	 *
	 * @example
	 * const reqLogger = logger.child({ requestId: "abc-123" });
	 * reqLogger.info("Processing request");
	 */
	child: (bindings: Record<string, unknown>) => {
		return pinoLogger.child(bindings);
	},

	/**
	 * Flush any buffered logs (useful before process exit)
	 */
	flush: async () => {
		return new Promise<void>((resolve) => {
			pinoLogger.flush(() => resolve());
		});
	},
};

/**
 * Create a logger with request context
 * Generates a unique request ID for tracking
 */
export function createRequestLogger() {
	const requestId = crypto.randomUUID();
	return logger.child({ requestId });
}

export default logger;
