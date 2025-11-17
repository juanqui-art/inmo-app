import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Animate property page sections with staggered fade-in
 * Triggers on scroll when section enters viewport
 */
export function animatePropertySections(
  container: HTMLElement | null,
  options?: {
    staggerDelay?: number;
    duration?: number;
    ease?: string;
  },
) {
  if (!container) return;

  const {
    staggerDelay = 0.1,
    duration = 0.6,
    ease = "power2.out",
  } = options || {};

  const cards = container.querySelectorAll("[data-animate-card]");

  gsap.fromTo(
    cards,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration,
      ease,
      stagger: staggerDelay,
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    },
  );
}

/**
 * Animate counter from 0 to target value
 * Useful for stats like bedrooms, bathrooms, area
 */
export function animateCounter(
  element: HTMLElement | null,
  targetValue: number,
  options?: {
    duration?: number;
    ease?: string;
    decimals?: number;
  },
) {
  if (!element) return;

  const { duration = 1.5, ease = "power1.out", decimals = 0 } = options || {};

  const counterObj = { count: 0 };
  gsap.to(counterObj, {
    count: targetValue,
    duration,
    ease,
    onUpdate: function () {
      const current = (this.targets()[0] as any).count;
      const value =
        decimals > 0
          ? current.toFixed(decimals)
          : Math.round(current).toString();
      element.textContent = value;
    },
  });
}

/**
 * Animate height expansion/collapse for read-more functionality
 */
export function animateHeightToggle(
  element: HTMLElement | null,
  targetHeight: number | "auto",
  options?: {
    duration?: number;
    ease?: string;
  },
) {
  if (!element) return;

  const { duration = 0.4, ease = "power2.inOut" } = options || {};

  const height = targetHeight === "auto" ? element.scrollHeight : targetHeight;

  gsap.to(element, {
    height,
    duration,
    ease,
    overwrite: "auto",
  });
}

/**
 * Parallax effect for hero image (scroll-based)
 * Apply to image container
 */
export function animateHeroParallax(
  element: HTMLElement | null,
  // Reserved for future parallax strength configuration
  // strength: number = 0.5
) {
  if (!element) return;

  ScrollTrigger.create({
    trigger: element,
    onUpdate: (self) => {
      const progress = self.getVelocity() / 300;
      const rotation = Math.min(Math.max(-20, progress), 20);

      gsap.to(element, {
        rotationZ: rotation,
        overwrite: "auto",
      });
    },
  });

  // Parallax movement
  gsap.to(element, {
    yPercent: -20,
    scrollTrigger: {
      trigger: element,
      scrub: 1,
    },
  });
}

/**
 * Zoom animation for modal/lightbox images
 */
export function animateImageZoom(
  element: HTMLElement | null,
  isZoomedIn: boolean,
  options?: {
    duration?: number;
    scale?: number;
  },
) {
  if (!element) return;

  const { duration = 0.3, scale = 1.1 } = options || {};

  gsap.to(element, {
    scale: isZoomedIn ? scale : 1,
    duration,
    ease: "power2.out",
  });
}

/**
 * Staggered fade-in for thumbnail strips
 */
export function animateThumbnailStrip(
  container: HTMLElement | null,
  options?: {
    staggerDelay?: number;
    duration?: number;
  },
) {
  if (!container) return;

  const { staggerDelay = 0.05, duration = 0.4 } = options || {};

  const thumbnails = container.querySelectorAll("button");

  gsap.fromTo(
    thumbnails,
    { opacity: 0 },
    {
      opacity: 1,
      duration,
      stagger: staggerDelay,
      ease: "power1.inOut",
    },
  );
}

/**
 * Respects prefers-reduced-motion setting
 * Returns true if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Wrapper for animations that respects accessibility preferences
 * If reduced motion is enabled, instantly applies the final state
 */
export function safeAnimate(
  target: gsap.TweenTarget,
  vars: gsap.TweenVars,
): gsap.core.Tween {
  if (prefersReducedMotion()) {
    // Apply final state instantly
    gsap.set(target, vars);
    return gsap.to(target, { duration: 0 });
  }

  return gsap.to(target, vars);
}

/**
 * Cleanup ScrollTriggers on component unmount
 * Use in useEffect cleanup
 */
export function cleanupScrollTriggers(element: HTMLElement | null) {
  if (!element) return;

  const triggers = ScrollTrigger.getAll().filter(
    (trigger) => trigger.trigger === element,
  );

  triggers.forEach((trigger) => trigger.kill());
}

/**
 * Ripple effect for buttons on click
 */
export function createRippleEffect(event: React.MouseEvent<HTMLElement>) {
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const ripple = document.createElement("span");
  ripple.className =
    "absolute rounded-full pointer-events-none bg-white/40 animate-ripple";
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = "0";
  ripple.style.height = "0";

  button.style.position = "relative";
  button.style.overflow = "hidden";
  button.appendChild(ripple);

  gsap.to(ripple, {
    width: Math.max(rect.width, rect.height) * 2,
    height: Math.max(rect.width, rect.height) * 2,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out",
    onComplete: () => {
      ripple.remove();
    },
  });
}

export default {
  animatePropertySections,
  animateCounter,
  animateHeightToggle,
  animateHeroParallax,
  animateImageZoom,
  animateThumbnailStrip,
  prefersReducedMotion,
  safeAnimate,
  cleanupScrollTriggers,
  createRippleEffect,
};
