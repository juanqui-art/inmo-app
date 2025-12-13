"use client";

import { cn } from "@repo/ui";
import gsap from "gsap";
import { Mail } from "lucide-react";
import { useEffect, useRef } from "react";

import { AppointmentButton } from "@/components/appointments/appointment-button";
import { AgentAvatar } from "@/components/shared/agent-avatar";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";

interface PropertyFloatingActionCardProps {
  price: string;
  agentName?: string | null;
  agentEmail?: string | null;
  agentPhone?: string | null;
  propertyId: string;
  isAuthenticated: boolean;
  isSticky?: boolean;
}

export function PropertyFloatingActionCard({
  price,
  agentName,
  agentEmail,
  agentPhone,
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

      {/* Agent & Actions Wrapper */}
      <div className="space-y-4">
        
        {/* Agent Block (Modal Style) */}
        {agentName && (
          <div className="p-4 rounded-xl border border-oslo-gray-200/60 dark:border-oslo-gray-700/60 bg-gradient-to-br from-white to-oslo-gray-50/50 dark:from-oslo-gray-900 dark:to-oslo-gray-800/50 space-y-4">
             <h3 className="font-semibold text-xs uppercase tracking-wider text-oslo-gray-500 dark:text-oslo-gray-400">
                Agente Inmobiliario
             </h3>

             {/* Agent Info */}
             <div className="flex items-center gap-3">
               <div className="flex-shrink-0">
                 <AgentAvatar name={agentName} size="md" />
               </div>
               <div className="flex-1 min-w-0">
                 <p className="font-medium text-oslo-gray-900 dark:text-oslo-gray-100 truncate">
                   {agentName}
                 </p>
                 {agentEmail && (
                    <p className="text-sm text-oslo-gray-500 dark:text-oslo-gray-400 truncate">
                      {agentEmail}
                    </p>
                 )}
               </div>
             </div>

             {/* Appointment Button (Inside Agent Block) */}
             <AppointmentButton
               propertyId={propertyId}
               isAuthenticated={isAuthenticated}
             />
          </div>
        )}

        {/* Secondary Actions */}
        <div className="space-y-3 pt-2">
            {/* WhatsApp Button */}
            <WhatsAppButton phone={agentPhone} />

            {/* Email Button */}
            <a
              href={agentEmail ? `mailto:${agentEmail}` : "#"}
              className={cn(
                "w-full inline-flex items-center justify-center bg-white dark:bg-oslo-gray-800 border border-oslo-gray-200 dark:border-oslo-gray-700 hover:bg-oslo-gray-50 dark:hover:bg-oslo-gray-700 text-oslo-gray-900 dark:text-white h-12 text-base font-medium rounded-lg transition-all duration-200 active:scale-[0.98]",
                !agentEmail && "opacity-50 cursor-not-allowed pointer-events-none",
              )}
            >
              <Mail className="w-4 h-4 mr-2 text-oslo-gray-500" />
              Contactar por Correo
            </a>
        </div>
      </div>
    </div>
  );
}
