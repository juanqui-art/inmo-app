/**
 * PublicFooter - Site-wide Footer for Public Pages
 *
 * PATTERN: Multi-Column Footer (Sitemap Style)
 *
 * WHY multi-column footer?
 * - SEO: Internal links help search engine indexing
 * - Navigation: Users expect important links in footer
 * - Trust: Legal pages, contact info, social media
 * - Industry standard: Zillow, Redfin, Realtor all use this pattern
 *
 * FOOTER HIERARCHY:
 * 1. Brand section (logo + tagline)
 * 2. Link columns (organized by topic)
 * 3. Social media links
 * 4. Copyright + legal
 *
 * ALTERNATIVE 1: Minimal footer (just copyright)
 * ❌ Misses SEO opportunity
 * ❌ Users expect more links
 * ✅ Cleaner look
 * ✅ Less maintenance
 *
 * ALTERNATIVE 2: Mega footer (tons of links)
 * ❌ Overwhelming
 * ❌ Hard to scan
 * ❌ Looks cluttered
 * ✅ Maximum SEO
 *
 * ✅ We chose Balanced Multi-Column because:
 * - Right amount of links (not too few, not too many)
 * - Organized by category (easy to scan)
 * - Industry expectation
 * - Good SEO without being spammy
 *
 * LINK ORGANIZATION:
 * - Properties: Browse, search, types
 * - Company: About, blog, careers
 * - Support: Help, contact, FAQ
 * - Legal: Terms, privacy, cookies
 *
 * WHY this organization?
 * - User intent: Groups related actions
 * - Scannable: Clear categories
 * - SEO: Topic clustering
 *
 * PERFORMANCE:
 * - Server Component: No JavaScript
 * - Static: Pre-rendered
 * - Fast: Pure HTML + CSS
 *
 * PITFALLS:
 * - ⚠️ Don't overload with links (max 20-25)
 * - ⚠️ Keep legal pages updated (GDPR, privacy laws)
 * - ⚠️ Test responsive layout (columns stack on mobile)
 * - ⚠️ Ensure high contrast (footer often dark)
 *
 * RESOURCES:
 * - https://www.nngroup.com/articles/footers/
 * - https://baymard.com/blog/footer-ux
 */

