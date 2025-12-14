"use client";

import { cn } from "@repo/ui";
import { Star, X } from "lucide-react";
import { type PlaceCategory } from "./place-marker";

interface PlaceCardProps {
  name: string;
  rating?: number;
  type: PlaceCategory;
  onClose: () => void;
}

export function PlaceCard({ name, rating, type, onClose }: PlaceCardProps) {
  return (
    <div className="relative min-w-[200px] p-3 bg-white/95 dark:bg-black/90 backdrop-blur-md rounded-lg shadow-lg border border-border/50">
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <X className="w-3 h-3 text-muted-foreground" />
      </button>

      <div className="flex flex-col gap-1 pr-4"> {/* Added padding-right to avoid overlap with close button */}
        <h3 className="font-medium text-sm text-foreground">{name}</h3>
        
        {rating && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-3 h-3",
                    star <= Math.round(rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <span className="capitalize">{type === 'school' ? 'Escuela' : type === 'hospital' ? 'Hospital' : type === 'park' ? 'Parque' : type === 'shopping_mall' ? 'Centro Comercial' : type}</span>
        </div>
      </div>
    </div>
  );
}
