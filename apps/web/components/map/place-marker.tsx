"use client";

import { GraduationCap, Hospital, ShoppingBag, TreePine, Utensils } from "lucide-react";

export type PlaceCategory = 'school' | 'hospital' | 'park' | 'shopping_mall' | 'restaurant';

interface PlaceMarkerProps {
  type: string;
}

export function PlaceMarker({ type }: PlaceMarkerProps) {
  const getIcon = () => {
    switch (type) {
      case 'school':
        return <GraduationCap className="w-3.5 h-3.5 text-white" />;
      case 'hospital':
        return <Hospital className="w-3.5 h-3.5 text-white" />;
      case 'park':
        return <TreePine className="w-3.5 h-3.5 text-white" />;
      case 'shopping_mall':
        return <ShoppingBag className="w-3.5 h-3.5 text-white" />;
      case 'restaurant':
        return <Utensils className="w-3.5 h-3.5 text-white" />;
      default:
        return <div className="w-2 h-2 bg-white rounded-full" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'school': return "bg-blue-500 border-blue-600";
      case 'hospital': return "bg-red-500 border-red-600";
      case 'park': return "bg-green-500 border-green-600";
      case 'shopping_mall': return "bg-purple-500 border-purple-600";
      case 'restaurant': return "bg-orange-500 border-orange-600";
      default: return "bg-gray-500 border-gray-600";
    }
  };

  return (
    <div className={`
      relative w-8 h-8 rounded-full flex items-center justify-center 
      shadow-md border-2 ${getColor()}
      transform transition-transform hover:scale-110
    `}>
      {getIcon()}
      {/* Tiny arrow at bottom */}
      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${getColor()} border-r-0 border-t-0`} />
    </div>
  );
}
