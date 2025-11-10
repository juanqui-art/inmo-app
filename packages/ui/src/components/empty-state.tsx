"use client";

/**
 * EMPTY STATE COMPONENT
 *
 * Unified empty state/error state component with support for:
 * - Custom icons
 * - Primary and secondary messages
 * - Action buttons
 * - Suggestions/help text
 */

import type { ReactNode } from "react";

export interface EmptyStateProps {
  /** Icon component or element to display */
  icon?: ReactNode;
  /** Primary message (e.g., "No results found") */
  title: string;
  /** Secondary message with more context */
  subtitle?: string;
  /** Array of action buttons */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  }>;
  /** Array of suggestions or help text */
  suggestions?: string[];
  /** CSS classes for the container */
  className?: string;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actions,
  suggestions,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center space-y-4 py-12 px-4 ${className || ""}`}
    >
      {/* Icon */}
      {icon && <div className="flex justify-center">{icon}</div>}

      {/* Title and Subtitle */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground max-w-md">{subtitle}</p>
        )}
      </div>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="space-y-1 text-xs text-muted-foreground max-w-md">
          <p className="font-medium">Suggestions:</p>
          <ul className="list-disc list-inside space-y-1">
            {suggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex flex-col gap-2 pt-4">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                action.variant === "outline"
                  ? "border border-input bg-background hover:bg-accent"
                  : action.variant === "secondary"
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
