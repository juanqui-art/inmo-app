/**
 * CSRF PROTECTION MODULE
 *
 * Provides CSRF token generation, validation, and rotation.
 *
 * @example
 * ```typescript
 * // In a component (get token for form):
 * import { getCSRFToken } from "@/lib/csrf";
 * const token = await getCSRFToken();
 *
 * // In a Server Action (validate token):
 * import { validateCSRFToken, isCSRFError } from "@/lib/csrf";
 *
 * try {
 *   const csrfToken = formData.get("csrf_token") as string;
 *   await validateCSRFToken(csrfToken);
 *   // ... proceed with action
 * } catch (error) {
 *   if (isCSRFError(error)) {
 *     return { error: { general: error.message } };
 *   }
 *   throw error;
 * }
 * ```
 */

export {
  getCSRFToken,
  validateCSRFToken,
  rotateCSRFToken,
  isCSRFError,
  CSRFError,
} from "./tokens";
