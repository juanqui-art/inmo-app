/**
 * useScrollPosition Hook
 *
 * Custom hook to track scroll position and direction
 * Optimized with RAF (requestAnimationFrame) for performance
 *
 * Returns:
 * - scrollY: current vertical scroll position
 * - scrollDirection: 'up' | 'down' | null
 * - isScrolled: true when scrollY > threshold
 */

"use client";

import { useEffect, useState } from "react";

interface ScrollPosition {
  scrollY: number;
  scrollDirection: "up" | "down" | null;
  isScrolled: boolean;
}

export function useScrollPosition(threshold = 50): ScrollPosition {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null,
  );
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;

      // Update scroll direction
      if (currentScrollY > lastScrollY) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection("up");
      }

      // Update scroll position
      setScrollY(currentScrollY);

      // Update scrolled state
      setIsScrolled(currentScrollY > threshold);

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      // Use RAF for performance
      if (!ticking) {
        window.requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    };

    // Add event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    updateScrollPosition();

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return { scrollY, scrollDirection, isScrolled };
}
