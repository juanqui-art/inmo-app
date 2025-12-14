/**
 * CLIENT ACTIONS
 * 
 * Dropdown menu for managing client status and notes.
 * Uses server actions for state updates.
 */

"use client";

import { updateClientNotesAction, updateClientStatusAction } from "@/app/actions/crm";
import type { LeadStatus } from "@/lib/types/crm";
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui";
import {
    CheckCircle2,
    Edit,
    MessageSquare,
    MoreHorizontal,
    Phone,
    Sparkles,
    Target,
    XCircle
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUSES: { value: LeadStatus; label: string; icon: typeof Sparkles }[] = [
  { value: "NEW", label: "Nuevo", icon: Sparkles },
  { value: "CONTACTED", label: "Contactado", icon: Phone },
  { value: "INTERESTED", label: "Interesado", icon: Target },
  { value: "NEGOTIATING", label: "Negociando", icon: MessageSquare },
  { value: "CLOSED_WON", label: "Cerrado ✓", icon: CheckCircle2 },
  { value: "CLOSED_LOST", label: "Perdido", icon: XCircle },
];

interface ClientActionsProps {
  clientId: string;
  currentStatus: LeadStatus;
  currentNotes: string;
}

export function ClientActions({ clientId, currentStatus, currentNotes }: ClientActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (newStatus === currentStatus) return;
    
    setIsUpdating(true);
    try {
      const result = await updateClientStatusAction(clientId, newStatus);
      if (result.success) {
        toast.success(`Estado actualizado a "${STATUSES.find(s => s.value === newStatus)?.label}"`);
      } else {
        toast.error(result.error || "Error al actualizar estado");
      }
    } catch {
      toast.error("Error al actualizar estado");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditNotes = () => {
    const newNotes = prompt("Notas del cliente:", currentNotes);
    if (newNotes !== null && newNotes !== currentNotes) {
      updateClientNotesAction(clientId, newNotes)
        .then((result) => {
          if (result.success) {
            toast.success("Notas actualizadas");
          } else {
            toast.error(result.error || "Error al actualizar notas");
          }
        })
        .catch(() => {
          toast.error("Error al actualizar notas");
        });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isUpdating}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STATUSES.map((status) => {
          const Icon = status.icon;
          const isActive = status.value === currentStatus;
          return (
            <DropdownMenuItem
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              className={isActive ? "bg-primary/10" : ""}
            >
              <Icon className="h-4 w-4 mr-2" />
              {status.label}
              {isActive && <span className="ml-auto text-xs">✓</span>}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleEditNotes}>
          <Edit className="h-4 w-4 mr-2" />
          Editar Notas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
