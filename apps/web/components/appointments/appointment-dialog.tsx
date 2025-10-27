"use client";

/**
 * APPOINTMENT DIALOG COMPONENT
 *
 * Modal/Dialog para mostrar el formulario de cita
 * - Se abre al hacer click en "Agendar Visita"
 * - Muestra el formulario de cita
 * - Se cierra al completar o cancelar
 */

import { useState } from "react";
import { AppointmentForm } from "./appointment-form";
import { Button } from "@repo/ui";
import { X } from "lucide-react";

interface AppointmentDialogProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentDialog({
  propertyId,
  isOpen,
  onClose,
}: AppointmentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFormSuccess = () => {
    setIsLoading(false);
    // Esperar un poco para que el usuario vea el mensaje de éxito
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        role="presentation"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-oslo-gray-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-oslo-gray-200 dark:border-oslo-gray-800 bg-white dark:bg-oslo-gray-900">
            <h2 className="text-xl font-semibold text-oslo-gray-950 dark:text-white">
              Agendar una visita
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-oslo-gray-100 dark:hover:bg-oslo-gray-800 rounded-md transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5 text-oslo-gray-500 dark:text-oslo-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <AppointmentForm
              propertyId={propertyId}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      </div>
    </>
  );
}
