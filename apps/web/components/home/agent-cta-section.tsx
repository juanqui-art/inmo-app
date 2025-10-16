/**
 * AgentCTASection - Call-to-Action for Real Estate Agents
 *
 * PATTERN: Conversion-Focused CTA (Call to Action)
 *
 * WHY dedicated agent CTA?
 * - Business Model: Marketplace needs supply (agents + properties)
 * - Target Audience: Different persona (business owner vs home buyer)
 * - Clear Value Prop: Benefits of joining platform
 * - Growth: Converting visitors → agents = more properties = more buyers
 *
 * PSYCHOLOGY of effective CTAs:
 * 1. Clear benefit ("Grow your business")
 * 2. Social proof ("Join 500+ agents")
 * 3. Urgency ("Start today")
 * 4. Low friction ("Free signup")
 * 5. Contrast (stands out visually)
 *
 * ALTERNATIVE 1: Generic "Sign Up" button in header
 * ❌ Not targeted (who is signing up? buyer or agent?)
 * ❌ Lacks context (why sign up?)
 * ❌ Easy to ignore
 *
 * ALTERNATIVE 2: Popup/Modal
 * ❌ Annoying (interrupts browsing)
 * ❌ Bad UX (can't close on mobile)
 * ❌ Conversion killers
 *
 * ALTERNATIVE 3: Separate landing page
 * ✅ More detailed
 * ❌ Extra click (friction)
 * ❌ Homepage traffic doesn't see value prop
 *
 * ✅ We chose Inline Section because:
 * - Non-intrusive (natural scroll)
 * - Context (user already explored platform)
 * - Timing (after seeing properties = credibility)
 * - Industry standard (Zillow, Redfin use this)
 *
 * PLACEMENT (WHY at bottom of homepage):
 * - User journey: Browse properties → Impressed → See CTA
 * - Low friction: Interested agents will scroll
 * - Not distracting: Primary users (buyers) can ignore
 * - Before footer: Last chance to convert
 *
 * COPYWRITING FORMULA:
 * 1. Heading: Clear benefit ("Grow Your Business")
 * 2. Subheading: How it works ("Reach thousands of buyers")
 * 3. Features: Bullet points (3-5 key benefits)
 * 4. CTA Button: Action-oriented ("Start Listing Today")
 * 5. Trust signal: ("Free to join" or "No credit card")
 *
 * PERFORMANCE:
 * - Static section: No JavaScript
 * - Fast: Minimal HTML
 * - Converts: Clear value prop
 *
 * PITFALLS:
 * - ⚠️ Don't overwhelm with too many benefits (3-5 max)
 * - ⚠️ Don't use jargon ("B2B SaaS platform") → simple language
 * - ⚠️ Don't hide pricing (be transparent)
 * - ⚠️ Don't make it look like ad (banner blindness)
 *
 * RESOURCES:
 * - https://www.nngroup.com/articles/call-to-action-buttons/
 * - https://unbounce.com/landing-pages/7-elements-of-a-winning-call-to-action/
 * - https://www.wordstream.com/blog/ws/2015/03/25/call-to-action-examples
 */

import { ArrowRight, BarChart3, Shield, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

export function AgentCTASection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-oslo-gray-900 to-oslo-gray-800 text-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-4xl font-bold mb-4">¿Eres Agente Inmobiliario?</h2>

        {/* Subheading */}
        <p className="text-xl text-oslo-gray-300 mb-8">
          Únete a nuestra plataforma y conecta con miles de compradores
          potenciales
        </p>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
          {/*
            WHY 2 columns?
            - Scannable: Easy to compare benefits
            - Balanced: Not overwhelming
            - Responsive: Stacks nicely on mobile

            WHY left-aligned text?
            - Readability: Easier to read lists
            - Professional: Business context
            - Icons + text: Better alignment
          */}

          {/* Benefit 1 */}
          <div className="flex items-start gap-4 bg-white/10 p-5 rounded-lg backdrop-blur-sm">
            <TrendingUp className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Aumenta tus Ventas</h3>
              <p className="text-oslo-gray-300 text-sm">
                Llega a compradores activos buscando propiedades ahora mismo
              </p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="flex items-start gap-4 bg-white/10 p-5 rounded-lg backdrop-blur-sm">
            <Users className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-1">
                Gestión Simplificada
              </h3>
              <p className="text-oslo-gray-300 text-sm">
                Administra todas tus propiedades desde un solo lugar
              </p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="flex items-start gap-4 bg-white/10 p-5 rounded-lg backdrop-blur-sm">
            <BarChart3 className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-1">
                Analíticas Detalladas
              </h3>
              <p className="text-oslo-gray-300 text-sm">
                Conoce qué propiedades reciben más interés y optimiza tu
                estrategia
              </p>
            </div>
          </div>

          {/* Benefit 4 */}
          <div className="flex items-start gap-4 bg-white/10 p-5 rounded-lg backdrop-blur-sm">
            <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-1">
                Plataforma Confiable
              </h3>
              <p className="text-oslo-gray-300 text-sm">
                Sistema seguro y respaldo profesional para tu negocio
              </p>
            </div>
          </div>

          {/*
            DESIGN NOTE: Benefits cards
            - bg-white/10: Subtle card effect (glassmorphism)
            - backdrop-blur-sm: Modern blur effect
            - p-5: Comfortable padding
            - rounded-lg: Soft corners

            WHY glassmorphism?
            - Modern: Trendy design pattern
            - Subtle: Not overwhelming
            - Depth: Visual hierarchy
            - Premium feel: Elevates brand
          */}
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup?role=AGENT"
            className="
              inline-flex items-center gap-2
              px-8 py-4
              bg-blue-600 hover:bg-blue-700
              text-white font-bold text-lg
              rounded-lg
              shadow-xl hover:shadow-2xl
              transition-all duration-200
              transform hover:scale-105
            "
          >
            Comenzar Ahora
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/agentes"
            className="
              inline-flex items-center
              px-6 py-3
              text-white/90 hover:text-white
              font-medium
              underline underline-offset-4
              transition-colors duration-200
            "
          >
            Conoce más sobre ser agente
          </Link>

          {/*
            CTA BUTTON HIERARCHY:

            Primary (Blue button):
            - Main action (signup)
            - High contrast
            - Larger size
            - Shadow + hover effects

            Secondary (Text link):
            - Learn more (less commitment)
            - Subtle styling
            - Smaller
            - Underline for clarity

            WHY two CTAs?
            - Different commitment levels
            - Primary: Ready to sign up
            - Secondary: Want more info first
            - Covers both user states
          */}
        </div>

        {/* Trust Signal */}
        <p className="text-oslo-gray-400 text-sm mt-6">
          ✓ Gratis para comenzar • ✓ Sin tarjeta de crédito • ✓ Cancela cuando
          quieras
        </p>

        {/*
          TRUST SIGNALS:
          - "Gratis": Removes price objection
          - "Sin tarjeta": Removes risk/commitment
          - "Cancela": Freedom (not locked in)
          - Checkmarks: Visual confirmation
          - Gray text: Subtle (not overselling)
        */}
      </div>
    </section>
  );
}

