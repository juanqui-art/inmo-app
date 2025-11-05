/**
 * Structured logger using Pino
 *
 * Features:
 * - Structured JSON logs in production
 * - Pretty-printed logs in development
 * - Automatic context tracking (requestId, userId, etc.)
 * - Integration with error classes
 */

import pino from 'pino';
import type { Logger as PinoLogger } from 'pino';

/**
 * Logger context that can be attached to each log
 */
export interface LogContext {
  requestId?: string;
  userId?: string;
  action?: string;
  [key: string]: unknown;
}

/**
 * Create a Pino logger instance
 */
function createLogger(): PinoLogger {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return pino({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

    // Pretty print in development
    transport: isDevelopment
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        }
      : undefined,

    // Base fields for all logs
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

    // Redact sensitive fields
    redact: {
      paths: [
        'password',
        'token',
        'apiKey',
        'secret',
        'authorization',
        '*.password',
        '*.token',
        '*.apiKey',
        '*.secret',
      ],
      censor: '[REDACTED]',
    },
  });
}

/**
 * Global logger instance
 */
const logger = createLogger();

/**
 * Create a child logger with additional context
 */
export function createChildLogger(context: LogContext): PinoLogger {
  return logger.child(context);
}

/**
 * Logger wrapper with convenience methods
 */
export class Logger {
  private logger: PinoLogger;

  constructor(context?: LogContext) {
    this.logger = context ? createChildLogger(context) : logger;
  }

  /**
   * Debug level - detailed information for diagnosing problems
   */
  debug(message: string, data?: Record<string, unknown>) {
    this.logger.debug(data, message);
  }

  /**
   * Info level - general informational messages
   */
  info(message: string, data?: Record<string, unknown>) {
    this.logger.info(data, message);
  }

  /**
   * Warn level - warning messages for potentially harmful situations
   */
  warn(message: string, data?: Record<string, unknown>) {
    this.logger.warn(data, message);
  }

  /**
   * Error level - error events that might still allow the app to continue
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
    if (error instanceof Error) {
      this.logger.error({ err: error, ...data }, message);
    } else {
      this.logger.error({ error, ...data }, message);
    }
  }

  /**
   * Fatal level - very severe errors that will presumably lead the app to abort
   */
  fatal(message: string, error?: Error | unknown, data?: Record<string, unknown>) {
    if (error instanceof Error) {
      this.logger.fatal({ err: error, ...data }, message);
    } else {
      this.logger.fatal({ error, ...data }, message);
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    childLogger.logger = this.logger.child(context);
    return childLogger;
  }

  /**
   * Get the underlying Pino logger (for advanced use cases)
   */
  getPinoLogger(): PinoLogger {
    return this.logger;
  }
}

/**
 * Default logger instance
 */
export const defaultLogger = new Logger();

/**
 * Convenience exports for direct usage
 */
export const debug = defaultLogger.debug.bind(defaultLogger);
export const info = defaultLogger.info.bind(defaultLogger);
export const warn = defaultLogger.warn.bind(defaultLogger);
export const error = defaultLogger.error.bind(defaultLogger);
export const fatal = defaultLogger.fatal.bind(defaultLogger);

/**
 * Helper to create a logger for a specific module/action
 */
export function createLogger(context: LogContext): Logger {
  return new Logger(context);
}

/**
 * Example usage:
 *
 * // Simple logging
 * import { info, error } from '@repo/shared/logger';
 * info('User logged in', { userId: '123' });
 * error('Failed to save property', new Error('DB error'), { propertyId: 'abc' });
 *
 * // With context
 * import { createLogger } from '@repo/shared/logger';
 * const logger = createLogger({ requestId: '123', userId: 'user-456' });
 * logger.info('Processing request');
 * logger.error('Request failed', error);
 *
 * // Class-based
 * import { Logger } from '@repo/shared/logger';
 * class PropertyService {
 *   private logger = new Logger({ service: 'PropertyService' });
 *
 *   async createProperty() {
 *     this.logger.info('Creating property');
 *   }
 * }
 */
