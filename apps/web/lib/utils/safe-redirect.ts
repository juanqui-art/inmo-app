/**
 * Validates a user-supplied redirect target so it can only point to a path
 * on this same origin.
 *
 * `startsWith("/")` alone is not enough: browsers treat `//evil.com` and
 * `/\evil.com` as protocol-relative URLs to another host (open redirect).
 *
 * @returns the path if it is a safe same-origin path, otherwise `null`
 */
export function getSafeRedirectPath(
  target: string | null | undefined,
): string | null {
  if (!target || typeof target !== "string") return null;

  // Must be an absolute path, but not protocol-relative ("//" or "/\")
  if (
    !target.startsWith("/") ||
    target.startsWith("//") ||
    target.startsWith("/\\")
  ) {
    return null;
  }

  // Reject control characters (e.g. tabs/newlines that browsers strip, turning "/\t/evil.com" into "//evil.com")
  // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional
  if (/[\u0000-\u001F\u007F]/.test(target)) return null;

  // Final check: resolving against a dummy origin must stay on that origin
  try {
    const base = "http://localhost";
    const resolved = new URL(target, base);
    if (resolved.origin !== base) return null;
    return resolved.pathname + resolved.search + resolved.hash;
  } catch {
    return null;
  }
}
