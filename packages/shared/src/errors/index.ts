/**
 * Custom error classes for structured error handling
 *
 * These classes extend the native Error class and add:
 * - Type discrimination (for type-safe error handling)
 * - Status codes (for HTTP responses)
 * - Additional context (for debugging)
 */

/**
 * Base class for all application errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}

/**
 * Validation error (e.g., invalid form data, Zod validation failure)
 * Status: 400 Bad Request
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, true, context);
  }
}

/**
 * Authentication error (e.g., invalid credentials, expired token)
 * Status: 401 Unauthorized
 */
export class AuthError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 401, true, context);
  }
}

/**
 * Permission/Authorization error (e.g., user doesn't have access)
 * Status: 403 Forbidden
 */
export class PermissionError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 403, true, context);
  }
}

/**
 * Resource not found error
 * Status: 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 404, true, context);
  }
}

/**
 * Conflict error (e.g., duplicate resource, race condition)
 * Status: 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 409, true, context);
  }
}

/**
 * Rate limit exceeded error
 * Status: 429 Too Many Requests
 */
export class RateLimitError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 429, true, context);
  }
}

/**
 * External service error (e.g., third-party API failure)
 * Status: 502 Bad Gateway
 */
export class ExternalServiceError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 502, true, context);
  }
}

/**
 * Database error (e.g., connection failure, query timeout)
 * Status: 500 Internal Server Error
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 500, true, context);
  }
}

/**
 * Storage error (e.g., Supabase Storage failure, file upload error)
 * Status: 500 Internal Server Error
 */
export class StorageError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 500, true, context);
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Helper to format error for logging
 */
export function formatErrorForLog(error: unknown): Record<string, unknown> {
  if (isAppError(error)) {
    return {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      context: error.context,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    error: String(error),
  };
}

/**
 * Helper to format error for user display (sanitized)
 */
export function formatErrorForUser(error: unknown): {
  message: string;
  statusCode: number;
} {
  if (isAppError(error)) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  // Don't expose internal error details to users
  return {
    message: 'An unexpected error occurred. Please try again later.',
    statusCode: 500,
  };
}
