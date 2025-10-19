/**
 * PublicHeaderClient - Interactive Header Component
 *
 * Client Component that handles:
 * - Mobile menu toggle
 * - User dropdown menu
 * - Auth-aware navigation
 *
 * Receives props from Server Component (PublicHeader)
 *
 * REFACTORED: Now uses separated components for better maintainability
 */

"use client";

import type {SafeUser} from "@/lib/auth";
import {Heart, Home as HomeIcon, Menu, Search} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useRef} from "react";
import {AuthButtons} from "./navbar/auth-buttons";
import {getNavLinks} from "./navbar/constants/nav-links";
import {DesktopNav} from "./navbar/desktop-nav";
import {useMagneticEffect} from "./navbar/hooks/use-navbar-animations";
import {useMobileMenu} from "./navbar/hooks/use-mobile-menu";
import {MobileMenu} from "./navbar/mobile-menu";
import {UserDropdown} from "./navbar/user-dropdown";

interface PublicHeaderClientProps {
    isAuthenticated: boolean;
    user: SafeUser;
}

export function PublicHeaderClient({
    isAuthenticated,
    user,
}: PublicHeaderClientProps) {
    const pathname = usePathname();
    const isHomepage = pathname === "/";
    const isMapPage = pathname === "/mapa";
    const mobileMenu = useMobileMenu();
    const ctaButtonRef = useRef<HTMLDivElement>(null);
    const navLinks = getNavLinks(isAuthenticated);

    // Apply magnetic effect to CTA button (only on non-homepage and non-map)
    useMagneticEffect(ctaButtonRef, !isHomepage && !isMapPage, 0.2);

    return (
        <header
            data-navbar={isHomepage ? "homepage" : isMapPage ? "map" : "pages"}
            className={
                isHomepage
                    ? "fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10 shadow-lg shadow-black/20"
                    : isMapPage
                      ? "fixed top-0 left-0 right-0 z-50 max-w-6xl mx-auto mt-3 bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full"
                      : "sticky top-0 z-50 bg-oslo-gray-900/80 backdrop-blur-md border-b border-oslo-gray-700/50 shadow-lg"
            }
        >
            <nav className=" mx-auto px-4 sm:px-6 lg:px-8">
                <div
                    data-navbar-container="true"
                    className={`flex items-center h-16 ${
                        isMapPage ? "justify-between relative" : "justify-between"
                    }`}
                >
                    {/* Map Page Layout: Nav Left | Logo Center | Search+Auth Right */}
                    {isMapPage ? (
                        <>
                            {/* Left: Navigation Links (Desktop only) */}
                            <nav className="hidden md:flex items-center gap-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all text-white/80 hover:text-white hover:bg-white/10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                                    >
                                        {link.icon === "heart" && <Heart className="w-4 h-4"/>}
                                        <span>{link.label}</span>
                                    </Link>
                                ))}
                            </nav>

                            {/* Center: Logo (Floating) */}
                            <Link
                                href="/"
                                data-navbar-logo-text="true"
                                className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 font-bold text-xl text-white/60 hover:text-white/90 transition-colors z-10"
                            >
                                <HomeIcon
                                    data-navbar-logo-icon="true"
                                    className="w-6 h-6"
                                />
                                <span className="hidden sm:inline">InmoApp</span>
                            </Link>

                            {/* Right: Search + Auth (Desktop only) */}
                            <div className="hidden md:flex items-center gap-4">
                                {/* Search Button */}
                                <Link
                                    href="/propiedades"
                                    className="p-2 rounded-full transition-all text-white/80 hover:text-white hover:bg-white/10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                                    aria-label="Buscar propiedades"
                                >
                                    <Search className="w-5 h-5"/>
                                </Link>

                                {/* Divider */}
                                <div className="h-6 w-px bg-white/30"/>

                                {/* Auth Section */}
                                {isAuthenticated ? (
                                    <UserDropdown user={user} isHomepage={true}/>
                                ) : (
                                    <AuthButtons
                                        ref={ctaButtonRef}
                                        variant="desktop"
                                        isHomepage={true}
                                    />
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                type="button"
                                onClick={mobileMenu.toggle}
                                className="md:hidden p-2 rounded-lg transition-all hover:bg-white/10 text-white"
                                aria-label="Abrir menú"
                                aria-expanded={mobileMenu.isOpen}
                            >
                                <Menu className="w-6 h-6"/>
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Default Layout: Logo Left | Nav Right */}
                            <Link
                                href="/"
                                data-navbar-logo-text="true"
                                className={`flex items-center gap-2 font-bold text-xl ${
                                    isHomepage
                                        ? "text-white/80 hover:text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                                        : "text-oslo-gray-100 hover:text-blue-400"
                                }`}
                            >
                                <HomeIcon
                                    data-navbar-logo-icon="true"
                                    className="w-6 h-6"
                                />
                                <span>InmoApp</span>
                            </Link>

                            {/* Desktop Navigation */}
                            <DesktopNav
                                isAuthenticated={isAuthenticated}
                                user={user}
                                isHomepage={isHomepage}
                            />

                            {/* Mobile Menu Button */}
                            <button
                                type="button"
                                onClick={mobileMenu.toggle}
                                className={`md:hidden p-2 rounded-lg transition-all ${
                                    isHomepage
                                        ? "hover:bg-white/10 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                                        : "hover:bg-oslo-gray-800 text-oslo-gray-300"
                                }`}
                                aria-label="Abrir menú"
                                aria-expanded={mobileMenu.isOpen}
                            >
                                <Menu className="w-6 h-6"/>
                            </button>
                        </>
                    )}
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <MobileMenu
                isOpen={mobileMenu.isOpen}
                isAuthenticated={isAuthenticated}
                user={user}
                onClose={mobileMenu.close}
            />
        </header>
    );
}
