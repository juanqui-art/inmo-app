/**
 * Server Action Wrapper with Error Handling & Logging
 *
 * This wrapper provides:
 * - Automatic error handling and logging
 * - Request ID tracking
 * - Structured error responses
 * - Performance monitoring
 * - Integration with custom error classes
 *
 * Usage:
 * export const myAction = withActionHandler(
 *   async (data: MyInput, context: ActionContext) => {
 *     // Your action logic here
 *     return { success: true, data: result };
 *   },
 *   { actionName: 'myAction', requireAuth: true }
 * );
 */

import { createLogger, type LogContext } from '@repo/shared/logger';
import {
  isAppError,
  formatErrorForUser,
  formatErrorForLog,
  ValidationError,
  AuthError,
} from '@repo/shared/errors';
import { getCurrentUser } from '@/lib/auth';
import { nanoid } from 'nanoid';

/**
 * Action context provided to every wrapped action
 */
export interface ActionContext {
  requestId: string;
  userId?: string;
  logger: ReturnType<typeof createLogger>;
}

/**
 * Standard action result format
 */
export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        message: string;
        statusCode: number;
        fieldErrors?: Record<string, string[]>;
      };
    };

/**
 * Options for action wrapper
 */
export interface ActionHandlerOptions {
  /**
   * Name of the action (for logging)
   */
  actionName: string;

  /**
   * Require authentication
   * @default false
   */
  requireAuth?: boolean;

  /**
   * Required user roles
   */
  requiredRoles?: Array<'CLIENT' | 'AGENT' | 'ADMIN'>;

  /**
   * Skip logging (for sensitive actions)
   * @default false
   */
  skipLogging?: boolean;
}

/**
 * Wrap a Server Action with error handling and logging
 */
export function withActionHandler<TInput, TOutput>(
  handler: (input: TInput, context: ActionContext) => Promise<TOutput>,
  options: ActionHandlerOptions
) {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    const startTime = Date.now();
    const requestId = nanoid();

    // Create logger with context
    const logContext: LogContext = {
      requestId,
      action: options.actionName,
    };

    const logger = createLogger(logContext);

    try {
      // Log action start
      if (!options.skipLogging) {
        logger.info('Action started', {
          input: sanitizeInput(input),
        });
      }

      // Check authentication
      let userId: string | undefined;
      if (options.requireAuth || options.requiredRoles) {
        const user = await getCurrentUser();

        if (!user) {
          throw new AuthError('Authentication required');
        }

        userId = user.id;
        logContext.userId = userId;

        // Check roles
        if (options.requiredRoles && !options.requiredRoles.includes(user.role)) {
          throw new AuthError(
            `This action requires one of the following roles: ${options.requiredRoles.join(', ')}`
          );
        }
      }

      // Execute handler
      const result = await handler(input, {
        requestId,
        userId,
        logger,
      });

      // Log success
      const duration = Date.now() - startTime;
      if (!options.skipLogging) {
        logger.info('Action completed successfully', {
          duration,
          hasResult: !!result,
        });
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime;
      logger.error(
        'Action failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          duration,
          errorDetails: formatErrorForLog(error),
        }
      );

      // Format error for user
      const userError = formatErrorForUser(error);

      // Extract field errors if it's a Zod validation error
      let fieldErrors: Record<string, string[]> | undefined;
      if (error instanceof ValidationError && error.context?.fieldErrors) {
        fieldErrors = error.context.fieldErrors as Record<string, string[]>;
      }

      return {
        success: false,
        error: {
          message: userError.message,
          statusCode: userError.statusCode,
          ...(fieldErrors && { fieldErrors }),
        },
      };
    }
  };
}

/**
 * Wrap a form action (for use with useFormState)
 */
export function withFormActionHandler<TOutput>(
  handler: (formData: FormData, context: ActionContext) => Promise<TOutput>,
  options: ActionHandlerOptions
) {
  return async (
    _prevState: unknown,
    formData: FormData
  ): Promise<ActionResult<TOutput>> => {
    return withActionHandler(
      (input: FormData, context: ActionContext) => handler(input, context),
      options
    )(formData);
  };
}

/**
 * Sanitize input for logging (remove sensitive fields)
 */
function sanitizeInput(input: unknown): unknown {
  if (!input || typeof input !== 'object') {
    return input;
  }

  const sensitiveFields = [
    'password',
    'token',
    'apiKey',
    'secret',
    'authorization',
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Example usage:
 *
 * // Simple action
 * export const myAction = withActionHandler(
 *   async (input: { name: string }, context) => {
 *     context.logger.info('Processing', { name: input.name });
 *     return { message: 'Success' };
 *   },
 *   { actionName: 'myAction', requireAuth: true }
 * );
 *
 * // Form action
 * export const myFormAction = withFormActionHandler(
 *   async (formData, context) => {
 *     const name = formData.get('name') as string;
 *     context.logger.info('Processing form', { name });
 *     return { message: 'Success' };
 *   },
 *   { actionName: 'myFormAction', requiredRoles: ['AGENT', 'ADMIN'] }
 * );
 */
