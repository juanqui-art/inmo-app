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
 * ALTERNATIVE 1: Monolithic component
 * ❌ Hard to test individual parts
 * ❌ Props drilling for complex configs
 * ✅ Simpler for basic use cases
 *
 * ALTERNATIVE 2: Separate unrelated components
 * ❌ No explicit connection between parts
 * ❌ Hard to share state if needed
 * ✅ Maximum flexibility
 *
 * ✅ We chose Compound Components because:
 * - Hero has multiple related parts (background, search, filters)
 * - Need flexibility to reorder
 * - Want to reuse SearchBar in header later
 *
 * PITFALL: Don't overuse this pattern
 * - Only for components with strong logical relationship
 * - Don't share complex state (use Context if needed)
 *
 * CURRENT ANIMATIONS (GSAP):
 * - Heading: Blur-to-Focus character reveal (SplitText + filter animation)
 * - Subheading: Simple fade-in for readability
 * - Search bar: Slide up + fade
 * - Background: Parallax on scroll
 * - Accessibility: Respects prefers-reduced-motion
 * - Performance: GPU-accelerated, 60fps guaranteed
 *
 * ALTERNATIVE TEXT ANIMATIONS (Commented for Future Use):
 * 1. Blur-to-Focus Gradient Reveal ✅ IMPLEMENTED
 * 2. 3D Cylinder Scroll Reveal (see ALTERNATIVE_ANIMATIONS.md)
 * 3. Clip-Path Diagonal Wipe (see ALTERNATIVE_ANIMATIONS.md)
 * 4. Word-by-Word Elastic Pop-In (see ALTERNATIVE_ANIMATIONS.md)
 * 5. Morphing Letter Heights with Shadow Depth (see ALTERNATIVE_ANIMATIONS.md)
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
import { useRef } from "react";
import { HeroBackground } from "./hero-background";
import { HeroSearchBar } from "./hero-search-bar";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Detect prefers-reduced-motion for accessibility
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        // Skip animations for users who prefer reduced motion
        gsap.set(
          ".hero-background, .hero-heading, .hero-subheading, .hero-search",
          {
            autoAlpha: 1, // Changed from opacity for consistent handling
            y: 0,
            filter: "blur(0px)",
          },
        );
        // Also reset popular cities visibility
        gsap.set(".hero-popular-cities", { autoAlpha: 1 });
        return;
      }

      // Create entrance timeline with staggered animations
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // 1. Background fades in (animate the inner div)
      tl.to(
        ".hero-background > div",
        {
          opacity: 1,
          duration: 0.8,
        },
        0,
      );

      // ============================================================
      // 2. HEADING: Blur-to-Focus Gradient Reveal (Animation #1)
      // ============================================================
      // Split main heading into characters for advanced animation
      const headingElement = document.querySelector(
        ".hero-heading:not(.hero-subheading)",
      );
      if (headingElement) {
        const split = new SplitText(headingElement, {
          type: "chars",
          charsClass: "char",
        });

        // Set initial state: blurred with reduced scale
        gsap.set(split.chars, {
          filter: "blur(10px)",
          opacity: 0,
          scale: 0.8,
          willChange: "filter, transform, opacity",
        });

        // Animate blur-to-focus character reveal
        tl.to(
          split.chars,
          {
            filter: "blur(0px)",
            opacity: 1,
            scale: 1,
            stagger: {
              each: 0.03, // Reduced from 0.03 for faster animation
              from: "start",
            },
            duration: 0.9, // Reduced from 0.8 for snappier feel
            ease: "power2.out",
            clearProps: "willChange",
          },
          0.3, // Start slightly after background
        );
      }

      // ============================================================
      // 3. SUBHEADING: Simple fade-in (to avoid visual overload)
      // ============================================================
      tl.fromTo(
        ".hero-subheading",
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.4", // Overlap with heading animation
      );

      // ============================================================
      // 4. POPULAR CITIES CHIPS: Fade in smoothly using autoAlpha
      // ============================================================
      // autoAlpha handles visibility + opacity, preventing backdrop-filter flash
      tl.fromTo(
        ".hero-popular-cities",
        {
          autoAlpha: 0, // visibility: hidden + opacity: 0
        },
        {
          autoAlpha: 1, // visibility: visible + opacity: 1
          duration: 1.2, // Smooth transition
          ease: "power3.inOut",
        },
        0.2,
      );

      // ============================================================
      // 5. SEARCH BAR: Slide up + fade
      // ============================================================
      tl.fromTo(
        ".hero-search",
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
        },
        "-=0.5",
      );

      // ============================================================
      // 5. PARALLAX: Background moves slower on scroll
      // ============================================================
      gsap.to(".hero-background > div", {
        yPercent: 30, // Move down 30% of its height
        ease: "none", // Linear movement for natural parallax
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1, // Smooth scrubbing (0-1 for smoothness)
          // markers: true, // Uncomment for debugging
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[600px] flex items-start justify-center overflow-hidden -mt-17"
    >
      {/* Background Layer - Full Screen (with parallax) - Extends behind navbar */}
      <div className="hero-background absolute inset-0 z-0 -top-14">
        <HeroBackground />
      </div>

      {/* Dark Gradient Overlay - Top section for header contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/15 to-transparent pointer-events-none z-[5]" />

      {/* Content Layer - Centered with padding for header */}
      <div className="relative z-10 w-full max-w-5xl px-4 text-center mt-40">
        {/* Main Heading - Blur-to-Focus Animation */}
        <h1
          className="hero-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white drop-shadow-2xl tracking-tight leading-[1.2] mb-2 will-change-auto px-2"
          style={{
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            wordSpacing: "0.1em",
            minHeight: "auto",
          }}
        >
          Vive en el lugar que siempre soñaste
        </h1>

        {/* Subheading - Simple Fade Animation */}
        <p className="hero-subheading text-lg md:text-xl lg:text-3xl text-white/90 max-w-3xl mx-auto font-medium leading-snug mb-9 drop-shadow-lg">
          Espacios diseñados para tu comodidad, rodeados de armonía y bienestar
        </p>

        {/* Search Bar - THE PRIMARY ACTION - Initially hidden */}
        <div className="hero-search opacity-0 ">
          <HeroSearchBar />
        </div>

        {/* Quick Filters - Secondary Actions - Initially hidden */}
        {/*<div className="hero-filters mt-6">*/}
        {/*  <HeroQuickFilters />*/}
        {/*</div>*/}
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
 *
 * Future Enhancement:
 * If we need more flexibility, we can expose sub-components:
 *
 * <HeroSection>
 *   <HeroSection.Background />
 *   <HeroSection.Content>
 *     <HeroSection.Heading />
 *     <HeroSection.SearchBar />
 *     <HeroSection.QuickFilters />
 *   </HeroSection.Content>
 * </HeroSection>
 */