/**
 * USAGE in Homepage:
 *
 * import { AgentCTASection } from '@/components/home/agent-cta-section'
 *
 * export default async function HomePage() {
 *   return (
 *     <main>
 *       <HeroSection />
 *       <FeaturedPropertiesCarousel properties={featured} />
 *       <StatsSection {...stats} />
 *       <RecentListingsSection properties={recent} />
 *       <AgentCTASection />
 *     </main>
 *   )
 * }
 *
 * Place this component before the footer for best conversion.
 */

/**
 * DESIGN DECISIONS:
 *
 * 1. Dark Background (gray-900 gradient):
 *    - Contrast: Stands out from light sections
 *    - Focus: Draws attention
 *    - Premium: Feels professional
 *    - Differentiation: Clearly different from property sections
 *
 * 2. Center-Aligned:
 *    - max-w-4xl: Not too wide (maintains focus)
 *    - mx-auto: Centered
 *    - text-center: Heading centered (impact)
 *    - Benefits left-aligned (readability)
 *
 * 3. Icon Choice:
 *    - TrendingUp: Growth/sales
 *    - Users: Community/management
 *    - BarChart3: Analytics/data
 *    - Shield: Trust/security
 *    - Blue-400: Matches brand, pops on dark bg
 *
 * 4. Button Styling:
 *    - Large (px-8 py-4): Easy to tap
 *    - Blue: Primary brand color
 *    - Shadow: Depth
 *    - Hover scale: Feedback
 *    - Arrow icon: Direction/action
 *
 * 5. Query Parameter:
 *    - /signup?role=AGENT
 *    - Pre-selects agent role
 *    - Saves user a step
 *    - Better UX
 *
 * CONVERSION OPTIMIZATION:
 *
 * A/B Test Ideas:
 * 1. Heading variations:
 *    - Current: "¿Eres Agente Inmobiliario?"
 *    - Test: "Agents: Grow Your Real Estate Business"
 *    - Test: "Join 500+ Successful Agents"
 *
 * 2. Button copy:
 *    - Current: "Comenzar Ahora"
 *    - Test: "Registrarse Gratis"
 *    - Test: "Empezar mi Plan Gratis"
 *
 * 3. Social proof:
 *    - Add testimonial from top agent
 *    - Add "500+ agents trust us"
 *    - Add logo wall (if enterprise clients)
 *
 * 4. Urgency:
 *    - "Limited spots" (if true)
 *    - "Early adopter benefits"
 *    - "Join before [date]"
 *
 * FUTURE ENHANCEMENTS:
 *
 * 1. Video testimonial:
 *    <video src="/agents/testimonial.mp4" />
 *    - Show successful agent
 *    - Builds trust
 *    - More engaging
 *
 * 2. Calculator:
 *    "Calculate your potential earnings"
 *    - Input: Properties per month
 *    - Output: Estimated reach/leads
 *    - Interactive = engaging
 *
 * 3. Chat widget:
 *    "Questions? Chat with our team"
 *    - Lower friction
 *    - Immediate answers
 *    - Higher conversion
 *
 * But start simple: Current design is proven and effective.
 */
