/**
 * CSRF TOKEN MANAGEMENT
 *
 * Cross-Site Request Forgery (CSRF) protection for Server Actions.
 *
 * HOW IT WORKS:
 * 1. Generate unique token per session
 * 2. Store token in httpOnly cookie
 * 3. Include token in forms/requests
 * 4. Validate token on critical mutations
 *
 * SECURITY FEATURES:
 * - Random cryptographic tokens (32 bytes)
 * - httpOnly cookies (not accessible via JavaScript)
 * - SameSite=lax (prevents cross-site requests)
 * - Secure flag in production (HTTPS only)
 * - Token rotation after critical operations
 *
 * WHEN TO USE:
 * - State-changing operations (DELETE, UPDATE)
 * - Critical actions (cancel appointment, delete property)
 * - Admin operations (update user role)
 *
 * NOT NEEDED FOR:
 * - Read operations (GET)
 * - Idempotent actions
 * - Rate-limited endpoints (already protected)
 *
 * @see https://owasp.org/www-community/attacks/csrf
 */

import { cookies } from "next/headers";
import { logger } from "@/lib/utils/logger";
import { env } from "@repo/env";

const CSRF_COOKIE_NAME = "inmoapp_csrf_token";
const TOKEN_LENGTH = 32; // 32 bytes = 256 bits

/**
 * CSRF Token Error
 */
export class CSRFError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CSRFError";
  }
}

/**
 * Generate cryptographically secure random token
 *
 * Uses crypto.getRandomValues (browser) or crypto.randomBytes (Node.js)
 * to generate a random token.
 *
 * @returns Hex-encoded token (64 characters)
 */
function generateToken(): string {
  // Node.js environment (Server Actions)
  if (typeof global !== "undefined" && global.crypto) {
    const buffer = new Uint8Array(TOKEN_LENGTH);
    global.crypto.getRandomValues(buffer);
    return Buffer.from(buffer).toString("hex");
  }

  // Fallback (should not happen in Next.js)
  throw new Error("crypto.getRandomValues not available");
}

/**
 * Get or create CSRF token
 *
 * Returns existing token from cookie, or generates new one if missing.
 * Automatically sets cookie with secure flags.
 *
 * @returns CSRF token (hex string)
 */
export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CSRF_COOKIE_NAME);

  if (existingToken?.value) {
    return existingToken.value;
  }

  // Generate new token
  const token = generateToken();

  // Set cookie with security flags
  const isProduction = env.NODE_ENV === "production";

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true, // Not accessible via JavaScript (XSS protection)
    secure: isProduction, // HTTPS only in production
    sameSite: "lax", // Prevents CSRF attacks
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  logger.debug({ component: "csrf" }, "Generated new CSRF token");

  return token;
}

/**
 * Validate CSRF token from request
 *
 * Compares token from form data with token from cookie.
 * Throws CSRFError if validation fails.
 *
 * @param submittedToken - Token from form data or header
 * @throws {CSRFError} If token is missing or invalid
 */
export async function validateCSRFToken(submittedToken: string | null): Promise<void> {
  if (!submittedToken) {
    logger.warn({ component: "csrf" }, "CSRF token missing in request");
    throw new CSRFError("Token de seguridad no encontrado. Recarga la página e intenta de nuevo.");
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!cookieToken) {
    logger.warn({ component: "csrf" }, "CSRF token missing in cookie");
    throw new CSRFError("Sesión expirada. Recarga la página e intenta de nuevo.");
  }

  // Constant-time comparison to prevent timing attacks
  if (!timingSafeEqual(submittedToken, cookieToken)) {
    logger.warn(
      { component: "csrf" },
      "CSRF token mismatch - possible attack"
    );
    throw new CSRFError("Token de seguridad inválido. Recarga la página e intenta de nuevo.");
  }

  logger.debug({ component: "csrf" }, "CSRF token validated successfully");
}

/**
 * Rotate CSRF token
 *
 * Generates and sets a new token, invalidating the old one.
 * Call after critical operations to prevent token reuse.
 */
export async function rotateCSRFToken(): Promise<void> {
  const cookieStore = await cookies();
  const token = generateToken();

  const isProduction = env.NODE_ENV === "production";

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  logger.debug({ component: "csrf" }, "CSRF token rotated");
}

/**
 * Timing-safe string comparison
 *
 * Prevents timing attacks by comparing strings in constant time.
 *
 * @param a - First string
 * @param b - Second string
 * @returns true if strings match
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    // biome-ignore lint/style/noNonNullAssertion: length check above ensures index is valid
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)!;
  }

  return mismatch === 0;
}

/**
 * Check if an error is a CSRFError
 */
export function isCSRFError(error: unknown): error is CSRFError {
  return error instanceof CSRFError;
}
