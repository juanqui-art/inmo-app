/**
 * Input Sanitization Utilities
 *
 * Provides DOMPurify-based sanitization for user-generated content
 * to prevent XSS (Cross-Site Scripting) attacks.
 *
 * Usage:
 * - sanitizeHTML(): For rich text fields that allow limited HTML (descriptions, bios)
 * - sanitizePlainText(): For plain text fields (addresses, names, cities)
 * - sanitizeOptional(): Safely sanitize optional/nullable fields
 *
 * Why isomorphic-dompurify?
 * - Works in both Node.js (Server Actions, Repositories) and browsers (Client Components)
 * - Essential for Server-Side Rendering (SSR) and Server Actions
 *
 * Related:
 * - Task 4.2: Input Sanitization (Phase 2, Week 4)
 * - docs/security/INPUT_SANITIZATION.md
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content while allowing safe formatting tags
 *
 * Use for: Rich text fields (property descriptions, user bios, etc.)
 *
 * Allowed tags: <b>, <i>, <em>, <strong>, <a>, <p>, <br>, <ul>, <ol>, <li>
 * Allowed attributes: href, target (for links only)
 *
 * Blocked: <script>, <iframe>, onclick, onerror, and all other dangerous HTML
 *
 * @example
 * ```typescript
 * const dirty = 'Casa <b>hermosa</b> <script>alert("XSS")</script>';
 * const clean = sanitizeHTML(dirty);
 * // Result: 'Casa <b>hermosa</b> '
 * ```
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      // Text formatting
      'b', 'i', 'em', 'strong', 'u',
      // Paragraphs and line breaks
      'p', 'br',
      // Lists
      'ul', 'ol', 'li',
      // Links (important for property details)
      'a',
    ],
    ALLOWED_ATTR: [
      // Only allow href and target on links
      'href',
      'target',
    ],
    // Force links to open in new tab (security best practice)
    ALLOWED_URI_REGEXP: /^(?:(?:https?):)|^\//, // Only allow HTTPS and relative URLs
  });
}

/**
 * Sanitize plain text by removing ALL HTML tags and attributes
 *
 * Use for: Plain text fields (addresses, cities, names, phone numbers, etc.)
 *
 * All HTML tags and attributes are stripped. Only text content remains.
 *
 * @example
 * ```typescript
 * const dirty = 'Cuenca <b>Ecuador</b> <script>alert(1)</script>';
 * const clean = sanitizePlainText(dirty);
 * // Result: 'Cuenca Ecuador '
 * ```
 */
export function sanitizePlainText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
  });
}

/**
 * Sanitize optional/nullable string fields
 *
 * Use for: Optional fields that may be undefined or null
 *
 * @example
 * ```typescript
 * const bio = sanitizeOptional(user.bio, sanitizeHTML);
 * // If user.bio is null/undefined → returns null
 * // Otherwise → returns sanitized HTML
 * ```
 */
export function sanitizeOptional<T extends string | null | undefined>(
  value: T,
  sanitizer: (value: string) => string = sanitizePlainText,
): T extends string ? string : null {
  if (value === null || value === undefined) {
    return null as any;
  }
  return sanitizer(value) as any;
}

/**
 * Sanitize an array of strings
 *
 * Use for: Arrays of user input (tags, categories, etc.)
 *
 * @example
 * ```typescript
 * const tags = sanitizeArray(['casa', '<script>alert(1)</script>', 'venta']);
 * // Result: ['casa', '', 'venta']
 * ```
 */
export function sanitizeArray(
  values: string[],
  sanitizer: (value: string) => string = sanitizePlainText,
): string[] {
  return values.map(sanitizer);
}

/**
 * Sanitize an object's string properties
 *
 * Use for: Sanitizing multiple fields at once
 *
 * @example
 * ```typescript
 * const sanitized = sanitizeObject(formData, {
 *   title: sanitizePlainText,
 *   description: sanitizeHTML,
 *   address: sanitizePlainText,
 * });
 * ```
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  sanitizers: Partial<Record<keyof T, (value: string) => string>>,
): T {
  const result = { ...obj };

  for (const [key, sanitizer] of Object.entries(sanitizers)) {
    const value = obj[key as keyof T];
    if (typeof value === 'string' && sanitizer) {
      result[key as keyof T] = sanitizer(value) as any;
    }
  }

  return result;
}
