"use client";

/**
 * SUCCESS MODAL
 *
 * Aparece después de un login exitoso
 * Celebra la acción con animación y mensaje
 *
 * Patrón: Realtor.com style - celebración después de auth
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@repo/ui";
import { useEffect } from "react";

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoCloseDuration?: number; // ms - auto close after this duration
}

export function SuccessModal({
  open,
  onOpenChange,
  autoCloseDuration = 2500,
}: SuccessModalProps) {
  // Auto-close effect
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      onOpenChange(false);
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [open, onOpenChange, autoCloseDuration]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md border-none bg-gradient-to-b from-oslo-gray-800 to-oslo-gray-900">
        {/* Close button will be auto-hidden by auto-close */}
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          {/* Celebration SVG - Two people with raised hands */}
          <svg
            className="h-20 w-20 animate-bounce"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Left person */}
            <circle cx="30" cy="20" r="6" fill="#3B82F6" />
            <path d="M30 26 L30 40" stroke="#3B82F6" strokeWidth="2" />
            <path d="M30 32 L20 28" stroke="#3B82F6" strokeWidth="2" />
            <path d="M30 32 L40 28" stroke="#3B82F6" strokeWidth="2" />
            <path d="M30 40 L20 55" stroke="#3B82F6" strokeWidth="2" />
            <path d="M30 40 L40 55" stroke="#3B82F6" strokeWidth="2" />

            {/* Right person */}
            <circle cx="70" cy="20" r="6" fill="#10B981" />
            <path d="M70 26 L70 40" stroke="#10B981" strokeWidth="2" />
            <path d="M70 32 L60 28" stroke="#10B981" strokeWidth="2" />
            <path d="M70 32 L80 28" stroke="#10B981" strokeWidth="2" />
            <path d="M70 40 L60 55" stroke="#10B981" strokeWidth="2" />
            <path d="M70 40 L80 55" stroke="#10B981" strokeWidth="2" />

            {/* Confetti dots */}
            <circle cx="25" cy="15" r="2" fill="#FBBF24" opacity="0.7" />
            <circle cx="75" cy="15" r="2" fill="#EC4899" opacity="0.7" />
            <circle cx="15" cy="50" r="2" fill="#8B5CF6" opacity="0.7" />
            <circle cx="85" cy="50" r="2" fill="#06B6D4" opacity="0.7" />
          </svg>

          {/* Title */}
          <DialogTitle className="text-2xl font-bold text-center">
            ¡Bienvenido!
          </DialogTitle>

          {/* Description */}
          <DialogDescription className="text-center text-base">
            Tu sesión fue iniciada exitosamente. Ya puedes guardar tus
            propiedades favoritas.
          </DialogDescription>

          {/* Progress indicator - auto close animation */}
          <div className="w-full h-1 bg-oslo-gray-700 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
              style={{
                animation: `shrink ${autoCloseDuration}ms linear`,
              }}
            />
          </div>

          {/* Subtle text */}
          <p className="text-xs text-oslo-gray-400 mt-2">
            Cerrando automáticamente...
          </p>
        </div>

        {/* CSS Animation for progress bar */}
        <style>{`
          @keyframes shrink {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
