/**
 * StatsSection - Platform Statistics Display
 *
 * PATTERN: Social Proof Component
 *
 * WHY show statistics?
 * - Trust: Numbers build credibility ("1000+ properties")
 * - Scale: Shows platform is active and legitimate
 * - FOMO: "Join 500+ agents" creates urgency
 * - Transparency: Open about platform size
 *
 * PSYCHOLOGY:
 * Large numbers = Trust
 * - "10,000+ properties" > "Many properties"
 * - "500 agents" > "Multiple agents"
 * - Specific numbers feel authentic
 * - Round numbers (1000+) show growth
 *
 * ALTERNATIVE 1: No stats section
 * ❌ Misses opportunity to build trust
 * ❌ Competitors show stats (Zillow, Realtor)
 * ✅ Simpler page
 *
 * ALTERNATIVE 2: Animated counters
 * ✅ Eye-catching (numbers "count up")
 * ❌ Requires JavaScript
 * ❌ Can feel gimmicky
 * ❌ Bad for performance
 *
 * ✅ We chose Static Numbers because:
 * - Fast: No JavaScript needed
 * - Professional: Not gimmicky
 * - Accessible: Works with screen readers
 * - SEO: Numbers indexed by Google
 *
 * WHEN to use animated counters:
 * - Landing page with lots of scroll effects
 * - Marketing page (not product)
 * - Have budget for performance testing
 *
 * PERFORMANCE:
 * - Server Component: Rendered on server
 * - Static: No hydration cost
 * - Fast: Pure HTML + CSS
 *
 * PITFALLS:
 * - ⚠️ Don't lie about numbers (unethical + illegal)
 * - ⚠️ Update regularly (stale numbers = inactive platform)
 * - ⚠️ Don't show if numbers are small (<10 properties)
 * - ⚠️ Round up for aesthetic (1,247 → 1,200+)
 *
 * RESOURCES:
 * - https://www.nngroup.com/articles/social-proof-ux/
 * - https://cxl.com/blog/social-proof/
 */

import { Building2, MapPin, Users, CheckCircle2 } from 'lucide-react'

interface StatsProps {
  propertyCount: number
  cityCount: number
  agentCount: number
  transactionsCount?: number // Optional: "Ventas completadas"
}

export function StatsSection({ propertyCount, cityCount, agentCount, transactionsCount }: StatsProps) {
  /**
   * Format large numbers for display
   *
   * WHY format numbers?
   * - Readability: 1,234 > 1234
   * - Professional: Shows attention to detail
   * - International: Respects locale conventions
   *
   * EXAMPLES:
   * 1247 → "1,200+"
   * 543 → "500+"
   * 89 → "80+"
   * 5 → "5" (no rounding if <10)
   */
  const formatStat = (num: number): string => {
    // Don't show stats if too small
    if (num < 10) return num.toString()

    // Round to nearest significant figure
    if (num >= 1000) {
      const rounded = Math.floor(num / 100) * 100
      return `${rounded.toLocaleString('es-ES')}+`
    }

    const rounded = Math.floor(num / 10) * 10
    return `${rounded.toLocaleString('es-ES')}+`
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Grid Container */}
        <div className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-8
          text-center
        ">
          {/*
            RESPONSIVE LAYOUT:
            - Mobile: 2 columns (2x2 grid)
            - Desktop: 4 columns (1x4 row)

            WHY 2 cols on mobile?
            - 1 col = too much scrolling
            - 3 cols = too cramped
            - 2 cols = perfect balance

            WHY 4 cols on desktop?
            - Fits perfectly with 4 stats
            - Symmetrical
            - Easy to scan left-to-right
          */}

          {/* Stat 1: Properties */}
          <div className="flex flex-col items-center">
            <Building2 className="w-12 h-12 mb-4 opacity-90" />
            <p className="text-4xl font-bold mb-2">
              {formatStat(propertyCount)}
            </p>
            <p className="text-gray-400">
              Propiedades
            </p>
          </div>

          {/* Stat 2: Cities */}
          <div className="flex flex-col items-center">
            <MapPin className="w-12 h-12 mb-4 opacity-90" />
            <p className="text-4xl font-bold mb-2">
              {formatStat(cityCount)}
            </p>
            <p className="text-gray-400">
              Ciudades
            </p>
          </div>

          {/* Stat 3: Agents */}
          <div className="flex flex-col items-center">
            <Users className="w-12 h-12 mb-4 opacity-90" />
            <p className="text-4xl font-bold mb-2">
              {formatStat(agentCount)}
            </p>
            <p className="text-gray-400">
              Agentes
            </p>
          </div>

          {/* Stat 4: Transactions (Optional) */}
          {transactionsCount !== undefined && (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-12 h-12 mb-4 opacity-90" />
              <p className="text-4xl font-bold mb-2">
                {formatStat(transactionsCount)}
              </p>
              <p className="text-gray-400">
                Ventas Completadas
              </p>
            </div>
          )}

          {/*
            DESIGN NOTE: Icons
            - Large (w-12 h-12) for visibility
            - opacity-90: Subtle, not overpowering
            - Matches text color (white)

            WHY icons?
            - Visual anchors (easier to scan)
            - Universal understanding
            - Breaks monotony of just numbers

            ICON CHOICE:
            - Building2: Represents properties
            - MapPin: Represents locations
            - Users: Represents people/agents
            - CheckCircle2: Represents completion
          */}
        </div>
      </div>
    </section>
  )
}

