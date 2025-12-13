"use client";

import { cn } from "@repo/ui";
import { Check } from "lucide-react";

interface AgentAvatarProps {
  name?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isVerified?: boolean;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-xl",
};

const badgeSizeClasses = {
  sm: "w-3 h-3 p-0.5",
  md: "w-4 h-4 p-0.5",
  lg: "w-5 h-5 p-1",
  xl: "w-6 h-6 p-1",
};

export function AgentAvatar({
  name,
  image,
  size = "md",
  className,
  isVerified = true,
}: AgentAvatarProps) {
  // Get initials (up to 2 chars)
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "A";

  return (
    <div className={cn("relative inline-block")}>
      {/* Avatar Circle */}
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold text-white shadow-md relative overflow-hidden",
          "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600",
          "border-2 border-white dark:border-oslo-gray-800",
          !image && "ring-2 ring-indigo-100/50 dark:ring-indigo-900/30", // Glow only for initials
          sizeClasses[size],
          className
        )}
      >
        {/* Subtle internal shine effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/20 pointer-events-none" />
        
        {/* Content */}
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name || "Agent"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="relative z-10 drop-shadow-sm tracking-wider">
            {initials}
          </span>
        )}
      </div>

      {/* Verified Badge (Simulating Google/Verified status) */}
      {isVerified && (
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 rounded-full bg-blue-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-oslo-gray-900 shadow-sm",
          badgeSizeClasses[size]
        )}>
          <Check className="w-full h-full" strokeWidth={3} />
        </div>
      )}
    </div>
  );
}
