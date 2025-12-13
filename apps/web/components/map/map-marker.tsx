"use client";

import { Home } from "lucide-react";

export function MapMarker() {
  return (
    <div className="relative flex flex-col items-center justify-center transform -translate-y-1/2 cursor-pointer group">
      {/* Pulse Animation Ring */}
      <div className="absolute w-12 h-12 bg-primary/30 rounded-full animate-ping opacity-75" />
      
      {/* Static Outer Ring */}
      <div className="relative w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/30 shadow-lg transition-transform group-hover:scale-110 duration-300">
        {/* Core Marker */}
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-inner relative z-10 border-2 border-white dark:border-oslo-gray-900">
           <Home className="w-4 h-4 text-white fill-white" strokeWidth={2.5} />
        </div>
      </div>

       {/* Optional: Add a small pointer triangle at the bottom if needed, but current floating circle style is very modern */}
    </div>
  );
}
