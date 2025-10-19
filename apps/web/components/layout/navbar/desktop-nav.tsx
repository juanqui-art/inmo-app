/**
 * Desktop Navigation Component
 *
 * Complete desktop navigation section
 * - Navigation links
 * - Social media icons
 * - Search button
 * - Auth section (login/signup OR user dropdown)
 */

"use client";

import type {SafeUser} from "@/lib/auth";
import {Heart, Search} from "lucide-react";
import Link from "next/link";
import {useRef} from "react";
import {AuthButtons} from "./auth-buttons";
import {getNavLinks} from "./constants/nav-links";
import {useMagneticEffect} from "./hooks/use-navbar-animations";
import {SocialLinks} from "./social-links";
import {UserDropdown} from "./user-dropdown";

interface DesktopNavProps {
    isAuthenticated: boolean;
    user: SafeUser;
    isHomepage: boolean;
    isMapPage?: boolean;
    isDarkMode?: boolean;
}

export function DesktopNav({isAuthenticated, user, isHomepage, isMapPage = false}: DesktopNavProps) {
    const ctaButtonRef = useRef<HTMLDivElement>(null);
    const navLinks = getNavLinks(isAuthenticated);

    // Apply magnetic effect to CTA button (only on non-homepage and non-map)
    useMagneticEffect(ctaButtonRef, !isHomepage && !isMapPage, 0.2);

    // Special layout for map page: content should be distributed (left and right)
    // This component will be split by the parent container
    return (
        <div className={`hidden md:flex items-center ${isMapPage ? "gap-4" : "gap-6"}`}>
            {/* GROUP 1: Navigation Links */}
            <nav className="flex items-center gap-6">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all ${
                            isHomepage || isMapPage
                                ? "text-white/80 hover:text-white hover:bg-white/10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                                : "text-oslo-gray-300 hover:text-oslo-gray-100 hover:bg-oslo-gray-800"
                        }`}
                    >
                        {link.icon === "heart" && <Heart className="w-4 h-4"/>}
                        <span>{link.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Social Media Icons - Desktop (hidden on map page) */}
            {!isMapPage && (
                <SocialLinks variant="desktop" isHomepage={isHomepage}/>
            )}

            {/* GROUP 2: Search */}
            <div className="flex items-center">
                <Link
                    href="/propiedades"
                    className={`p-2 rounded-full transition-all ${
                        isHomepage || isMapPage
                            ? "text-white/80 hover:text-white hover:bg-white/10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                            : "text-oslo-gray-300 hover:text-oslo-gray-100 hover:bg-oslo-gray-800"
                    }`}
                    aria-label="Buscar propiedades"
                >
                    <Search className="w-5 h-5"/>
                </Link>
            </div>

            {/* Vertical Divider */}
            <div
                className={`h-6 w-px ${
                    isHomepage || isMapPage ? "bg-white/30" : "bg-oslo-gray-700"
                }`}
            />

            {/* GROUP 3: Auth Section */}
            {isAuthenticated ? (
                <UserDropdown user={user} isHomepage={isHomepage || isMapPage}/>
            ) : (
                <AuthButtons
                    ref={ctaButtonRef}
                    variant="desktop"
                    isHomepage={isHomepage || isMapPage}
                />
            )}
        </div>
    );
}
