/**
 * ActiveLinkIndicator Component
 *
 * Animated indicator that slides between active navigation links
 * Creates smooth, premium feel for navigation
 *
 * Usage:
 * <nav ref={navRef} className="relative">
 *   {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
 *   <ActiveLinkIndicator containerRef={navRef} activeIndex={activeIndex} />
 * </nav>
 */

"use client";

import { useEffect, useRef } from "react";
import { animateActiveIndicator } from "@/lib/animations/navbar-animations";

interface ActiveLinkIndicatorProps {
  containerRef: React.RefObject<HTMLElement>;
  activeIndex: number;
  className?: string;
  color?: string;
}

export function ActiveLinkIndicator({
  containerRef,
  activeIndex,
  className = "",
  color = "bg-indigo-500",
}: ActiveLinkIndicatorProps) {
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && indicatorRef.current) {
      animateActiveIndicator(
        containerRef.current,
        indicatorRef.current,
        activeIndex,
      );
    }
  }, [containerRef, activeIndex]);

  return (
    <div
      ref={indicatorRef}
      className={`absolute bottom-0 left-0 h-0.5 ${color} opacity-0 ${className}`}
      aria-hidden="true"
    />
  );
}