import { Home as HomeIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function PublicFooter() {
  /**
   * Current year for copyright
   * Dynamic to avoid outdated copyright notices
   */
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-oslo-gray-950 to-oslo-gray-900 text-oslo-gray-300 border-t border-oslo-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/*
            RESPONSIVE GRID:
            - Mobile: 1 column (stacked)
            - Tablet: 2 columns
            - Desktop: 5 columns (Brand + 4 link columns)

            WHY 5 columns?
            - Brand takes more space (logo + description)
            - 4 link columns = balanced
            - Not too wide (readable line length)
          */}

          {/* Brand Column (Wider on desktop) */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="p-2 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                <HomeIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="font-bold text-2xl text-white">InmoApp</span>
            </Link>

            <p className="text-oslo-gray-400 mb-8 max-w-sm leading-relaxed">
              Encuentra tu hogar ideal. Miles de propiedades en venta y renta en
              las mejores ubicaciones.
            </p>

            {/* Social Media Links */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com/inmoapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-oslo-gray-800 hover:bg-indigo-600 text-oslo-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
              >
                <Image
                  src="/social_icons/facebook.svg"
                  alt="Facebook"
                  width={24}
                  height={24}
                  className="brightness-0 invert"
                />
              </a>

              <a
                href="https://instagram.com/inmoapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-oslo-gray-800 hover:bg-pink-600 text-oslo-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
              >
                <Image
                  src="/social_icons/instagram.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className="brightness-0 invert"
                />
              </a>

              <a
                href="https://tiktok.com/@inmoapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-oslo-gray-800 hover:bg-black text-oslo-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
              >
                <Image
                  src="/social_icons/tiktok.svg"
                  alt="TikTok"
                  width={21}
                  height={21}
                  className="brightness-0 invert"
                />
              </a>
            </div>
          </div>

          {/* Propiedades Column */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
              Propiedades
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/propiedades"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  Todas las Propiedades
                </Link>
              </li>
              <li>
                <Link
                  href="/propiedades?transactionType=SALE"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  En Venta
                </Link>
              </li>
              <li>
                <Link
                  href="/propiedades?transactionType=RENT"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  En Renta
                </Link>
              </li>
              <li>
                <Link
                  href="/propiedades?category=HOUSE"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  Casas
                </Link>
              </li>
              <li>
                <Link
                  href="/propiedades?category=APARTMENT"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  Departamentos
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa Column */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
              Empresa
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/nosotros"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/agentes"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  Agentes
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/carreras"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  Trabaja con Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte Column */}
          <div>
            <h3 className="text-white font-semibold mb-6 text-sm uppercase tracking-wider">
              Soporte
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/ayuda"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  Términos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidad"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block"
                >
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar (Copyright) */}
      <div className="border-t border-oslo-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-oslo-gray-500 text-sm">
              © {currentYear} InmoApp. Todos los derechos reservados.
            </p>

            {/* Legal Links (Small) */}
            <div className="flex gap-8 text-sm">
              <Link
                href="/terminos"
                className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-0.5 inline-block"
              >
                Términos
              </Link>
              <Link
                href="/privacidad"
                className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-0.5 inline-block"
              >
                Privacidad
              </Link>
              <Link
                href="/cookies"
                className="text-oslo-gray-400 hover:text-white transition-colors hover:translate-x-0.5 inline-block"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * DESIGN DECISIONS:
 *
 * 1. Dark Background (gray-900):
 *    - Contrast with light content sections
 *    - Professional look
 *    - Common pattern (most sites use dark footers)
 *    - Text (gray-300) has good contrast (WCAG AA)
 *
 * 2. Link Organization:
 *    - By user intent (what are they looking for?)
 *    - Propiedades: Browse/filter
 *    - Empresa: Learn about company
 *    - Soporte: Get help
 *
 * 3. Social Media:
 *    - Prominent (in brand column)
 *    - Icon buttons (universal recognition)
 *    - Hover effects (brand colors)
 *    - External links (target="_blank")
 *
 * 4. Copyright Bar:
 *    - Separated (border-top)
 *    - Dynamic year (no manual updates)
 *    - Legal links repeated (easy access)
 *
 * 5. Responsive:
 *    - Mobile: Stacked columns
 *    - Tablet: 2 columns
 *    - Desktop: 5 columns
 *
 * ACCESSIBILITY:
 *
 * - High contrast: Text/background ratio > 4.5:1
 * - Semantic HTML: <footer>, <nav> (implicit in links)
 * - aria-label: Social media links
 * - External links: rel="noopener noreferrer" (security)
 * - Keyboard: All links focusable
 *
 * SEO BENEFITS:
 *
 * - Internal linking: Helps crawlers discover pages
 * - Keyword-rich anchor text: "En Venta", "Casas"
 * - Topic clustering: Related links grouped
 * - Sitemapping: Clear site structure
 *
 * LEGAL COMPLIANCE:
 *
 * - Terms of Use: Required for most apps
 * - Privacy Policy: GDPR/CCPA requirement
 * - Cookie Policy: EU/California law
 * - Copyright: Protects intellectual property
 *
 * FUTURE ENHANCEMENTS:
 *
 * 1. Newsletter signup:
 *    <form>
 *      <input type="email" placeholder="Tu email" />
 *      <button>Suscribirse</button>
 *    </form>
 *
 * 2. Language selector:
 *    <select>
 *      <option>Español</option>
 *      <option>English</option>
 *    </select>
 *
 * 3. App badges:
 *    <a href="https://apps.apple.com">
 *      <img src="/app-store-badge.svg" />
 *    </a>
 *
 * 4. Trust badges:
 *    <img src="/ssl-secure.svg" />
 *    <img src="/payment-methods.svg" />
 *
 * 5. Popular cities:
 *    <div>
 *      <h4>Ciudades Populares</h4>
 *      <Link href="/propiedades?city=miami">Miami</Link>
 *      <Link href="/propiedades?city=orlando">Orlando</Link>
 *    </div>
 *
 * But keep it clean for now: Current footer has all essentials.
 */
