"use client";

/**
 * SIGNUP MODAL - Intercepted Route
 *
 * Este archivo se muestra cuando el usuario navega a /signup
 * via client-side navigation (soft navigation).
 *
 * Si el usuario accede directamente a /signup o refresca,
 * se mostrará la página completa en (auth)/signup/page.tsx
 *
 * IMPORTANTE: El Dialog Portal está explícitamente vinculado al body
 * para asegurar que se renderiza en el nivel más alto del DOM,
 * evitando que sea ocultado por stacking contexts de componentes padres.
 *
 * QUERY PARAMS:
 * - plan: "free" | "basic" | "pro" - Plan seleccionado desde /vender
 * - redirect: URL a redirigir después del registro
 */

import { GoogleButton } from "@/components/auth/google-button";
import { SignupForm } from "@/components/auth/signup-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@repo/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

/** Plan configuration with display names and colors */
const PLAN_CONFIG: Record<string, { name: string; color: string; bgColor: string }> = {
  free: {
    name: "Gratuito",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  basic: {
    name: "Básico",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
  },
  pro: {
    name: "Pro",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
};

function SignupModalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Leer query params para el flujo de tiers
  const plan = searchParams.get("plan");
  const redirect = searchParams.get("redirect");
  const planConfig = plan ? PLAN_CONFIG[plan.toLowerCase()] : null;

  // Cerrar modal = volver a la página anterior
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.back();
    }
  };

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-md p-0 overflow-hidden sm:rounded-lg z-[10000]">
        {/* Plan Badge - Solo si hay plan seleccionado */}
        {planConfig && (
          <div className={`px-4 py-2 ${planConfig.bgColor} border-b border-border/50`}>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Plan seleccionado:
              </span>
              <span className={`text-sm font-bold ${planConfig.color}`}>
                {planConfig.name}
              </span>
            </div>
          </div>
        )}

        {/* Header del modal */}
        <div className="px-6 pt-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-center mb-2">
            Crear cuenta
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            {planConfig ? (
              <>
                Completa tu registro para activar el plan{" "}
                <span className={`font-semibold ${planConfig.color}`}>
                  {planConfig.name}
                </span>
              </>
            ) : (
              "Únete a InmoApp y encuentra tu propiedad ideal"
            )}
          </DialogDescription>
        </div>

        {/* Contenido del modal */}
        <div className="px-6 py-6 space-y-6">
          {/* Google OAuth */}
          <Suspense fallback={<div className="h-10 animate-pulse bg-muted rounded" />}>
            <GoogleButton />
          </Suspense>

          {/* Separador */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                o continúa con email
              </span>
            </div>
          </div>

          {/* Formulario de signup con plan y redirect */}
          <SignupForm
            plan={plan ?? undefined}
            redirect={redirect ?? undefined}
          />

          {/* Link a login */}
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-foreground hover:underline font-semibold transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SignupModal() {
  return (
    <Suspense fallback={null}>
      <SignupModalContent />
    </Suspense>
  );
}
