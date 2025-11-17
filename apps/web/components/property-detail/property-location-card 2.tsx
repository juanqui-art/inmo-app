"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface PropertyLocationCardProps {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

export function PropertyLocationCard({
  address,
  city,
  state,
  zipCode,
}: PropertyLocationCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate card entrance on scroll
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
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === containerRef.current) trigger.kill();
      });
    };
  }, []);

  // Only show if at least one location detail exists
  if (!address && !city && !state && !zipCode) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-oslo-gray-900 rounded-2xl p-8 shadow-sm border border-oslo-gray-100 dark:border-oslo-gray-800 hover:shadow-md transition-shadow duration-300"
    >
      {/* Header */}
      <h2 className="text-2xl font-bold text-oslo-gray-950 dark:text-white mb-6">
        Ubicación
      </h2>

      {/* Location Details */}
      <div className="space-y-4 text-oslo-gray-700 dark:text-oslo-gray-300">
        {address && (
          <div className="flex items-start gap-3">
            <span className="text-xl">📍</span>
            <div>
              <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
                Dirección
              </p>
              <p className="font-medium">{address}</p>
            </div>
          </div>
        )}

        {(city || state) && (
          <div className="flex items-start gap-3">
            <span className="text-xl">🏙️</span>
            <div>
              <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
                Ciudad
              </p>
              <p className="font-medium">
                {city}
                {state && `, ${state}`}
              </p>
            </div>
          </div>
        )}

        {zipCode && (
          <div className="flex items-start gap-3">
            <span className="text-xl">📮</span>
            <div>
              <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400">
                Código Postal
              </p>
              <p className="font-medium">{zipCode}</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Placeholder */}
      <div className="mt-8 bg-oslo-gray-100 dark:bg-oslo-gray-800 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-oslo-gray-300 dark:border-oslo-gray-700">
        <div className="text-center">
          <p className="text-oslo-gray-500 dark:text-oslo-gray-400 text-sm">
            🗺️ Mapa interactivo - Próximamente
          </p>
        </div>
      </div>
    </div>
  );
}
