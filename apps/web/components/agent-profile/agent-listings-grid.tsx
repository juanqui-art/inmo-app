"use client";

import { PropertyCard } from "@/components/properties/property-card";
import { type SerializedProperty } from "@repo/database";
import { SearchX } from "lucide-react";

interface AgentListingsGridProps {
  properties: SerializedProperty[];
}

export function AgentListingsGrid({ properties }: AgentListingsGridProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-oslo-gray-50 dark:bg-oslo-gray-900/50 rounded-2xl border border-dashed border-oslo-gray-200 dark:border-oslo-gray-800">
        <div className="w-16 h-16 bg-oslo-gray-100 dark:bg-oslo-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <SearchX className="w-8 h-8 text-oslo-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-oslo-gray-900 dark:text-white mb-1">
          Sin propiedades publicadas
        </h3>
        <p className="text-oslo-gray-500 dark:text-oslo-gray-400 max-w-sm mx-auto">
          Este agente no tiene propiedades activas en este momento. Vuelve a consultar más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-oslo-gray-950 dark:text-white mb-6">
        Propiedades en Catálogo
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
