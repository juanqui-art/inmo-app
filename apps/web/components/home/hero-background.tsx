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
 * OPTIMIZATIONS:
 * ✅ Memoized to prevent re-renders
 * ✅ Next.js Image optimization (WebP, priority loading)
 * ✅ Gradient overlay for text readability
 *
 * RESOURCES:
 * - https://nextjs.org/docs/api-reference/next/image
 * - https://web.dev/optimize-cls/ (Cumulative Layout Shift)
 */

import Image from "next/image";
import { memo } from "react";

function HeroBackgroundComponent() {
  return (
    <div className="absolute inset-0 z-0">
      {/* Background Image - Full Screen */}
      <Image
        src="/hero_section.jpg"
        alt="Modern real estate property showcasing luxury living spaces"
        fill
        priority
        className="object-cover"
        quality={90}
        sizes="100vw"
      />

      {/* Gradient overlay for text readability - Darkened for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/10" />
    </div>
  );
}

/**
 * Memoized export to prevent re-renders
 * Background never changes, so no need to re-render
 */
export const HeroBackground = memo(HeroBackgroundComponent);
HeroBackground.displayName = "HeroBackground";

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
