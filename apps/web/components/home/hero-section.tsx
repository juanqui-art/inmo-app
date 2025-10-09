/**
 * HeroSection - Search-First Landing Section
 *
 * PATTERN: Compound Component Pattern
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
 * RESOURCES:
 * - https://kentcdodds.com/blog/compound-components-with-react-hooks
 * - https://www.patterns.dev/posts/compound-pattern
 */

import { HeroBackground } from "./hero-background";
import { HeroQuickFilters } from "./hero-quick-filters";
import { HeroSearchBar } from "./hero-search-bar";

export function HeroSection() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Layer - Full Screen */}
      <HeroBackground />

      {/* Content Layer - Centered with padding for header */}
      <div className="relative z-10 w-full max-w-4xl px-4 text-center">
        {/* Heading - Specific and Contextual */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-10 drop-shadow-2xl tracking-tight">
          Encuentra tu Hogar Ideal
          <br />
          {/*<span className="text-4xl md:text-5xl lg:text-6xl">*/}
          {/*  en Azuay y Cañar*/}
          {/*</span>*/}
        </h1>

        {/* Search Bar - THE PRIMARY ACTION */}
        <div className="mb-8">
          <HeroSearchBar />
        </div>

        {/* Quick Filters - Secondary Actions */}
        <div className="mt-6">
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
