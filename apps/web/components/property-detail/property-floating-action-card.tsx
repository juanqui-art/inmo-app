"use client";

import { cn } from "@repo/ui";
import gsap from "gsap";
import { Mail, Phone } from "lucide-react";
import { useEffect, useRef } from "react";
import { AppointmentButton } from "@/components/appointments/appointment-button";

interface PropertyFloatingActionCardProps {
  price: string;
  agentName?: string | null;
  agentEmail?: string | null;
  agentPhone?: string | null;
  agentAvatar?: string | null;
  propertyId: string;
  isAuthenticated: boolean;
  isSticky?: boolean;
}

export function PropertyFloatingActionCard({
  price,
  agentName,
  agentEmail,
  agentPhone,
  agentAvatar,
  propertyId,
  isAuthenticated,
  isSticky = true,
}: PropertyFloatingActionCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full bg-white dark:bg-oslo-gray-900 rounded-2xl p-6 shadow-lg border-2 border-indigo-100 dark:border-indigo-900",
        isSticky && "lg:sticky lg:top-24 lg:z-10",
      )}
    >
      {/* Price Section */}
      <div className="mb-6 pb-6 border-b border-oslo-gray-200 dark:border-oslo-gray-800">
        <p className="text-sm text-oslo-gray-600 dark:text-oslo-gray-400 mb-1">
          Precio
        </p>
        <p className="text-3xl font-bold text-oslo-gray-950 dark:text-white">
          {price}
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3 mb-6">
        <a
          href={agentEmail ? `mailto:${agentEmail}` : "#"}
          className={cn(
            "w-full inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold rounded-lg transition-all duration-300 active:scale-[0.98]",
            !agentEmail && "opacity-50 cursor-not-allowed pointer-events-none",
          )}
        >
          Contactar Agente
        </a>

        <AppointmentButton
          propertyId={propertyId}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* Agent Card */}
      {agentName && (
        <div className="pt-6 border-t border-oslo-gray-200 dark:border-oslo-gray-800">
          <p className="text-xs text-oslo-gray-600 dark:text-oslo-gray-400 uppercase font-semibold mb-4">
            Agente de Venta
          </p>

          <div className="flex items-start gap-4">
            {/* Agent Avatar */}
            <div className="flex-shrink-0">
              {agentAvatar ? (
                <img
                  src={agentAvatar}
                  alt={agentName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-900"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {agentName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Agent Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-oslo-gray-950 dark:text-white truncate">
                {agentName}
              </h3>

              {agentEmail && (
                <a
                  href={`mailto:${agentEmail}`}
                  className="flex items-center gap-1 text-xs text-oslo-gray-600 dark:text-oslo-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mt-1 truncate transition-colors"
                  title={agentEmail}
                >
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{agentEmail}</span>
                </a>
              )}

              {agentPhone && (
                <a
                  href={`tel:${agentPhone}`}
                  className="flex items-center gap-1 text-xs text-oslo-gray-600 dark:text-oslo-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mt-1 transition-colors"
                >
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span>{agentPhone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Contact Buttons */}
          <div className="mt-4 flex gap-2">
            {agentPhone && (
              <a
                href={`tel:${agentPhone}`}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-oslo-gray-100 dark:bg-oslo-gray-800 text-oslo-gray-700 dark:text-oslo-gray-300 hover:bg-oslo-gray-200 dark:hover:bg-oslo-gray-700 transition-colors"
              >
                <Phone className="w-3 h-3" />
                Llamar
              </a>
            )}
            {agentEmail && (
              <a
                href={`mailto:${agentEmail}`}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-oslo-gray-100 dark:bg-oslo-gray-800 text-oslo-gray-700 dark:text-oslo-gray-300 hover:bg-oslo-gray-200 dark:hover:bg-oslo-gray-700 transition-colors"
              >
                <Mail className="w-3 h-3" />
                Email
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
