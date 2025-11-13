"use client";

import { Bath, BedDouble, Ruler } from "lucide-react";
import { AnimatedCounter } from "./animated-counter";

interface PropertySpecsDashboardProps {
  bedrooms?: number | null;
  bathrooms?: number | string | null;
  area?: number | string | null;
}

export function PropertySpecsDashboard({
  bedrooms,
  bathrooms,
  area,
}: PropertySpecsDashboardProps) {
  if (!bedrooms && !bathrooms && !area) {
    return null;
  }

  return (
    <div className="bg-oslo-gray-50 dark:bg-oslo-gray-900 p-6 rounded-lg">
      <div className="flex justify-around text-center">
        {bedrooms && (
          <div className="flex flex-col items-center gap-2 text-oslo-gray-950 dark:text-white">
            <BedDouble
              className="w-7 h-7 text-indigo-500"
              strokeWidth={2.5}
            />
            <p className="text-2xl font-bold">
              <AnimatedCounter to={bedrooms} />
            </p>
            <p className="text-sm font-medium text-oslo-gray-600 dark:text-oslo-gray-400">
              Habitaciones
            </p>
          </div>
        )}
        {bathrooms && (
          <div className="flex flex-col items-center gap-2 text-oslo-gray-950 dark:text-white">
            <Bath className="w-7 h-7 text-indigo-500" strokeWidth={2.5} />
            <p className="text-2xl font-bold">
              <AnimatedCounter to={Number(bathrooms)} />
            </p>
            <p className="text-sm font-medium text-oslo-gray-600 dark:text-oslo-gray-400">
              Baños
            </p>
          </div>
        )}
        {area && (
          <div className="flex flex-col items-center gap-2 text-oslo-gray-950 dark:text-white">
            <Ruler className="w-7 h-7 text-indigo-500" strokeWidth={2.5} />
            <p className="text-2xl font-bold">
              <AnimatedCounter to={Number(area)} />
            </p>
            <p className="text-sm font-medium text-oslo-gray-600 dark:text-oslo-gray-400">
              m²
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
