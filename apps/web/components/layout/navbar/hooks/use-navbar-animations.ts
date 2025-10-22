/**
 * Navbar Animations Hook
 *
 * Manages GSAP animations for navbar components
 * - Magnetic effect for CTA buttons
 * - Stagger fade-in for menu items
 */

"use client";

import {
  createMagneticEffect,
  staggerFadeIn,
} from "@/lib/animations/navbar-animations";
import { useEffect } from "react";

/**
 * Hook for magnetic hover effect
 * Premium interactive feel on buttons
 *
 * @param ref - Ref to element to apply magnetic effect
 * @param enabled - Whether effect is enabled (e.g., not on homepage)
 * @param strength - Strength of magnetic pull (default: 0.2)
 */
export function useMagneticEffect(
  ref: React.RefObject<HTMLElement | null>,
  enabled = true,
  strength = 0.2,
) {
  useEffect(() => {
    if (ref.current && enabled) {
      const cleanup = createMagneticEffect(ref.current, strength);
      return cleanup;
    }
  }, [ref, enabled, strength]);
}

/**
 * Hook for stagger fade-in animation
 * Used for dropdown menus and mobile menu items
 *
 * @param ref - Ref to container element
 * @param isOpen - Whether menu is open (triggers animation)
 * @param selector - CSS selector for items to animate (default: "a, button")
 */
export function useStaggerAnimation(
  ref: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  selector = "a, button",
) {
  useEffect(() => {
    if (isOpen && ref.current) {
      const items = ref.current.querySelectorAll(selector);
      if (items.length > 0) {
        staggerFadeIn(items);
      }
    }
  }, [ref, isOpen, selector]);
}
