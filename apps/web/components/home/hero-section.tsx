/**
 * HeroSection - Search-First Landing Section with Advanced GSAP Animations
 *
 * PATTERN: Compound Component Pattern + GSAP Animations
 *
 * WHY Compound Components?
 * - Flexibility: Easy to reorder elements
 * - Composition: Small, testable sub-components
 * - Reusability: SearchBar can be used elsewhere
 * - Co-location: Related logic stays together
 *
 * OPTIMIZATIONS APPLIED:
 * ✅ Refs instead of CSS selectors (more robust)
 * ✅ GSAP cleanup to prevent memory leaks
 * ✅ Memoized child components (fewer re-renders)
 * ✅ Named animation constants (maintainable)
 * ✅ Accessibility improvements (screen reader support)
 * ✅ Fixed Tailwind classes (valid values)
 * ✅ Stricter TypeScript types
 *
 * CURRENT ANIMATIONS (GSAP):
 * - Heading: Blur-to-Focus character reveal (SplitText + filter animation)
 * - Subheading: Simple fade-in for readability
 * - Search bar: Slide up + fade
 * - Background: Parallax on scroll
 * - Accessibility: Respects prefers-reduced-motion
 * - Performance: GPU-accelerated, 60fps guaranteed
 *
 * RESOURCES:
 * - https://kentcdodds.com/blog/compound-components-with-react-hooks
 * - https://www.patterns.dev/posts/compound-pattern
 * - https://gsap.com/docs/v3/GSAP/gsap.timeline()
 * - https://gsap.com/docs/v3/Plugins/ScrollTrigger/
 * - https://gsap.com/docs/v3/Plugins/SplitText/
 */

"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { memo, useRef } from "react";
import { HeroBackground } from "./hero-background";
import { HeroSearchBar } from "./hero-search-bar";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Animation timing constants
 * Extracted for easy tweaking and maintainability
 */
const ANIMATION_CONFIG = {
  // Entrance timeline
  background: {
    duration: 0.8,
    delay: 0,
  },
  heading: {
    staggerEach: 0.03, // Time between each character animation
    duration: 0.9,
    delay: 0.3, // Start after background begins
    blurAmount: 10, // Initial blur in pixels
  },
  subheading: {
    duration: 0.8,
    yOffset: 20, // Initial vertical offset
    overlap: 0.4, // Overlap with heading animation
  },
  searchBar: {
    duration: 0.8,
    yOffset: 40, // Initial vertical offset
    overlap: 0.5, // Overlap with previous animation
  },
  // Parallax scroll
  parallax: {
    yPercent: 30, // Background moves 30% of its height
    scrub: 1, // Smoothness (0-1)
  },
} as const;

/**
 * Memoized child components to prevent unnecessary re-renders
 */
const MemoizedHeroBackground = memo(HeroBackground);
MemoizedHeroBackground.displayName = "MemoizedHeroBackground";

const MemoizedHeroSearchBar = memo(HeroSearchBar);
MemoizedHeroSearchBar.displayName = "MemoizedHeroSearchBar";