/**
 * USAGE in Homepage:
 *
 * import { StatsSection } from '@/components/home/stats-section'
 * import { db } from '@repo/database'
 *
 * export default async function HomePage() {
 *   // Fetch stats in parallel for performance
 *   const [propertyCount, cityCount, agentCount] = await Promise.all([
 *     db.property.count({ where: { status: 'AVAILABLE' } }),
 *     db.property.findMany({
 *       select: { city: true },
 *       distinct: ['city']
 *     }).then(cities => cities.length),
 *     db.user.count({ where: { role: 'AGENT' } })
 *   ])
 *
 *   return (
 *     <main>
 *       <HeroSection />
 *       <FeaturedPropertiesCarousel properties={featured} />
 *       <StatsSection
 *         propertyCount={propertyCount}
 *         cityCount={cityCount}
 *         agentCount={agentCount}
 *       />
 *       <RecentListingsSection properties={recent} />
 *     </main>
 *   )
 * }
 */

/**
 * DESIGN DECISIONS:
 *
 * 1. Background Color (bg-blue-600):
 *    - Brand color (authority, trust)
 *    - High contrast with white text
 *    - Stands out from gray sections
 *    - Common pattern (Zillow uses blue)
 *
 * 2. White Text:
 *    - Maximum contrast
 *    - Professional
 *    - Easy to read
 *
 * 3. Large Numbers (text-4xl):
 *    - Primary information
 *    - Quick scannable
 *    - Impactful
 *
 * 4. Subtle Labels (text-blue-100):
 *    - Secondary information
 *    - Not competing with numbers
 *    - Still readable
 *
 * 5. Vertical Centering:
 *    - flex flex-col items-center
 *    - Icon → Number → Label
 *    - Clear hierarchy
 *
 * ACCESSIBILITY:
 *
 * - High contrast (WCAG AAA)
 * - Semantic HTML (no divitis)
 * - Screen reader friendly
 * - No animation (respects prefers-reduced-motion by default)
 *
 * FUTURE ENHANCEMENTS:
 *
 * 1. Real-time updates:
 *    - Use Server-Sent Events
 *    - Update every 5 minutes
 *    - Show "Updated 2 min ago"
 *
 * 2. Animated counters (if really needed):
 *    'use client'
 *    useEffect(() => {
 *      const interval = setInterval(() => {
 *        if (count < target) setCount(count + Math.ceil(target / 100))
 *      }, 20)
 *      return () => clearInterval(interval)
 *    }, [count, target])
 *
 * 3. Click to filter:
 *    - Click "50 Ciudades" → Navigate to cities page
 *    - Click "1000+ Propiedades" → Navigate to all listings
 *
 * But keep it simple: Current design is clean, professional, and fast.
 */
