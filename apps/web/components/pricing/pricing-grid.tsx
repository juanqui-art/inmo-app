"use client";

import { PricingCard, PricingTier } from "@/components/pricing/pricing-card";
import * as motion from "motion/react-client";
import { useState } from "react";

interface PricingGridProps {
  tiers: PricingTier[];
}

export function PricingGrid({ tiers }: PricingGridProps) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="w-full">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="relative flex items-center p-1 bg-oslo-gray-100 dark:bg-oslo-gray-800 rounded-full border border-oslo-gray-200 dark:border-oslo-gray-700">
          <button
            onClick={() => setIsYearly(false)}
            className={`relative px-6 py-2 text-sm font-semibold rounded-full transition-colors z-10 ${
              !isYearly ? "text-oslo-gray-900 dark:text-white" : "text-oslo-gray-500 hover:text-oslo-gray-900 dark:hover:text-white"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`relative px-6 py-2 text-sm font-semibold rounded-full transition-colors z-10 flex items-center gap-2 ${
              isYearly ? "text-oslo-gray-900 dark:text-white" : "text-oslo-gray-500 hover:text-oslo-gray-900 dark:hover:text-white"
            }`}
          >
            Anual
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-full">
              -17%
            </span>
          </button>
          
          {/* Animated Background Pill */}
          <div className="absolute inset-1 pointer-events-none">
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="h-full bg-white dark:bg-oslo-gray-700 rounded-full shadow-sm"
              style={{
                width: "50%",
                x: isYearly ? "100%" : "0%"
              }}
            />
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {tiers.map((tier) => (
          <PricingCard 
            key={tier.name} 
            tier={tier} 
            compact={true} 
            isYearly={isYearly} 
          />
        ))}
      </div>
    </div>
  );
}
