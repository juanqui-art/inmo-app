/**
 * Server Action Logging Wrapper
 *
 * Higher-order function that wraps Server Actions with automatic logging.
 *
 * Features:
 * - Automatic input/output logging
 * - Execution timing measurement
 * - Error handling and logging
 * - Request ID tracking
 * - Sentry integration (via logger)
 *
 * Usage:
 * ```typescript
 * import { withLogging } from '@/lib/actions/with-logging';
 *
 * export const myAction = withLogging(
 *   async (input: MyInput) => {
 *     // Your action logic here
 *     return { success: true };
 *   },
 *   { actionName: "myAction" }
 * );
 * ```
 */

import { createRequestLogger } from "@/lib/utils/logger";

interface WithLoggingOptions {
	/**
	 * Name of the action for logging purposes
	 */
	actionName: string;

	/**
	 * Whether to log input data (default: false for security)
	 * Be careful not to log sensitive data like passwords
	 */
	logInput?: boolean;

	/**
	 * Whether to log output data (default: false for security)
	 */
	logOutput?: boolean;

	/**
	 * Custom metadata to include in logs
	 */
	metadata?: Record<string, unknown>;
}

/**
 * Wraps a Server Action with automatic logging
 *
 * @param action - The Server Action function to wrap
 * @param options - Logging configuration options
 * @returns Wrapped Server Action with logging
 */
export function withLogging<TInput extends unknown[], TOutput>(
	action: (...args: TInput) => Promise<TOutput>,
	options: WithLoggingOptions,
): (...args: TInput) => Promise<TOutput> {
	const { actionName, logInput = false, logOutput = false, metadata = {} } = options;

	return async (...args: TInput): Promise<TOutput> => {
		// Create request-scoped logger with requestId
		const reqLogger = createRequestLogger();

		// Start timing
		const startTime = performance.now();

		// Log action start
		reqLogger.info(
			{
				action: actionName,
				...(logInput && { input: args }),
				...metadata,
			},
			`[Server Action] ${actionName} - Start`,
		);

		try {
			// Execute the action
			const result = await action(...args);

			// Calculate execution time
			const duration = Math.round(performance.now() - startTime);

			// Log success
			reqLogger.info(
				{
					action: actionName,
					duration,
					...(logOutput && { output: result }),
					...metadata,
				},
				`[Server Action] ${actionName} - Success (${duration}ms)`,
			);

			return result;
		} catch (error) {
			// Calculate execution time
			const duration = Math.round(performance.now() - startTime);

			// Log error (automatically sent to Sentry)
			reqLogger.error(
				{
					err: error,
					action: actionName,
					duration,
					...(logInput && { input: args }),
					...metadata,
				},
				`[Server Action] ${actionName} - Error (${duration}ms)`,
			);

			// Re-throw the error to preserve original behavior
			throw error;
		}
	};
}

/**
 * Decorator-style wrapper for Server Actions
 *
 * Usage with explicit typing:
 * ```typescript
 * export const myAction = wrapServerAction<[FormData], ActionResult>(
 *   async (formData: FormData) => {
 *     // Your logic
 *     return { success: true };
 *   },
 *   { actionName: "myAction" }
 * );
 * ```
 */
export function wrapServerAction<TInput extends unknown[], TOutput>(
	action: (...args: TInput) => Promise<TOutput>,
	options: WithLoggingOptions,
): (...args: TInput) => Promise<TOutput> {
	return withLogging(action, options);
}

/**
 * Example usage with different configurations
 */

// Example 1: Basic logging (no input/output)
// export const basicAction = withLogging(
//   async (userId: string) => {
//     return { success: true };
//   },
//   { actionName: "basicAction" }
// );

// Example 2: Log input (safe data only)
// export const searchAction = withLogging(
//   async (query: string) => {
//     return { results: [] };
//   },
//   {
//     actionName: "searchAction",
//     logInput: true, // Safe: query is not sensitive
//   }
// );

// Example 3: With custom metadata
// export const deleteAction = withLogging(
//   async (id: string) => {
//     return { success: true };
//   },
//   {
//     actionName: "deleteAction",
//     metadata: { category: "admin", risk: "high" },
//   }
// );

export default withLogging;
