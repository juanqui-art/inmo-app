"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

interface OnboardingChecklistProps {
  hasProperties: boolean;
  hasAppointments: boolean;
  userName: string | null;
}

export function OnboardingChecklist({
  hasProperties,
  hasAppointments,
  userName,
}: OnboardingChecklistProps) {
  // Calculate progress
  const steps = [
    {
      id: "profile",
      label: "Completa tu perfil profesional",
      completed: !!userName, // Simplified check
      href: "/perfil", // Point to client profile for now
      cta: "Ir al perfil",
    },
    {
      id: "property",
      label: "Publica tu primera propiedad",
      completed: hasProperties,
      href: "/dashboard/propiedades/nueva",
      cta: "Publicar ahora",
    },
    {
      id: "appointment",
      label: "Recibe tu primera cita",
      completed: hasAppointments,
      href: "/dashboard/citas", // Or share profile link
      cta: "Ver calendario",
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progress = (completedCount / totalSteps) * 100;

  if (completedCount === totalSteps) {
    return null; // Hide if all done
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Comienza con InmoApp</h2>
          <p className="text-sm text-muted-foreground">
            Completa estos pasos para configurar tu cuenta
          </p>
        </div>
        <div className="text-sm font-medium text-primary">
          {completedCount}/{totalSteps} completado
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-primary transition-all duration-500 ease-in-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-colors",
              step.completed
                ? "bg-primary/5 border-primary/20"
                : "bg-background border-border",
            )}
          >
            <div className="flex items-center gap-3">
              {step.completed ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "font-medium",
                  step.completed && "text-muted-foreground line-through",
                )}
              >
                {step.label}
              </span>
            </div>
            {!step.completed && (
              <Link
                href={step.href}
                className="text-sm font-medium text-primary hover:underline"
              >
                {step.cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
