/**
 * Public Layout - Layout for Public-Facing Pages
 *
 * PATTERN: Route Group Layout (Next.js 15 App Router)
 *
 * WHY use route groups?
 * - Organization: Group related routes without affecting URL
 * - Shared layouts: Apply same layout to multiple pages
 * - Clean URLs: (public) doesn't appear in URL path
 * - Separation: Different layout from /dashboard
 *
 * ROUTE GROUP SYNTAX:
 * - Folder name: (public)
 * - Parentheses: Indicates route group
 * - URL: /propiedades (NOT /public/propiedades)
 *
 * ALTERNATIVE 1: No route group (root layout for all)
 * ❌ Dashboard + public share same header/footer
 * ❌ Less control over public-specific features
 * ✅ Simpler file structure
 *
 * ALTERNATIVE 2: Separate /public prefix
 * ❌ URLs become /public/propiedades (not ideal)
 * ❌ Extra typing
 * ✅ More explicit
 *
 * ✅ We chose Route Groups because:
 * - Clean URLs (no /public prefix)
 * - Separate layouts (public vs dashboard)
 * - Best practice (Next.js recommended)
 * - Easy to understand
 *
 * LAYOUT COMPOSITION:
 * Root Layout → (public)/layout → page
 *
 * EXAMPLE STRUCTURE:
 * app/
 * ├── layout.tsx              ← Root (global styles, metadata)
 * ├── (public)/
 * │   ├── layout.tsx          ← This file (header + footer)
 * │   ├── page.tsx            ← Homepage (/)
 * │   └── propiedades/
 * │       └── page.tsx        ← Listings (/propiedades)
 * └── dashboard/
 *     ├── layout.tsx          ← Dashboard layout
 *     └── page.tsx            ← Dashboard home
 *
 * PERFORMANCE:
 * - Server Component: No JavaScript needed
 * - Static: Header/footer rendered once
 * - Streaming: Children can stream independently
 *
 * PITFALLS:
 * - ⚠️ Don't nest route groups too deep (confusing)
 * - ⚠️ Ensure unique route paths (no conflicts)
 * - ⚠️ Remember route groups don't affect URL
 *
 * RESOURCES:
 * - https://nextjs.org/docs/app/building-your-application/routing/route-groups
 * - https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
 */

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Toaster } from "sonner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/*
        HEADER (floating)
        - Positioned absolutely over hero
        - Navigation + CTAs
        - Transparent with backdrop blur
      */}
      <PublicHeader />

      {/*
        MAIN CONTENT
        No min-height to allow hero full-screen
        WHY? Hero section handles its own height (100vh)
      */}
      <main>{children}</main>

      {/*
        FOOTER
        - Links, social, copyright
        - Always at bottom
      */}
      <PublicFooter />

      {/*
        TOAST NOTIFICATIONS
        - Success/error messages
        - Share confirmations
        - Copy link feedback
      */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

/**
 * LAYOUT HIERARCHY:
 *
 * Root Layout (app/layout.tsx):
 * - Global providers (theme, auth)
 * - Global styles (Tailwind, fonts)
 * - Metadata (title, description, OG)
 * - <html>, <body> tags
 *
 * Public Layout (this file):
 * - Public header
 * - Public footer
 * - Applied to: /, /propiedades, /propiedades/[id], etc.
 *
 * Dashboard Layout (app/dashboard/layout.tsx):
 * - Dashboard sidebar
 * - Dashboard header
 * - Applied to: /dashboard, /dashboard/propiedades, etc.
 *
 * WHY separate layouts?
 * - Different navigation (public browse vs agent manage)
 * - Different styling (public marketing vs dashboard utility)
 * - Different goals (convert visitors vs productivity)
 */

/**
 * PAGES USING THIS LAYOUT:
 *
 * ✅ Homepage (/)
 * ✅ Property Listings (/propiedades)
 * ✅ Property Detail (/propiedades/[id])
 * ✅ Agent Profiles (/agentes)
 * ✅ About (/nosotros)
 * ✅ Contact (/contacto)
 * ❌ Dashboard (/dashboard) - Uses separate layout
 * ❌ Auth pages (/login, /signup) - Uses separate layout
 */

/**
 * FUTURE ENHANCEMENTS:
 *
 * 1. Breadcrumbs:
 *    <Breadcrumbs />
 *    Home > Propiedades > Casa en Miami
 *
 * 2. Back to top button:
 *    {showScrollTop && (
 *      <button onClick={scrollToTop}>
 *        ↑ Volver Arriba
 *      </button>
 *    )}
 *
 * 3. Announcement banner:
 *    <AnnouncementBanner>
 *      🎉 Nueva función: Recorridos virtuales!
 *    </AnnouncementBanner>
 *
 * 4. Cookie consent banner:
 *    <CookieConsent />
 *    Positioned fixed at bottom
 *
 * 5. Chat widget:
 *    <ChatWidget />
 *    Live chat with support
 *
 * But keep it simple for now: Just header + content + footer.
 */