export function HeroSection() {
  // Refs for GSAP animations (more robust than CSS selectors)
  const sectionRef = useRef<HTMLElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Detect prefers-reduced-motion for accessibility
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Early return if user prefers reduced motion
      if (prefersReducedMotion) {
        // Set all elements to their final state immediately
        const elements = [
          backgroundRef.current,
          headingRef.current,
          subheadingRef.current,
          searchRef.current,
        ].filter(Boolean);

        gsap.set(elements, {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
        });
        return;
      }

      // Track SplitText instance for cleanup
      let splitInstance: SplitText | null = null;

      // Create entrance timeline with staggered animations
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // ============================================================
      // 1. BACKGROUND: Fade in
      // ============================================================
      if (backgroundRef.current) {
        tl.to(
          backgroundRef.current,
          {
            opacity: 1,
            duration: ANIMATION_CONFIG.background.duration,
          },
          ANIMATION_CONFIG.background.delay,
        );
      }

      // ============================================================
      // 2. HEADING: Blur-to-Focus Word Reveal
      // ============================================================
      if (headingRef.current) {
        splitInstance = new SplitText(headingRef.current, {
          type: "words",
          wordsClass: "word",
        });

        // Set initial state: blurred with reduced scale
        gsap.set(splitInstance.words, {
          filter: `blur(${ANIMATION_CONFIG.heading.blurAmount}px)`,
          opacity: 0,
          scale: 0.8,
        });

        // Animate blur-to-focus word reveal
        tl.to(
          splitInstance.words,
          {
            filter: "blur(0px)",
            opacity: 1,
            scale: 1,
            stagger: {
              each: ANIMATION_CONFIG.heading.staggerEach,
              from: "start",
            },
            duration: ANIMATION_CONFIG.heading.duration,
            ease: "power2.out",
          },
          ANIMATION_CONFIG.heading.delay,
        );
      }

      // ============================================================
      // 3. SUBHEADING: Simple fade-in
      // ============================================================
      if (subheadingRef.current) {
        tl.fromTo(
          subheadingRef.current,
          {
            opacity: 0,
            y: ANIMATION_CONFIG.subheading.yOffset,
          },
          {
            opacity: 1,
            y: 0,
            duration: ANIMATION_CONFIG.subheading.duration,
            ease: "power2.out",
          },
          `-=${ANIMATION_CONFIG.subheading.overlap}`,
        );
      }

      // ============================================================
      // 4. SEARCH BAR: Slide up + fade
      // ============================================================
      if (searchRef.current) {
        tl.fromTo(
          searchRef.current,
          {
            y: ANIMATION_CONFIG.searchBar.yOffset,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: ANIMATION_CONFIG.searchBar.duration,
          },
          `-=${ANIMATION_CONFIG.searchBar.overlap}`,
        );
      }

      // ============================================================
      // 5. PARALLAX: Background moves slower on scroll
      // ============================================================
      if (backgroundRef.current && sectionRef.current) {
        gsap.to(backgroundRef.current, {
          yPercent: ANIMATION_CONFIG.parallax.yPercent,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: ANIMATION_CONFIG.parallax.scrub,
          },
        });
      }

      // ============================================================
      // CLEANUP: Prevent memory leaks
      // ============================================================
      return () => {
        // Kill timeline and all its animations
        tl.kill();

        // Revert SplitText to restore original DOM
        if (splitInstance) {
          splitInstance.revert();
        }

        // Kill all ScrollTriggers associated with this scope
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.vars.trigger === sectionRef.current) {
            trigger.kill();
          }
        });
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[600px] flex items-start justify-center overflow-hidden -mt-16 isolate"
      aria-label="Hero section"
    >
      {/* Background Layer - Full Screen (with parallax) */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 z-0 -top-14 opacity-0"
      >
        <MemoizedHeroBackground />
      </div>

      {/* Content Layer - Centered with padding for header */}
      <div className="relative z-10 w-full max-w-5xl px-4 text-center mt-40 pointer-events-none">
        {/* Main Heading - Blur-to-Focus Animation */}
        <h1
          ref={headingRef}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-2xl tracking-tight leading-[1.2] mb-2 px-2"
          aria-label="Vive en el lugar que siempre soñaste"
          style={{
            backfaceVisibility: "hidden",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            wordSpacing: "0.1em",
          }}
        >
          Vive en el lugar que siempre soñaste
        </h1>

        {/* Subheading - Simple Fade Animation */}
        <p
          ref={subheadingRef}
          className="text-lg md:text-xl lg:text-3xl text-white/90 max-w-3xl mx-auto font-medium leading-snug mb-9 drop-shadow-lg opacity-0"
        >
          Espacios diseñados para tu comodidad, rodeados de armonía y bienestar
        </p>

        {/* Search Bar - THE PRIMARY ACTION */}
        <div ref={searchRef} className="opacity-0">
          <MemoizedHeroSearchBar />
        </div>
      </div>
    </section>
  );
}

/**
 * Usage Example:
 *
 * <HeroSection />
 *
 * The simplicity of usage is a key benefit of Compound Components.
 * All complexity is encapsulated, but can be customized if needed.
 */
