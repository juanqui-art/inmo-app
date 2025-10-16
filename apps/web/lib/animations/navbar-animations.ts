/**
 * Navbar Animations Utilities
 *
 * GSAP-powered animations for navbar components
 * - Magnetic hover effect
 * - Active link indicator
 * - Smooth transitions
 */

import gsap from "gsap";

/**
 * Magnetic Hover Effect
 *
 * Makes buttons "attract" the cursor when nearby
 * Creates premium, interactive feel
 *
 * Usage:
 *   const buttonRef = useRef<HTMLButtonElement>(null);
 *   useEffect(() => {
 *     if (buttonRef.current) {
 *       const cleanup = createMagneticEffect(buttonRef.current);
 *       return cleanup;
 *     }
 *   }, []);
 */
export function createMagneticEffect(
  element: HTMLElement,
  strength = 0.3,
): () => void {
  let isHovering = false;

  const handleMouseMove = (e: MouseEvent) => {
    if (!isHovering) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate distance from center
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    // Animate position
    gsap.to(element, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseEnter = () => {
    isHovering = true;
  };

  const handleMouseLeave = () => {
    isHovering = false;

    // Return to original position
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.5)",
    });
  };

  // Add event listeners
  element.addEventListener("mousemove", handleMouseMove);
  element.addEventListener("mouseenter", handleMouseEnter);
  element.addEventListener("mouseleave", handleMouseLeave);

  // Cleanup function
  return () => {
    element.removeEventListener("mousemove", handleMouseMove);
    element.removeEventListener("mouseenter", handleMouseEnter);
    element.removeEventListener("mouseleave", handleMouseLeave);
  };
}

/**
 * Active Link Indicator Animation
 *
 * Animates underline/highlight to active nav link
 * Smooth slide effect between links
 *
 * Usage:
 *   const navRef = useRef<HTMLDivElement>(null);
 *   const indicatorRef = useRef<HTMLDivElement>(null);
 *
 *   useEffect(() => {
 *     if (navRef.current && indicatorRef.current) {
 *       animateActiveIndicator(navRef.current, indicatorRef.current, activeIndex);
 *     }
 *   }, [activeIndex]);
 */
export function animateActiveIndicator(
  container: HTMLElement,
  indicator: HTMLElement,
  activeIndex: number,
) {
  const links = container.querySelectorAll("a");
  const activeLink = links[activeIndex];

  if (!activeLink) {
    // Hide indicator if no active link
    gsap.to(indicator, {
      opacity: 0,
      duration: 0.2,
    });
    return;
  }

  const linkRect = activeLink.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  // Calculate position relative to container
  const left = linkRect.left - containerRect.left;
  const width = linkRect.width;

  // Animate indicator
  gsap.to(indicator, {
    x: left,
    width: width,
    opacity: 1,
    duration: 0.4,
    ease: "power2.out",
  });
}

/**
 * Stagger Fade In Animation
 *
 * Animates elements in sequence
 * Used for dropdown menus, mobile menu items
 *
 * Usage:
 *   useEffect(() => {
 *     if (isOpen) {
 *       staggerFadeIn(menuItems);
 *     }
 *   }, [isOpen]);
 */
export function staggerFadeIn(elements: HTMLElement[] | NodeListOf<Element>) {
  gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: 10,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.3,
      stagger: 0.05,
      ease: "power2.out",
    },
  );
}

/**
 * Scale Pulse Animation
 *
 * Subtle pulse effect for badges/notifications
 *
 * Usage:
 *   useEffect(() => {
 *     if (badgeRef.current) {
 *       scalePulse(badgeRef.current);
 *     }
 *   }, []);
 */
export function scalePulse(element: HTMLElement, repeat = true) {
  gsap.to(element, {
    scale: 1.1,
    duration: 0.6,
    repeat: repeat ? -1 : 0,
    yoyo: true,
    ease: "power1.inOut",
  });
}

/**
 * Navbar Shrink Animation
 *
 * Smoothly reduces navbar height/padding on scroll
 *
 * Usage:
 *   useEffect(() => {
 *     animateNavbarShrink(navRef.current, isScrolled);
 *   }, [isScrolled]);
 */
export function animateNavbarShrink(
  element: HTMLElement | null,
  isScrolled: boolean,
) {
  if (!element) return;

  if (isScrolled) {
    // Shrink
    gsap.to(element, {
      height: 56, // Reduced height
      duration: 0.3,
      ease: "power2.out",
    });
  } else {
    // Expand
    gsap.to(element, {
      height: 64, // Original height
      duration: 0.3,
      ease: "power2.out",
    });
  }
}

/**
 * Check for reduced motion preference
 *
 * Respects user's accessibility settings
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Safe GSAP animation wrapper
 *
 * Only animates if user hasn't requested reduced motion
 */
export function safeAnimate(
  target: gsap.TweenTarget,
  vars: gsap.TweenVars,
): gsap.core.Tween | null {
  if (prefersReducedMotion()) {
    // Apply final state immediately without animation
    const elements = gsap.utils.toArray(target);
    elements.forEach((el) => {
      // We can safely cast to HTMLElement as GSAP targets are elements
      // and we are manipulating style properties.
      Object.assign((el as HTMLElement).style, vars);
    });
    return null;
  }

  return gsap.to(target, vars);
}
