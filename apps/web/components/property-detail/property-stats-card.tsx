"use client";

import { cn } from "@repo/ui";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

interface PropertyStatsCardProps {
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
}

interface StatItemProps {
  icon: string;
  label: string;
  value: number | null | undefined;
  unit?: string;
  isHovered: boolean;
  onHover: (isHovered: boolean) => void;
}

function StatItem({
  icon,
  label,
  value,
  unit = "",
  isHovered,
  onHover,
}: StatItemProps) {
  const counterRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!value || !counterRef.current || hasAnimated.current) return;

    const counter = counterRef.current;
    const displayValue = Math.round(value * 10) / 10; // Handle decimals

    // Create trigger for scroll-based animation
    ScrollTrigger.create({
      trigger: counter,
      onEnter: () => {
        if (hasAnimated.current) return;
        hasAnimated.current = true;

        gsap.fromTo(
          { count: 0 },
          { count: displayValue, duration: 1.5, ease: "power1.out" },
          {
            onUpdate: function () {
              if (counter) {
                const current = this.targets()[0].count;
                const isDecimal = displayValue % 1 !== 0;
                counter.textContent = isDecimal
                  ? current.toFixed(1)
                  : Math.round(current).toString();
              }
            },
          },
        );
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === counter) trigger.kill();
      });
    };
  }, [value]);

  if (!value) return null;

  return (
    <div
      className={cn(
        "bg-oslo-gray-50 dark:bg-oslo-gray-900 p-4 rounded-lg text-center transition-all duration-300",
        "border border-oslo-gray-100 dark:border-oslo-gray-800",
        "cursor-pointer",
        isHovered &&
          "scale-102 shadow-md border-oslo-gray-200 dark:border-oslo-gray-700",
      )}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        transform: isHovered ? "scale(1.02)" : "scale(1)",
      }}
    >
      {/* Icon */}
      <div className="text-4xl mb-2">{icon}</div>

      {/* Counter */}
      <div
        ref={counterRef}
        className="text-3xl font-bold text-oslo-gray-950 dark:text-white"
      >
        0
      </div>

      {/* Unit / Label */}
      <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400 mt-1">
        {unit && <span className="text-xs text-oslo-gray-500">{unit}</span>}
        <span className="block">{label}</span>
      </p>
    </div>
  );
}

export function PropertyStatsCard({
  bedrooms,
  bathrooms,
  area,
}: PropertyStatsCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate container entrance on scroll
  useEffect(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === containerRef.current) trigger.kill();
      });
    };
  }, []);

  // Only show card if at least one stat exists
  if (!bedrooms && !bathrooms && !area) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-oslo-gray-900 rounded-2xl p-8 shadow-sm border border-oslo-gray-100 dark:border-oslo-gray-800 hover:shadow-md transition-shadow duration-300"
    >
      {/* Header */}
      <h2 className="text-2xl font-bold text-oslo-gray-950 dark:text-white mb-6">
        Especificaciones
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 sm:gap-3">
        {bedrooms !== null && bedrooms !== undefined && (
          <StatItem
            icon="🛏️"
            label="Habitaciones"
            value={bedrooms}
            isHovered={hoveredIndex === 0}
            onHover={(isHovered) => setHoveredIndex(isHovered ? 0 : null)}
          />
        )}

        {bathrooms !== null && bathrooms !== undefined && (
          <StatItem
            icon="🛁"
            label="Baños"
            value={bathrooms}
            unit={bathrooms % 1 !== 0 ? "" : ""}
            isHovered={hoveredIndex === 1}
            onHover={(isHovered) => setHoveredIndex(isHovered ? 1 : null)}
          />
        )}

        {area !== null && area !== undefined && (
          <StatItem
            icon="📏"
            label="Área"
            value={area}
            unit="m²"
            isHovered={hoveredIndex === 2}
            onHover={(isHovered) => setHoveredIndex(isHovered ? 2 : null)}
          />
        )}
      </div>
    </div>
  );
}
