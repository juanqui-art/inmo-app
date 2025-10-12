/**
 * HeroSection - Search-First Landing Section
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
 * ANIMATIONS (GSAP):
 * - Entrance: Staggered fade-in with slide up
 * - Parallax: Background moves slower on scroll (depth effect)
 * - Accessibility: Respects prefers-reduced-motion
 * - Performance: GPU-accelerated, 60fps guaranteed
 *
 * RESOURCES:
 * - https://kentcdodds.com/blog/compound-components-with-react-hooks
 * - https://www.patterns.dev/posts/compound-pattern
 * - https://gsap.com/docs/v3/GSAP/gsap.timeline()
 * - https://gsap.com/docs/v3/Plugins/ScrollTrigger/
 */

"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeroBackground } from "./hero-background";
import { HeroQuickFilters } from "./hero-quick-filters";
import { HeroSearchBar } from "./hero-search-bar";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

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
        gsap.set(".hero-background, .hero-heading, .hero-search, .hero-filters", {
          opacity: 1,
          y: 0,
        });
        return;
      }

      // Create entrance timeline with staggered animations
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // 1. Background fades in (animate the inner div)
      tl.to(".hero-background > div", {
        opacity: 1,
        duration: 0.8,
      })
        // 2. Heading slides up with slight delay (overlap for smoothness)
        .fromTo(
          ".hero-heading",
          {
            y: 60,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power4.out",
          },
          "-=0.3",
        )
        // 3. Search bar appears from top
        .fromTo(
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
        )
        // 4. Filter buttons stagger in (each 150ms apart)
        .fromTo(
          ".hero-filters button",
          {
            y: 20,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.6,
          },
          "-=0.4",
        );

      // Parallax effect on scroll (background moves slower than content)
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
      className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      {/* Background Layer - Full Screen (with parallax) */}
      <div className="hero-background">
        <HeroBackground />
      </div>

      {/* Content Layer - Centered with padding for header */}
      <div className="relative z-10 w-full max-w-4xl px-4 text-center">
        {/* Heading - Specific and Contextual - Initially hidden */}
        <h1 className="hero-heading opacity-0 text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-10 drop-shadow-2xl tracking-tight">
          Encuentra tu Hogar Ideal
          <br />
          {/*<span className="text-4xl md:text-5xl lg:text-6xl">*/}
          {/*  en Azuay y Cañar*/}
          {/*</span>*/}
        </h1>

        {/* Search Bar - THE PRIMARY ACTION - Initially hidden */}
        <div className="hero-search opacity-0 mb-8">
          <HeroSearchBar />
        </div>

        {/* Quick Filters - Secondary Actions - Initially hidden */}
        <div className="hero-filters mt-6">
          <HeroQuickFilters />
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
