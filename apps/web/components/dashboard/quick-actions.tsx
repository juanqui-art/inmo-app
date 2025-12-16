"use client";

/**
 * QUICK ACTIONS Component
 * 
 * Sección de accesos rápidos en el Dashboard con verificación de límites.
 * Si el usuario ha alcanzado su límite de propiedades, muestra un modal
 * en lugar de navegar a /propiedades/nueva.
 */

import { Button } from "@repo/ui";
import {
    AlertCircle,
    Building2,
    CheckCircle,
    Sparkles,
    X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface QuickActionsProps {
  canCreateProperty: boolean;
  currentTier: string;
  propertyLimit: number;
  currentCount?: number;
}

export function QuickActions({
  canCreateProperty,
  currentTier,
  propertyLimit,
  currentCount = 0,
}: QuickActionsProps) {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const router = useRouter();

  // Calculate next tier info
  const nextTier = currentTier === "FREE" ? "PLUS" : currentTier === "PLUS" ? "AGENT" : "PRO";
  const nextTierLimit = nextTier === "PLUS" ? 3 : nextTier === "AGENT" ? 10 : 20;
  const nextTierPrice = nextTier === "PLUS" ? "$9.99" : nextTier === "AGENT" ? "$29.99" : "$59.99";

  const handleNewPropertyClick = () => {
    if (canCreateProperty) {
      router.push("/dashboard/propiedades/nueva");
    } else {
      setShowLimitModal(true);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleNewPropertyClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Building2 className="h-4 w-4" />
            Nueva Propiedad
            {!canCreateProperty && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded">
                {currentCount}/{propertyLimit}
              </span>
            )}
          </button>
          <Link
            href="/dashboard/propiedades"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors text-sm font-medium"
          >
            Ver Mis Propiedades
          </Link>
        </div>
      </div>

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
