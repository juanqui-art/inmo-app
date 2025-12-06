"use client";

import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import Link from "next/link";

interface PlanUsageProps {
  tier: "FREE" | "BASIC" | "PRO";
  propertyCount: number;
  propertyLimit: number;
  imageLimit: number;
  className?: string;
}

export function PlanUsage({
  tier,
  propertyCount,
  propertyLimit,
  imageLimit,
  className,
}: PlanUsageProps) {
  const percentage = Math.min((propertyCount / propertyLimit) * 100, 100);
  const isNearLimit = percentage >= 80;

  return (
    <div className={cn("p-4 rounded-lg bg-muted/50 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold">Plan {tier}</span>
        </div>
        {tier !== "PRO" && (
          <Link
            href={`/dashboard?upgrade=${tier === "FREE" ? "basic" : "pro"}`}
            className="text-xs font-medium text-primary hover:underline"
          >
            Mejorar
          </Link>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Propiedades</span>
          <span className={cn(isNearLimit && "text-red-500 font-medium")}>
            {propertyCount} / {propertyLimit}
          </span>
        </div>
        {/* Custom Progress Bar */}
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-in-out rounded-full",
              isNearLimit ? "bg-red-500" : "bg-primary",
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>• {imageLimit} imágenes por propiedad</p>
      </div>
    </div>
  );
}
