"use client";

import { usePropertyWizardStore } from "@/lib/stores/property-wizard-store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "motion/react";

interface Step {
  id: number;
  label: string;
}

const steps: Step[] = [
  { id: 1, label: "Información" },
  { id: 2, label: "Ubicación" },
  { id: 3, label: "Características" },
  { id: 4, label: "Fotos" },
  { id: 5, label: "Revisión" },
];

export function StepIndicator() {
  const { currentStep } = usePropertyWizardStore();

  return (
    <div className="w-full py-6">
      <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-muted -z-10" />

        {/* Active Line Progress */}
        <motion.div
          className="absolute left-0 top-1/2 h-0.5 bg-primary -z-10"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
              <motion.div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-300",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary text-primary bg-background"
                      : "border-muted-foreground/30 text-muted-foreground bg-background"
                )}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{step.id}</span>
                )}
              </motion.div>
              <span
                className={cn(
                  "text-xs font-medium absolute top-10 w-24 text-center transition-colors duration-300",
                  isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
