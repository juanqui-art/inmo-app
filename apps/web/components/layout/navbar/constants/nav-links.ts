/**
 * Navigation Links Constants
 *
 * Centralized definition of navigation links
 * Conditional based on authentication status
 */

/**
 * Navigation link type
 */
export interface NavLink {
  href: string;
  label: string;
  icon?: "heart"; // Optional icon identifier
}

/**
 * Public navigation links (not authenticated)
 * - Comprar, Rentar, Vender
 * - NO Favoritos (requires auth)
 */
export const PUBLIC_NAV_LINKS: NavLink[] = [
  { href: "/propiedades?transactionType=SALE", label: "Comprar" },
  { href: "/propiedades?transactionType=RENT", label: "Rentar" },
  { href: "/vender", label: "Vender" },
];

/**
 * Authenticated navigation links
 * - Comprar, Rentar, Vender, Favoritos
 */
export const AUTHENTICATED_NAV_LINKS: NavLink[] = [
  { href: "/propiedades?transactionType=SALE", label: "Comprar" },
  { href: "/propiedades?transactionType=RENT", label: "Rentar" },
  { href: "/vender", label: "Vender" },
  { href: "/favoritos", label: "Favoritos", icon: "heart" },
];

/**
 * Get navigation links based on auth status
 */
export function getNavLinks(isAuthenticated: boolean): NavLink[] {
  return isAuthenticated ? AUTHENTICATED_NAV_LINKS : PUBLIC_NAV_LINKS;
}
