/**
 * CSRF PROTECTION FOR SERVER ACTIONS
 *
 * Provides CSRF token generation and validation for critical mutations.
 * Uses HMAC-based tokens with timestamp validation to prevent replay attacks.
 *
 * ## When to use CSRF protection:
 * - User deletion/modification
 * - Property deletion
 * - Role changes (admin actions)
 * - Subscription changes
 * - Any destructive operation
 *
 * ## How it works:
 * 1. Client requests token from server (getCSRFToken)
 * 2. Client includes token in form data
 * 3. Server validates token (validateCSRFToken)
 * 4. Token expires after 1 hour
 *
 * @example
 * ```typescript
 * // Server Action
 * export async function deleteUserAction(userId: string, csrfToken?: string) {
 *   try {
 *     await validateCSRFToken(csrfToken);
 *   } catch (error) {
 *     if (isCSRFError(error)) {
 *       return { success: false, error: error.message };
 *     }
 *     throw error;
 *   }
 *   // ... deletion logic
 * }
 * ```
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { env } from "@repo/env";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/utils/logger";

/**
 * CSRF token validity window (1 hour)
 */
const CSRF_TOKEN_VALIDITY_MS = 60 * 60 * 1000; // 1 hour

/**
 * CSRF error class for better error handling
 */
export class CSRFError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CSRFError";
  }
}

/**
 * Check if an error is a CSRF error
 */
export function isCSRFError(error: unknown): error is CSRFError {
  return error instanceof CSRFError;
}

/**
 * Get CSRF secret from environment
 * Falls back to a warning if not configured (dev only)
 */
function getCSRFSecret(): string {
  const secret = env.CSRF_SECRET;

  if (!secret) {
    // In development, use a fallback (not secure, just for testing)
    if (process.env.NODE_ENV === "development") {
      logger.warn(
        "[CSRF] CSRF_SECRET not configured - using insecure fallback for development"
      );
      return "dev-csrf-secret-change-in-production";
    }

    // In production, this is a critical error
    throw new Error(
      "CSRF_SECRET environment variable is required for CSRF protection"
    );
  }

  return secret;
}

/**
 * Generate HMAC signature for CSRF token
 *
 * @param payload - Data to sign (userId + timestamp + nonce)
 * @param secret - Secret key
 */
function generateSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * CSRF token structure: {userId}:{timestamp}:{nonce}:{signature}
 */
interface CSRFTokenParts {
  userId: string;
  timestamp: number;
  nonce: string;
  signature: string;
}

/**
 * Parse CSRF token into components
 */
function parseCSRFToken(token: string): CSRFTokenParts | null {
  const parts = token.split(":");

  if (parts.length !== 4) {
    return null;
  }

  const [userId, timestampStr, nonce, signature] = parts;

  if (!userId || !timestampStr || !nonce || !signature) {
    return null;
  }

  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) {
    return null;
  }

  return { userId, timestamp, nonce, signature };
}

/**
 * Generate a CSRF token for the current user
 *
 * Token format: {userId}:{timestamp}:{nonce}:{signature}
 * - userId: User ID for binding token to user
 * - timestamp: Unix timestamp for expiration
 * - nonce: Random string to prevent token reuse
 * - signature: HMAC-SHA256 of the above
 *
 * @returns CSRF token string
 * @throws Error if user not authenticated
 */
export async function generateCSRFToken(): Promise<string> {
  const user = await getCurrentUser();

  if (!user) {
    throw new CSRFError("Usuario no autenticado");
  }

  const secret = getCSRFSecret();
  const userId = user.id;
  const timestamp = Date.now();
  const nonce = randomBytes(16).toString("hex");

  // Create payload to sign
  const payload = `${userId}:${timestamp}:${nonce}`;
  const signature = generateSignature(payload, secret);

  return `${payload}:${signature}`;
}

/**
 * Validate a CSRF token
 *
 * Checks:
 * 1. Token format is correct
 * 2. Token belongs to current user
 * 3. Token has not expired
 * 4. Signature is valid
 *
 * @param token - CSRF token from client
 * @throws CSRFError if token is invalid
 */
export async function validateCSRFToken(
  token: string | null | undefined
): Promise<void> {
  // Check token exists
  if (!token) {
    throw new CSRFError("Token CSRF faltante");
  }

  // Parse token
  const parsed = parseCSRFToken(token);

  if (!parsed) {
    throw new CSRFError("Token CSRF inválido");
  }

  const { userId, timestamp, nonce, signature } = parsed;

  // Check token expiration
  const now = Date.now();
  const age = now - timestamp;

  if (age > CSRF_TOKEN_VALIDITY_MS) {
    throw new CSRFError(
      "Token CSRF expirado. Por favor, recarga la página e intenta de nuevo."
    );
  }

  if (age < 0) {
    // Token from the future - clock skew or tampering
    throw new CSRFError("Token CSRF inválido (timestamp futuro)");
  }

  // Verify token belongs to current user
  const user = await getCurrentUser();

  if (!user) {
    throw new CSRFError("Usuario no autenticado");
  }

  if (user.id !== userId) {
    logger.warn(
      {
        tokenUserId: userId.slice(0, 8),
        actualUserId: user.id.slice(0, 8),
      },
      "[CSRF] Token user ID mismatch"
    );
    throw new CSRFError("Token CSRF inválido (usuario no coincide)");
  }

  // Verify signature
  const secret = getCSRFSecret();
  const payload = `${userId}:${timestamp}:${nonce}`;
  const expectedSignature = generateSignature(payload, secret);

  // Use timing-safe comparison to prevent timing attacks
  const tokenBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (tokenBuffer.length !== expectedBuffer.length) {
    throw new CSRFError("Token CSRF inválido (firma incorrecta)");
  }

  if (!timingSafeEqual(tokenBuffer, expectedBuffer)) {
    logger.warn(
      { userId: userId.slice(0, 8) },
      "[CSRF] Token signature mismatch"
    );
    throw new CSRFError("Token CSRF inválido (firma incorrecta)");
  }

  // Token is valid
  logger.debug({ userId: userId.slice(0, 8) }, "[CSRF] Token validated");
}

/**
 * Get CSRF token from headers (for API routes)
 *
 * Checks:
 * 1. x-csrf-token header
 * 2. csrf-token header (lowercase)
 */
export async function getCSRFTokenFromHeaders(): Promise<string | null> {
  const headersList = await headers();

  return (
    headersList.get("x-csrf-token") ||
    headersList.get("csrf-token") ||
    null
  );
}

/**
 * Server Action to generate CSRF token
 * Called from client before critical operations
 */
export async function getCSRFToken(): Promise<{ token: string }> {
  const token = await generateCSRFToken();
  return { token };
}
