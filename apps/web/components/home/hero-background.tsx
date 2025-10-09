/**
 * HeroBackground - Optimized Background Image for Hero
 *
 * PATTERN: Static Background Image (NOT carousel/video)
 *
 * WHY static image?
 * - Performance: No JavaScript needed
 * - Focus: Doesn't distract from primary action (search)
 * - Fast: Loads once, cached
 * - Industry Standard: Zillow, Redfin use static hero images
 *
 * ALTERNATIVE 1: Auto-rotating carousel
 * ❌ Banner blindness (users ignore it)
 * ❌ Distracts from search bar
 * ❌ Bad for SEO (rotating content)
 * ❌ Performance cost (JavaScript, animations)
 *
 * ALTERNATIVE 2: Video background
 * ❌ Heavy (5-20MB typical)
 * ❌ Bad mobile experience
 * ❌ Accessibility issues (motion sickness)
 * ✅ Can work for luxury real estate (use sparingly)
 *
 * ✅ We chose static image because:
 * - Fastest load time
 * - No distraction from search
 * - Works perfectly on mobile
 * - Industry best practice
 *
 * PERFORMANCE NOTES:
 * - Next.js Image: Automatic WebP conversion
 * - Priority loading: Loads before other images
 * - Responsive sizes: Different images for mobile/desktop
 * - Blur placeholder: Smooth loading experience
 *
 * PITFALL: Don't use huge images
 * - Desktop: Max 1920px wide, ~200-400KB
 * - Mobile: Max 768px wide, ~100-150KB
 * - Always compress (TinyPNG, Squoosh)
 *
 * RESOURCES:
 * - https://nextjs.org/docs/api-reference/next/image
 * - https://web.dev/optimize-cls/ (Cumulative Layout Shift)
 */

export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0">
      {/*
        DARK MODE GRADIENT BACKGROUND
        Replaces image with modern gradient for optimal dark mode experience
      */}

      {/* Base gradient - Deep dark blue to black */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-950 to-black" />

      {/* Radial overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent" />

      {/* Bottom fade for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Subtle noise texture for visual interest (optional) */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      {/*
        DARK MODE GRADIENT BENEFITS:
        - No image download = faster load
        - Perfect dark mode aesthetic
        - Always looks sharp (vector gradients)
        - Zero layout shift (CLS = 0)

        FUTURE: Can add image back with:
        <Image src="/images/hero-dark.jpg" ... />
        For now, modern gradient is cleaner for dark mode.
      */}
    </div>
  )
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
