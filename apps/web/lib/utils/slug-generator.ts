/**
 * Slug Generator Utility
 *
 * Converts property titles and strings into URL-friendly slugs.
 * Handles Spanish characters, special characters, and maintains consistency.
 *
 * EXAMPLES:
 * - "Apartamento Moderno en Quito" → "apartamento-moderno-en-quito"
 * - "Suite 2♥ - $50,000" → "suite-2-50000"
 * - "Casa/Villa/Duplex" → "casavilladuplex"
 */

/**
 * Generates a URL-friendly slug from a string
 *
 * PROCESS:
 * 1. Convert to lowercase
 * 2. Normalize unicode (NFD) to separate base chars from accents
 * 3. Remove diacritical marks (accents)
 * 4. Replace special Nordic chars (ø, æ, etc)
 * 5. Trim whitespace
 * 6. Remove all non-alphanumeric chars except hyphens and spaces
 * 7. Replace spaces with hyphens
 * 8. Remove duplicate hyphens
 * 9. Remove leading/trailing hyphens
 * 10. Limit to max length (for URL readability)
 * 11. Remove trailing hyphens again (in case slice cut mid-word)
 *
 * @param title - The string to slugify
 * @param maxLength - Maximum length of the slug (default: 50 chars)
 * @returns URL-friendly slug
 */
export function generateSlug(title: string, maxLength: number = 50): string {
  return (
    title
      .toLowerCase()
      .normalize("NFD") // Normalize Unicode: Á → A + ́
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks (accents)
      // Replace special Nordic/European characters
      .replace(/ø/g, "o")
      .replace(/æ/g, "ae")
      .replace(/đ/g, "d")
      .replace(/ð/g, "d")
      .replace(/þ/g, "th")
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special chars (keep alphanumeric, spaces, hyphens)
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Remove duplicate hyphens
      .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
      .slice(0, maxLength) // Limit to maxLength
      .replace(/-+$/g, "")
  ); // Remove trailing hyphens (in case slice cut mid-word)
}

/**
 * Validates if a provided slug matches the generated slug from a title
 *
 * Useful for SEO redirects: if user goes to /property/id-old-slug,
 * redirect to /property/id-current-slug
 *
 * @param title - The original property title
 * @param providedSlug - The slug from the URL
 * @returns true if slugs match, false if they differ
 */
export function isSlugValid(title: string, providedSlug: string): boolean {
  const generatedSlug = generateSlug(title);
  return generatedSlug === providedSlug;
}

/**
 * Extracts ID and slug from a combined [id-slug] parameter
 *
 * PATTERN: "abc123-property-title-here"
 * RETURNS: { id: "abc123", slug: "property-title-here" }
 *
 * @param idSlugParam - Combined parameter from URL (e.g., from [id-slug])
 * @returns Object with separated id and slug
 */
export function parseIdSlugParam(idSlugParam: string): {
  id: string;
  slug: string;
} {
  const parts = idSlugParam.split("-");

  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars)
  // First part is usually the ID before the first slug word
  // We need to be smart about finding where the ID ends

  // Since UUIDs contain hyphens, we need a different approach:
  // The ID is the first part before the first alphabetic character
  // OR if the first part looks like a UUID segment (8 hex chars), take UUIDs parts

  // Simpler approach: Check if first segment is hex (UUID)
  const firstPart = parts[0];
  if (firstPart && /^[a-f0-9]{8}$/.test(firstPart)) {
    // Likely UUID: take next 4 UUID parts (8-4-4-4-12)
    const uuidParts = parts.slice(0, 5); // 8-4-4-4-12 = 5 parts
    const id = uuidParts.join("-");
    const slug = parts.slice(5).join("-");
    return { id, slug };
  }

  // Fallback: assume first part is simple ID
  const id = firstPart || "";
  const slug = parts.slice(1).join("-");
  return { id, slug };
}
