"use client";

/**
 * APPOINTMENT DIALOG COMPONENT
 *
 * Modal/Dialog para mostrar el formulario de cita
 * - Se abre al hacer click en "Agendar Visita"
 * - Usa Dialog de Radix UI para accesibilidad completa
 * - Focus trap, ESC handler, ARIA attributes
 * - Warning de cambios sin guardar
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
} from "@repo/ui";
import { useState } from "react";
import { AppointmentForm } from "./appointment-form";

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleFormSuccess = () => {
    setFormSuccess(true);
    setHasUnsavedChanges(false);
    // Auto-cerrar después de 1.5s (pero permitir cerrar antes con botón)
    setTimeout(() => {
      onClose();
      setFormSuccess(false);
    }, 1500);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Intentando cerrar
      if (hasUnsavedChanges && !formSuccess) {
        setShowConfirmClose(true);
      } else {
        onClose();
        setFormSuccess(false);
      }
    }
  };

  const confirmClose = () => {
    setShowConfirmClose(false);
    setHasUnsavedChanges(false);
    setFormSuccess(false);
    onClose();
  };

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={isOpen && !showConfirmClose} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agendar una visita</DialogTitle>
            <DialogDescription>
              Selecciona una fecha y hora disponible para visitar la propiedad.
              El agente confirmará tu cita en breve.
            </DialogDescription>
          </DialogHeader>

          <AppointmentForm
            propertyId={propertyId}
            onSuccess={handleFormSuccess}
            onFormChange={() => setHasUnsavedChanges(true)}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog para cambios sin guardar */}
      <Dialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Descartar cambios?</DialogTitle>
            <DialogDescription>
              Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar sin agendar la cita?
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmClose(false)}
            >
              Continuar editando
            </Button>
            <Button
              variant="destructive"
              onClick={confirmClose}
            >
              Descartar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
