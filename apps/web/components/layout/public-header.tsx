/**
 * PublicHeader - Site-wide Navigation for Public Pages
 *
 * PATTERN: Sticky Header with Responsive Mobile Menu + Auth-aware Navigation
 *
 * WHY sticky header?
 * - Accessibility: Navigation always available (no scroll back to top)
 * - Conversion: Login/Signup CTAs always visible
 * - UX: Modern expectation (users expect sticky headers)
 * - Industry standard: Zillow, Redfin, Realtor all use sticky
 *
 * ALTERNATIVE 1: Static header (not sticky)
 * ❌ Have to scroll to top for navigation
 * ❌ Lower conversion (CTAs hidden)
 * ✅ Simpler CSS
 * ✅ Slightly better performance
 *
 * ALTERNATIVE 2: Hide on scroll down, show on scroll up
 * ✅ More screen space
 * ✅ Modern pattern
 * ❌ More complex (JavaScript required)
 * ❌ Can be confusing
 *
 * ✅ We chose Always Sticky because:
 * - Simple implementation
 * - Predictable behavior
 * - Better conversion (CTAs visible)
 * - Users expect it
 *
 * MOBILE MENU PATTERN:
 * - Hamburger icon (☰)
 * - Full-screen overlay menu
 * - Animated slide-in
 * - Close button (X)
 *
 * WHY full-screen overlay?
 * - Mobile-first: Large touch targets
 * - Focus: One task at a time
 * - Modern: Common pattern (not slide-out drawer)
 * - Simple: Easy to implement
 *
 * PERFORMANCE:
 * - Mostly static: Logo + links
 * - Small JavaScript: Mobile menu toggle only
 * - No heavy animations
 * - Fast: Minimal DOM
 *
 * PITFALLS:
 * - ⚠️ Sticky header covers content (add margin-top to body)
 * - ⚠️ Mobile menu must trap focus (accessibility)
 * - ⚠️ Don't make header too tall (wastes space)
 * - ⚠️ Ensure z-index is high enough (above all content)
 *
 * ARCHITECTURE:
 * - Server Component: PublicHeader (gets auth state)
 * - Client Component: PublicHeaderClient (handles interactivity)
 * - WHY? Need server-side auth check + client-side mobile menu
 *
 * RESOURCES:
 * - https://web.dev/css-position-sticky/
 * - https://www.nngroup.com/articles/sticky-headers/
 * - https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */

import { getCurrentUser } from "@/lib/auth";
import { PublicHeaderClient } from "./public-header-client";

/**
 * Server Component Wrapper
 * - Fetches auth state on server
 * - Passes isAuthenticated to client component
 * - No interactivity needed here
 */
export async function PublicHeader() {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  return <PublicHeaderClient isAuthenticated={isAuthenticated} user={user} />;
}

/**
 * DESIGN DECISIONS:
 *
 * 1. Logo Position (left):
 *    - Western reading direction (left to right)
 *    - Expected location (F-pattern eye tracking)
 *    - Click to homepage (universal pattern)
 *
 * 2. Navigation Center:
 *    - Primary actions (Browse properties)
 *    - Most important for users
 *    - Easy to scan
 *
 * 3. Auth Buttons Right:
 *    - Secondary actions
 *    - Expected location
 *    - Sign Up highlighted (primary CTA)
 *
 * 4. Auth-aware Navigation:
 *    - Public: Comprar, Rentar, Vender (no Favoritos)
 *    - Authenticated: Comprar, Rentar, Vender, Favoritos, User Menu
 *    - WHY? Avoid confusion with features requiring authentication
 *
 * 5. Color Hierarchy:
 *    - Logo: Black (brand)
 *    - Nav links: Gray (secondary)
 *    - Login: Gray (tertiary)
 *    - Signup: Blue (primary CTA)
 *
 * 6. Mobile Menu from Right:
 *    - Thumb-friendly (right-handed users)
 *    - Modern pattern (iOS, Android)
 *    - Not full width (shows context behind)
 *
 * ACCESSIBILITY:
 *
 * - Semantic HTML: <header>, <nav>, <button>
 * - ARIA labels: aria-label, aria-expanded, aria-modal
 * - Keyboard: All interactive elements focusable
 * - Focus trap: Menu traps focus when open (TODO)
 * - Screen reader: Announces menu state
 *
 * PERFORMANCE:
 *
 * - Server Component: Fetches auth state
 * - Client Component: Handles interactivity (menu toggle)
 * - Small JavaScript: Just menu state
 * - No heavy dependencies
 * - CSS animations: GPU accelerated
 *
 * FUTURE ENHANCEMENTS:
 *
 * 1. Search bar in header:
 *    - Reuse HeroSearchBar component
 *    - Appears on scroll down
 *    - Quick access from any page
 *
 * 2. Notifications bell:
 *    - New messages
 *    - Property alerts
 *    - Badge with count
 *
 * 3. Language switcher:
 *    - ES / EN toggle
 *    - Flag icons
 *    - Dropdown for more languages
 *
 * 4. Dark mode toggle:
 *    - Moon/Sun icon
 *    - Respects system preference
 *    - Persists in localStorage
 */
