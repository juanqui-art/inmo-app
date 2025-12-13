"use client";

import { cn } from "@repo/ui";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Bath, Bed, Calendar, Car, Maximize } from "lucide-react";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

interface PropertyStatsCardProps {
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  parking?: number | null;
  yearBuilt?: number | null;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number | string | null | undefined;
  unit?: string;
  isHovered: boolean;
  onHover: (isHovered: boolean) => void;
  delay?: number;
}

function StatItem({
  icon,
  label,
  value,
  unit = "",
  isHovered,
  onHover,
  delay = 0,
}: StatItemProps) {
  const counterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 10 },
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.4, 
            delay: delay * 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top 90%",
            }
        }
    );
  }, [delay]);

  useEffect(() => {
    if (!value || !counterRef.current || hasAnimated.current || typeof value !== 'number') return;

    const counter = counterRef.current;
    const displayValue = Math.round(value * 10) / 10;

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
  }, [value]);

  if (value === null || value === undefined) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-white dark:bg-oslo-gray-900 p-4 rounded-xl text-center transition-all duration-300",
        "border border-oslo-gray-100 dark:border-oslo-gray-800",
        "cursor-pointer group hover:shadow-lg hover:-translate-y-1 relative overflow-hidden",
        isHovered && "border-primary/50 dark:border-primary/50"
      )}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
       {/* Background gradient on hover */}
       <div className={cn(
           "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300",
           isHovered && "opacity-100"
       )} />

      <div className="relative z-10 flex flex-col items-center gap-3">
        {/* Icon Circle */}
        <div className={cn(
            "p-3 rounded-full bg-oslo-gray-50 dark:bg-oslo-gray-800 text-oslo-gray-500 dark:text-oslo-gray-400 transition-colors duration-300",
            isHovered && "bg-primary text-primary-foreground shadow-md scale-110"
        )}>
            {icon}
        </div>

        {/* Value & Label */}
        <div>
            <div className="flex items-baseline justify-center gap-0.5">
                <span
                    ref={typeof value === 'number' ? counterRef : undefined}
                    className="text-2xl font-bold text-oslo-gray-950 dark:text-white"
                >
                    {typeof value === 'number' ? 0 : value}
                </span>
                {unit && <span className="text-xs font-medium text-oslo-gray-500 dark:text-oslo-gray-400">{unit}</span>}
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-oslo-gray-500 dark:text-oslo-gray-400 mt-1">
                {label}
            </p>
        </div>
      </div>
    </div>
  );
}

export function PropertyStatsCard({
  bedrooms,
  bathrooms,
  area,
  parking,
  yearBuilt
}: PropertyStatsCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use simple entrance animation for main container
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
                start: "top 85%",
            }
        }
    );
  }, []);

  // Use hasAnyStat to check if we should render anything at all
  const hasAnyStat = [bedrooms, bathrooms, area, parking, yearBuilt].some(
      stat => stat !== null && stat !== undefined
  );

  if (!hasAnyStat) return null;

  return (
    <div ref={containerRef} className="space-y-6">
      <h2 className="text-2xl font-bold text-oslo-gray-950 dark:text-white">
        Características
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatItem
          icon={<Bed className="w-5 h-5" />}
          label="Habitaciones"
          value={bedrooms}
          isHovered={hoveredIndex === 0}
          onHover={(h) => setHoveredIndex(h ? 0 : null)}
          delay={0}
        />
        
        <StatItem
          icon={<Bath className="w-5 h-5" />}
          label="Baños"
          value={bathrooms}
          isHovered={hoveredIndex === 1}
          onHover={(h) => setHoveredIndex(h ? 1 : null)}
          delay={1}
        />
        
        <StatItem
          icon={<Maximize className="w-5 h-5" />}
          label="Área"
          value={area}
          unit="m²"
          isHovered={hoveredIndex === 2}
          onHover={(h) => setHoveredIndex(h ? 2 : null)}
          delay={2}
        />

        <StatItem
          icon={<Car className="w-5 h-5" />}
          label="Estacionamiento"
          value={parking}
          isHovered={hoveredIndex === 3}
          onHover={(h) => setHoveredIndex(h ? 3 : null)}
          delay={3}
        />

        <StatItem
          icon={<Calendar className="w-5 h-5" />}
          label="Año Const."
          value={yearBuilt}
          isHovered={hoveredIndex === 4}
          onHover={(h) => setHoveredIndex(h ? 4 : null)}
          delay={4}
        />
      </div>
    </div>
  );
}
