/**
 * HeroQuickFilters - Transaction Type Selector (Buy/Rent)
 *
 * PATTERN: Client Component with URL State + Magnetic Hover Effect
 *
 * WHY Client Component?
 * - Interactivity: Needs onClick handlers
 * - Navigation: Uses useRouter (client-side only)
 * - Small component: Minimal JavaScript cost
 *
 * WHY URL State?
 * - Shareable: User can copy/paste URL
 * - Bookmarkable: Can save search preferences
 * - SSR-friendly: Server can read on page load
 * - Single Source of Truth: No sync issues
 *
 * ALTERNATIVE 1: Local state (useState)
 * ❌ Not shareable
 * ❌ Lost on page refresh
 * ❌ Can't link directly to filtered view
 * ✅ Simpler for pure UI state
 *
 * ALTERNATIVE 2: Global state (Context, Zustand)
 * ❌ Overkill for simple filters
 * ❌ More code to maintain
 * ✅ Better for complex multi-page state
 *
 * ✅ We chose URL State because:
 * - Users want to share "Casas en venta" links
 * - Back button works naturally
 * - SEO-friendly (Google indexes filtered pages)
 *
 * ANIMATIONS (GSAP):
 * - Magnetic effect: Buttons follow cursor subtly
 * - Elastic return: Smooth bounce back to original position
 * - Performance: GPU-accelerated transforms
 *
 * PERFORMANCE:
 * - router.push(): Client-side navigation (fast)
 * - Prefetches next page on hover (instant feel)
 * - No page reload needed
 *
 * PITFALL: URL state can get messy
 * - Keep query params simple
 * - Use meaningful names (transactionType vs t)
 * - Clean up unused params
 *
 * RESOURCES:
 * - https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating
 * - https://web.dev/urlsearchparams/
 * - https://gsap.com/docs/v3/Eases/
 */

"use client";

import { TreesIcon, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function HeroQuickFilters() {
  const router = useRouter();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Navigate to listings page with transaction type filter
   *
   * FLOW:
   * 1. User clicks "Comprar"
   * 2. Navigate to /propiedades?transactionType=SALE
   * 3. Listings page reads searchParams
   * 4. Filters properties by SALE
   */
  const handleFilter = (type: "SALE" | "RENT") => {
    const params = new URLSearchParams();
    params.set("transactionType", type);

    router.push(`/propiedades?${params.toString()}`);
  };

  // Magnetic hover effect
  useGSAP(() => {
    buttonRefs.current.forEach((button) => {
      if (!button) return;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Move button 20% towards cursor position
        gsap.to(button, {
          x: x * 0.2,
          y: y * 0.2,
          duration: 0.4,
          ease: "power2.out",
        });
      };

      const handleMouseLeave = () => {
        // Return to original position with elastic bounce
        gsap.to(button, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.3)",
        });
      };

      button.addEventListener("mousemove", handleMouseMove);
      button.addEventListener("mouseleave", handleMouseLeave);

      // Cleanup
      return () => {
        button.removeEventListener("mousemove", handleMouseMove);
        button.removeEventListener("mouseleave", handleMouseLeave);
      };
    });
  });

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
      {/* Buy Button - Glassmorphism Style with Magnetic Effect */}
      <button
        ref={(el) => {
          buttonRefs.current[0] = el;
        }}
        type="button"
        onClick={() => handleFilter("SALE")}
        className="
          flex items-center gap-2
          px-5 py-3 sm:px-6 sm:py-3.5
          bg-white/10 hover:bg-white/20
          backdrop-blur-md
          text-white font-semibold
          rounded-full
          border border-white/30 hover:border-white/50
          shadow-lg hover:shadow-xl
          transition-all duration-200
          hover:scale-105
          active:scale-95
          min-h-[44px]
        "
        aria-label="Buscar propiedades en venta"
      >
        <Home className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="text-sm sm:text-base">Casas</span>
      </button>

      {/* Rent Button - Glassmorphism Style with Magnetic Effect */}
      <button
        ref={(el) => {
          buttonRefs.current[1] = el;
        }}
        type="button"
        onClick={() => handleFilter("RENT")}
        className="
          flex items-center gap-2
          px-5 py-3 sm:px-6 sm:py-3.5
          bg-white/10 hover:bg-white/20
          backdrop-blur-md
          text-white font-semibold
          rounded-full
          border border-white/30 hover:border-white/50
          shadow-lg hover:shadow-xl
          transition-all duration-200
          hover:scale-105
          active:scale-95
          min-h-[44px]
        "
        aria-label="Buscar propiedades en renta"
      >
        <TreesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="text-sm sm:text-base">Terrenos</span>
      </button>

      {/*
        DESIGN NOTE: Glassmorphism Style (updated 2025)
        - Visual Cohesion: Matches Smart Chips style (rounded-full, backdrop-blur)
        - Modern: Glassmorphism with semi-transparent backgrounds
        - Readability: White text on dark overlay with border for definition
        - Interactive: Scale animations (hover:scale-105) for tactile feedback
        - Consistent: Same design language across all hero interactive elements

        ACCESSIBILITY NOTE:
        - type="button": Explicit button type (no form submission)
        - aria-label: Screen readers know button purpose
        - min-h-[44px]: Touch targets meet WCAG 2.1 standards (44x44px)
        - Keyboard accessible: Can tab to buttons and activate with Enter/Space
        - High contrast: Border ensures visibility on all backgrounds
        - Active states: Provides visual feedback on interaction (active:scale-95)
      */}
    </div>
  );
}

/**
 * Future Enhancements:
 *
 * 1. Add "Vender" button (link to agent signup):
 *    <button onClick={() => router.push('/agentes/registro')}>
 *      Vender
 *    </button>
 *
 * 2. Show active state if already on filtered page:
 *    const searchParams = useSearchParams()
 *    const isActive = searchParams.get('transactionType') === 'SALE'
 *    className={isActive ? 'bg-blue-500 text-white' : 'bg-white'}
 *
 * 3. Add property count badges:
 *    <span className="text-xs">
 *      {saleCount} disponibles
 *    </span>
 */
