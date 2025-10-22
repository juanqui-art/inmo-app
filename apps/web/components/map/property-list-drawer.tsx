/**
 * PropertyListDrawer - Sliding Bottom Panel with Property Cards
 *
 * Airbnb-style drawer that displays property cards in horizontal scroll
 * Three states: collapsed, peek, expanded
 *
 * FEATURES:
 * - Draggable handle to expand/collapse
 * - Horizontal scroll carousel
 * - Property count badge
 * - Smooth animations
 * - Click outside to collapse
 *
 * STATES:
 * - Collapsed: 80px height (just handle + counter)
 * - Peek: 200px height (shows cards)
 * - Expanded: 60vh height (full list view)
 *
 * USAGE:
 * <PropertyListDrawer
 *   properties={properties}
 *   onPropertyHover={(id) => highlightMarker(id)}
 * />
 */

"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { PropertyCardCompact } from "./property-card-compact";
import type { MapProperty } from "./map-view";

interface PropertyListDrawerProps {
  properties: MapProperty[];
  onPropertyHover?: (propertyId: string | null) => void;
  onPropertyClick?: (propertyId: string) => void;
}

type DrawerState = "collapsed" | "peek" | "expanded";

export function PropertyListDrawer({
  properties,
  onPropertyHover,
  onPropertyClick,
}: PropertyListDrawerProps) {
  const [state, setState] = useState<DrawerState>("peek");

  // Filter properties with valid coordinates
  const validProperties = properties.filter(
    (p) => p.latitude !== null && p.longitude !== null,
  );

  // Toggle between states
  const toggleState = () => {
    if (state === "collapsed") setState("peek");
    else if (state === "peek") setState("expanded");
    else setState("peek");
  };

  // Height classes for each state
  const heightClass = {
    collapsed: "h-[80px]",
    peek: "h-[200px]",
    expanded: "h-[60vh]",
  }[state];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-oslo-gray-50 dark:bg-oslo-gray-1000 border-t border-oslo-gray-200 dark:border-oslo-gray-800 shadow-2xl dark:shadow-black/40 transition-all duration-300 ease-out ${heightClass}`}
    >
      {/* Handle Bar */}
      <div
        onClick={toggleState}
        className="flex flex-col items-center justify-center py-2 cursor-pointer hover:bg-oslo-gray-100 dark:hover:bg-oslo-gray-900/80 transition-colors"
      >
        {/* Drag Handle */}
        <div className="w-12 h-1 bg-oslo-gray-400 dark:bg-oslo-gray-600 rounded-full mb-2" />

        {/* Counter + Toggle Icon */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-oslo-gray-900 dark:text-oslo-gray-100">
            {validProperties.length} propiedades en esta área
          </span>
          {state === "collapsed" ? (
            <ChevronUp className="w-4 h-4 text-oslo-gray-600 dark:text-oslo-gray-300" />
          ) : (
            <ChevronDown className="w-4 h-4 text-oslo-gray-600 dark:text-oslo-gray-300" />
          )}
        </div>
      </div>

      {/* Property Cards Carousel */}
      {state !== "collapsed" && (
        <div className="overflow-x-auto overflow-y-hidden h-[calc(100%-60px)] px-4 pb-4">
          <div className="flex gap-3 h-full">
            {validProperties.map((property) => (
              <PropertyCardCompact
                key={property.id}
                property={property}
                onHover={() => onPropertyHover?.(property.id)}
                onLeave={() => onPropertyHover?.(null)}
                onClick={() => onPropertyClick?.(property.id)}
              />
            ))}

            {/* Empty State */}
            {validProperties.length === 0 && (
              <div className="flex items-center justify-center w-full h-full text-oslo-gray-600 dark:text-oslo-gray-300">
                <p>No hay propiedades en esta zona</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
