"use client";

/**
 * NEW PROPERTY BUTTON Component
 * 
 * Botón inteligente que verifica límites antes de navegar.
 * Si el usuario ha alcanzado su límite, muestra un modal.
 */

import { Button } from "@repo/ui";
import {
    AlertCircle,
    CheckCircle,
    Plus,
    Sparkles,
    X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface NewPropertyButtonProps {
  canCreate: boolean;
  currentTier: string;
  propertyLimit: number;
  variant?: "default" | "empty-state";
}

export function NewPropertyButton({
  canCreate,
  currentTier,
  propertyLimit,
  variant = "default",
}: NewPropertyButtonProps) {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const router = useRouter();

  // Calculate next tier info
  const nextTier = currentTier === "FREE" ? "PLUS" : currentTier === "PLUS" ? "AGENT" : "PRO";
  const nextTierLimit = nextTier === "PLUS" ? 3 : nextTier === "AGENT" ? 10 : 20;
  const nextTierPrice = nextTier === "PLUS" ? "$9.99" : nextTier === "AGENT" ? "$29.99" : "$59.99";

  const handleClick = () => {
    if (canCreate) {
      router.push("/dashboard/propiedades/nueva");
    } else {
      setShowLimitModal(true);
    }
  };

  return (
    <>
      <Button onClick={handleClick} variant={variant === "empty-state" ? "default" : "default"}>
        <Plus className="h-4 w-4 mr-2" />
        {variant === "empty-state" ? "Crear tu primera propiedad" : "Nueva Propiedad"}
      </Button>

      {/* Limit Reached Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLimitModal(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl border overflow-hidden animate-in zoom-in-95 fade-in duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowLimitModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative p-6 lg:p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="mx-auto w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/30">
                  <AlertCircle className="w-7 h-7 text-amber-500" />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold tracking-tight mb-2">
                  Has alcanzado tu límite
                </h2>
                <p className="text-muted-foreground">
                  Tu plan <span className="font-semibold text-foreground">{currentTier}</span> permite{" "}
                  <span className="font-semibold text-foreground">
                    {propertyLimit} {propertyLimit === 1 ? "propiedad" : "propiedades"}
                  </span>
                </p>
              </div>

              {/* Upgrade Comparison */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Current Plan */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Actual</span>
                  </div>
                  <div className="text-lg font-bold">{currentTier}</div>
                  <div className="text-xs text-muted-foreground">
                    {propertyLimit} {propertyLimit === 1 ? "propiedad" : "propiedades"}
                  </div>
                </div>

                {/* Next Plan */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      Recomendado
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold">{nextTier}</span>
                    <span className="text-xs text-muted-foreground">{nextTierPrice}/mes</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{nextTierLimit} propiedades</div>
                </div>
              </div>

              {/* Benefits */}
              <div className="flex flex-wrap justify-center gap-3 mb-6 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sin compromiso</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Cancela cuando quieras</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
                >
                  <Link href="/pricing" className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Ver planes disponibles
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowLimitModal(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
