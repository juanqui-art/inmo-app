/**
 * HeroBackground - Full-Screen Background Image for Hero
 *
 * PATTERN: Static Background Image (NOT carousel/video)
 *
 * WHY static image?
 * - Performance: No JavaScript needed
 * - Focus: Doesn't distract from primary action (search)
 * - Fast: Loads once, cached
 * - Industry Standard: Zillow, Redfin use static hero images
 *
 * PERFORMANCE NOTES:
 * - Next.js Image: Automatic WebP conversion
 * - Priority loading: Loads before other images
 * - fill + object-cover: Covers entire container
 * - Dark overlay: Ensures text readability
 *
 * RESOURCES:
 * - https://nextjs.org/docs/api-reference/next/image
 * - https://web.dev/optimize-cls/ (Cumulative Layout Shift)
 */

import Image from "next/image";

export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 opacity-0">
      {/* Background Image - Full Screen */}
      <Image
        src="/hero_section.jpg"
        alt="Hero background"
        fill
        priority
        className="object-cover"
        quality={90}
        sizes="100vw"
      />

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
    </div>
  );
}

/**
 * Future Enhancements:
 *
 * 1. Multiple images by time of day:
 *    const hour = new Date().getHours()
 *    const image = hour < 12 ? 'morning.jpg' : hour < 18 ? 'day.jpg' : 'evening.jpg'
 *
 * 2. Different images by location (detect user city):
 *    const image = userCity === 'Miami' ? 'beach-house.jpg' : 'default.jpg'
 *
 * 3. A/B testing different images:
 *    const variants = ['modern.jpg', 'traditional.jpg', 'luxury.jpg']
 *    const image = variants[Math.floor(Math.random() * variants.length)]
 *
 * But start simple: One great image is better than complex logic with mediocre images.
 */
