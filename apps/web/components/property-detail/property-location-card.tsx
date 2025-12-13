
"use client";

import { ModalMap } from "@/components/map/modal-map";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Building, MapPin } from "lucide-react";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

interface PropertyLocationCardProps {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  title?: string;
}

export function PropertyLocationCard({
  address,
  city,
  state,
  zipCode,
  latitude,
  longitude,
  title
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
      },
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === containerRef.current) trigger.kill();
      });
    };
  }, []);

  // Only show if at least one location detail exists
  if (!address && !city && !state && !zipCode && !latitude) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="space-y-6"
    >
      {/* Header */}
      <h2 className="text-2xl font-bold text-oslo-gray-950 dark:text-white">
        Ubicación
      </h2>

      {/* Map Section */}
      {latitude && longitude && (
         <div className="w-full h-80 rounded-2xl overflow-hidden border border-oslo-gray-200 dark:border-oslo-gray-800 relative group shadow-sm hover:shadow-md transition-all duration-300">
            <ModalMap 
               latitude={latitude} 
               longitude={longitude} 
               title={title || "Propiedad"} 
            />
         </div>
      )}

      {/* Text Details */}
      <div className="bg-white dark:bg-oslo-gray-900 rounded-2xl p-6 shadow-sm border border-oslo-gray-100 dark:border-oslo-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
        {address && (
          <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-oslo-gray-50 dark:hover:bg-oslo-gray-800 transition-colors">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
               <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-oslo-gray-500 dark:text-oslo-gray-400">
                Dirección
              </p>
              <p className="font-semibold text-oslo-gray-900 dark:text-oslo-gray-100 mt-1">{address}</p>
            </div>
          </div>
        )}

        {(city || state) && (
          <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-oslo-gray-50 dark:hover:bg-oslo-gray-800 transition-colors">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
               <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-oslo-gray-500 dark:text-oslo-gray-400">
                Ciudad / Estado
              </p>
              <p className="font-semibold text-oslo-gray-900 dark:text-oslo-gray-100 mt-1">
                {city}
                {state && `, ${state}`}
              </p>
            </div>
          </div>
        )}

        {zipCode && (
           <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-oslo-gray-50 dark:hover:bg-oslo-gray-800 transition-colors">
             <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
                <span className="text-lg font-bold">#</span>
             </div>
             <div>
               <p className="text-sm font-medium text-oslo-gray-500 dark:text-oslo-gray-400">
                 Código Postal
               </p>
               <p className="font-semibold text-oslo-gray-900 dark:text-oslo-gray-100 mt-1">{zipCode}</p>
             </div>
           </div>
        )}
      </div>
    </div>
  );
}
