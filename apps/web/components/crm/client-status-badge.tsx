/**
 * CLIENT STATUS BADGE
 * 
 * Visual badge showing lead status with color coding.
 */

import type { LeadStatus } from "@/lib/types/crm";
import { cn } from "@/lib/utils";
import {
    CheckCircle2,
    MessageSquare,
    Phone,
    Sparkles,
    Target,
    XCircle
} from "lucide-react";

const STATUS_CONFIG: Record<LeadStatus, { 
  label: string; 
  icon: typeof Sparkles; 
  bgColor: string;
  textColor: string;
}> = {
  NEW: { 
    label: "Nuevo", 
    icon: Sparkles, 
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-500"
  },
  CONTACTED: { 
    label: "Contactado", 
    icon: Phone, 
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-600"
  },
  INTERESTED: { 
    label: "Interesado", 
    icon: Target, 
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-500"
  },
  NEGOTIATING: { 
    label: "Negociando", 
    icon: MessageSquare, 
    bgColor: "bg-orange-500/10",
    textColor: "text-orange-500"
  },
  CLOSED_WON: { 
    label: "Cerrado", 
    icon: CheckCircle2, 
    bgColor: "bg-green-500/10",
    textColor: "text-green-500"
  },
  CLOSED_LOST: { 
    label: "Perdido", 
    icon: XCircle, 
    bgColor: "bg-red-500/10",
    textColor: "text-red-500"
  },
};

interface ClientStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function ClientStatusBadge({ status, className }: ClientStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </div>
  );
}
